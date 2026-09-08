"""language, plus the Combined source row.

Only SOURCE-INDEPENDENT facts go on `language`. Anything that changes when the
user switches classification authority - most importantly the parent - belongs
on language_source_attribute, which this module seeds with the 'Combined' row.
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_headers, read_table, to_int
from .vocab import (
    LANGUAGE_MODALITY,
    SOURCE_BCP,
    SOURCE_COMBINED,
    SOURCE_GLOTTOLOG,
    SOURCE_ISO,
    SOURCE_UNESCO,
)

ENTITY_TYPE = "Language"

# The parser in the frontend reads parts[13] and parts[14] from this file even
# though it has 11 columns, so viabilityConfidence and viabilityExplanation are
# always undefined at runtime and the Recommendation columns are never read.
# Asserting the width here means a future column change is caught loudly
# instead of silently shifting every field by one.
EXPECTED_COLUMNS = 11


def load(ds: Dataset, root: Path) -> None:
    path = root / "tc" / "languages.tsv"

    headers = read_headers(path)
    if len(headers) != EXPECTED_COLUMNS:
        ds.error(
            None,
            "languages.tsv",
            f"expected {EXPECTED_COLUMNS} columns, found {len(headers)}: "
            f"{headers}. Column positions may have shifted.",
        )

    combined_parents: list[tuple[str, str]] = []

    glottolog_rows: list[tuple[str, str, str | None]] = []
    # (language, parent) pairs that apply to ISO, BCP and UNESCO alike.
    short_code_parents: list[tuple[str, str]] = []

    for row in read_table(path):
        lid = row.get("Language Code")
        if not lid:
            continue

        display = row.get("Display Name") or lid
        name, subtitle = _split_subtitle(display)
        endonym = row.get("Endonym")

        ds.register_entity(
            lid, ENTITY_TYPE, code_display=lid, name_display=name,
            name_endonym=endonym,
        )
        ds.add_name(lid, ENTITY_TYPE, name, "display", language_tag="en")
        ds.add_name(lid, ENTITY_TYPE, endonym, "endonym")

        medium = row.get("Medium")
        modality = LANGUAGE_MODALITY.get(medium or "")
        if medium and modality is None:
            ds.warn(
                lid,
                "language.modality",
                f"{row.origin()}: unrecognised Medium {medium!r}; left NULL",
            )

        ds["language"].upsert(
            id=lid,
            name_canonical=name,
            name_subtitle=subtitle,
            name_endonym=endonym,
            modality=modality,
            primary_script_id=row.get("Biggest Script"),
            population_rough=to_int(row.raw("Population")),
            recommendation=row.get("Recommendation"),
            recommendation_reason=row.get("Recommendation Reason"),
            source_ref=path.name,
        )

        # Glottocode alias. Keyed on (alias_code, alias_kind) in the schema, so
        # a glottocode can only ever resolve to one language.
        glottocode = row.get("Glottocode")
        if glottocode:
            ds["language_code_alias"].upsert(
                language_id=lid, alias_code=glottocode, alias_kind="glottocode"
            )
            # Held for apply_glottolog_gaps(). The alias alone is not enough:
            # the frontend reads this column into Glottolog.code directly, and
            # column 9 into Glottolog.parentLanguageCode, so both have to reach
            # language_source_attribute or the API cannot serve them.
            glottolog_rows.append((lid, glottocode, row.get("Parent Glottocode")))

        parent = row.get("Parent Language")
        if parent:
            combined_parents.append((lid, parent))

        # is_manual_override is left unset here. It is NOT NULL DEFAULT false
        # in the schema, and the default is applied at COPY time, so that only
        # the overrides file ever writes true and no spurious false-to-true
        # conflict is recorded.
        ds["language_source_attribute"].upsert(
            language_id=lid, source=SOURCE_COMBINED, code=lid, name=name
        )

        # ISO, BCP and UNESCO are all seeded from THIS file, not from separate
        # source files. Two rules, both from the frontend parser:
        #
        #   1. A languoid only participates in these three sources if its OWN
        #      code is <= 3 characters. Glottocodes (8 chars) are excluded, so
        #      row absence here is meaningful rather than incidental.
        #   2. The parent carries over only if the PARENT's code is also <= 3
        #      characters. A glottocode parent is not an ISO parent.
        #
        # UNESCO has no file of its own anywhere in the dataset; this is the
        # only thing that populates it.
        if len(lid) <= 3:
            # ISO and BCP take only a code here; their authoritative names
            # arrive from iso-639-3.tab. UNESCO has no file of its own, so it
            # is the one that keeps this file's name.
            for source in (SOURCE_ISO, SOURCE_BCP):
                ds["language_source_attribute"].upsert(
                    language_id=lid, source=source, code=lid
                )
            ds["language_source_attribute"].upsert(
                language_id=lid, source=SOURCE_UNESCO, code=lid, name=name
            )
            if parent and len(parent) <= 3:
                short_code_parents.append((lid, parent))

    # ISO, BCP and UNESCO share this parent. It is the BASE, not a fallback:
    # the family file fills only what is still empty afterwards (??= in the
    # frontend), and the macrolanguage file cross-checks rather than assigns.
    #
    # These stay HERE rather than being deferred with the Combined ones. The
    # macrolanguage step in the authorities loader fills any ISO parent that is
    # still NULL when it runs, so deferring these past it would hand it 278
    # empty rows to fill and change which file wins - a behaviour change well
    # beyond the ordering bug being fixed.
    known = ds["language"].ids()
    for lid, parent in short_code_parents:
        if parent == lid:
            continue
        if parent not in known:
            # The parent is a language family, created later by the authorities
            # loader - the FP-035 ordering bug. Deferring the UNESCO half was
            # tried and REVERTED: those families never get a UNESCO row of
            # their own (addISOLanguageFamilyData writes families to Combined,
            # ISO and BCP but not UNESCO), so the deferred edge pointed at a
            # node outside its own tree. D10 could not assign a depth and its
            # structural check "depth 0 disagreeing with having no parent"
            # went from 0 to 9.
            #
            # The frontend holds the same value harmlessly, because there it is
            # a plain string with no tree to be consistent with. Here it is a
            # foreign key into a per-source hierarchy, so the mapper reproduces
            # it instead - see loadLanguagesFromApi's UNESCO fallback.
            continue
        for source in (SOURCE_ISO, SOURCE_BCP, SOURCE_UNESCO):
            ds["language_source_attribute"].upsert(
                language_id=lid, source=source, parent_language_id=parent
            )

    # The COMBINED parents are deferred. See apply_parents().
    _PENDING_PARENTS.append((path.name, combined_parents))
    # The Glottolog rows are deferred too. See apply_glottolog_gaps().
    _PENDING_GLOTTOLOG.append((path.name, glottolog_rows))


# Parent links parsed out of languages.tsv, held until every loader has run.
#
# THEY CANNOT BE APPLIED INSIDE load(). A parent is validated against
# ds["language"].ids(), and this loader runs THIRD - families639-5.tsv and
# glottolog.tsv are read by the authorities loader, which runs FOURTH. So a
# parent that is a language family was checked before it existed and dropped.
#
# That cost nine languages their parent, silently, including `pan` (Punjabi,
# 176.6M speakers), whose parent `inc` is a 639-5 family. Punjabi became a ROOT
# of the Combined tree rather than a descendant of Indo-European, which moved
# every figure that ranks or sums `ine`'s descendants: D9 reported Bhojpuri at
# 61.2M as Indo-European's largest descendant instead of Punjabi at 176.6M.
#
# The list is module-level rather than passed through, because LOADERS is a
# tuple of (label, callable) pairs with no shared state, and threading a
# context object through every loader to fix one ordering bug is a larger
# change than the bug warrants.
_PENDING_PARENTS: list[tuple[str, list[tuple[str, str]]]] = []

# languages.tsv's Glottocode / Parent Glottocode columns, held until
# glottolog.tsv has been read. See apply_glottolog_gaps().
_PENDING_GLOTTOLOG: list[tuple[str, list[tuple[str, str, str | None]]]] = []


def apply_parents(ds: Dataset) -> None:
    """Apply languages.tsv's COMBINED parent links, after every language exists.

    Called from the authorities loader, immediately after the two family files
    are read and BEFORE Glottolog and the manual overrides - those two
    legitimately overwrite these parents, and running this after them instead
    reverses that precedence and turns 296 silent overwrites into conflicts.

    A parent still unknown here is genuinely absent from every source file,
    which is worth a warning; before this was deferred the same warning also
    fired for families that simply had not been loaded yet.

    Only the Combined source is deferred. The ISO/BCP/UNESCO parents are still
    written inside load(), because the macrolanguage cross-check fills any ISO
    parent that is NULL when it runs and moving them past it would change which
    file wins for 278 languages.
    """
    known = ds["language"].ids()

    while _PENDING_PARENTS:
        filename, combined_parents = _PENDING_PARENTS.pop(0)

        for lid, parent in combined_parents:
            if parent not in known:
                ds.warn(
                    lid,
                    "language_source_attribute.parent_language_id",
                    f"{filename}: Combined parent {parent!r} of {lid!r} is not "
                    f"a known language; left NULL",
                )
                continue
            if parent == lid:
                continue  # lsa_not_own_parent
            ds["language_source_attribute"].upsert(
                language_id=lid, source=SOURCE_COMBINED, parent_language_id=parent
            )


def apply_glottolog_gaps(ds: Dataset) -> None:
    """Give a Glottolog attribute row to languages glottolog.tsv did not cover.

    Called from the authorities loader immediately AFTER _glottolog, and it only
    ever fills gaps - a language that already has a Glottolog row keeps it, so
    glottolog.tsv stays authoritative wherever the two files disagree.

    _glottolog() writes one row per node in glottolog.tsv, keyed on the
    glottocode found THERE. languages.tsv also carries a Glottocode column, and
    when the two disagree the language gets no row at all: `zho` points at
    `clas1255`, which glottolog.tsv lists as a family node of its own with no
    ISO code, so `clas1255` becomes its own languoid and `zho` is left with
    nothing. 56 languages are affected, the macrolanguages among them - `ara`,
    `aze`, `bal`, `fas`, `msa`, `grn`, `zho` - plus the private-use tags.

    Until now that was invisible, because the frontend merged glottolog.tsv
    itself and filled the field client-side. It stops being invisible the moment
    the browser stops doing that merge: `Glottolog.parentLanguageCode` for these
    56 exists in NO column, so the API cannot serve it and the family links
    disappear with no error. The alias table carries the code but has no room
    for a parent, and its (alias_code, alias_kind) key means a glottocode
    contested by two languages resolves to only one of them anyway - see the
    `zua`/`zem` case in FP-037.

    Parents are resolved through the same alias-or-id lookup the frontend uses,
    so a parent glottocode naming a node that exists under its ISO code still
    links up.
    """
    # glottocode -> language id, for resolving the parent column.
    #
    # A GLOTTOCODE THAT IS ITSELF A LANGUAGE ID WINS, and the order matters.
    # _glottolog builds the same map as "the node's ISO code if it has one,
    # otherwise its own glottocode", so a node with no ISO code stays under its
    # glottocode and the rows already in the table point at it that way -
    # `sini1245` is the parent of `clas1255`, `wxa`, `minn1248` and `och`.
    #
    # `sini1245` is ALSO an alias of `zhx`, so resolving through the aliases
    # first would make these 56 point at `zhx` while every pre-existing row
    # points at `sini1245`: the same parent under two different ids, which no
    # consumer would reconcile. The alias is the fallback, for a parent that
    # exists only under an ISO code.
    known_ids = ds["language"].ids()
    by_glottocode: dict[str, str] = {}
    for alias in ds["language_code_alias"].rows.values():
        if alias.get("alias_kind") == "glottocode":
            by_glottocode.setdefault(alias["alias_code"], alias["language_id"])

    # language_source_attribute's primary key is (language_id, source), so
    # membership is a direct key lookup rather than a scan.
    attributes = ds["language_source_attribute"].rows

    while _PENDING_GLOTTOLOG:
        filename, rows = _PENDING_GLOTTOLOG.pop(0)

        for lid, glottocode, parent_code in rows:
            if (lid, SOURCE_GLOTTOLOG) in attributes:
                continue  # glottolog.tsv already spoke; it wins

            parent_id = None
            if parent_code:
                parent_id = (
                    parent_code
                    if parent_code in known_ids
                    else by_glottocode.get(parent_code, parent_code)
                )
                if parent_id not in known_ids:
                    ds.warn(
                        lid,
                        "language_source_attribute.parent_language_id",
                        f"{filename}: Glottolog parent {parent_code!r} of "
                        f"{lid!r} is not a known language; left NULL",
                    )
                    parent_id = None
                elif parent_id == lid:
                    parent_id = None  # lsa_not_own_parent

            ds["language_source_attribute"].upsert(
                language_id=lid,
                source=SOURCE_GLOTTOLOG,
                code=glottocode,
                parent_language_id=parent_id,
            )



def _split_subtitle(display: str) -> tuple[str, str | None]:
    """Split 'Name (subtitle)' into its two parts.

    Only a trailing parenthetical counts, and only when it closes the string,
    so names that legitimately contain brackets mid-string are left alone.
    """
    if display.endswith(")") and "(" in display:
        head, _, tail = display.rpartition("(")
        head = head.strip()
        if head:
            return head, tail[:-1].strip() or None
    return display, None

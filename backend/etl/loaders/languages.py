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

    # Parents are applied after every language id is known, so a parent that
    # does not exist is reported here rather than silently surviving to become
    # a foreign-key failure with no file context.
    known = ds["language"].ids()
    for lid, parent in combined_parents:
        if parent not in known:
            ds.warn(
                lid,
                "language_source_attribute.parent_language_id",
                f"{path.name}: Combined parent {parent!r} of {lid!r} is not a "
                f"known language; left NULL",
            )
            continue
        if parent == lid:
            continue  # lsa_not_own_parent
        ds["language_source_attribute"].upsert(
            language_id=lid, source=SOURCE_COMBINED, parent_language_id=parent
        )

    # ISO, BCP and UNESCO share this parent. It is the BASE, not a fallback:
    # the family file fills only what is still empty afterwards (??= in the
    # frontend), and the macrolanguage file cross-checks rather than assigns.
    for lid, parent in short_code_parents:
        if parent not in known or parent == lid:
            continue
        for source in (SOURCE_ISO, SOURCE_BCP, SOURCE_UNESCO):
            ds["language_source_attribute"].upsert(
                language_id=lid, source=source, parent_language_id=parent
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

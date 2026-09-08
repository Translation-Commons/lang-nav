"""language_source_attribute - the per-authority classification rows.

Seven authorities disagree about what a language is, including who its parent
is, so the family tree has a different shape per source. That is why parent
lives here and not on `language`.

A note on the size of `language`. Glottolog alone has roughly 27,000 nodes, and
a source row cannot exist without a matching language row, so `language` ends
up as the UNION of every authority's languoids rather than just the 8,208 rows
in languages.tsv. source_ref records which file first created each row, which
keeps the 8,208 figure checkable:

    SELECT count(*) FROM language WHERE source_ref = 'languages.tsv';
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_table, split_multi, to_decimal, to_int
from .vocab import (
    ETHNOLOGUE_VITALITY_2012,
    ETHNOLOGUE_VITALITY_2025,
    GLOTTOLOG_LEVEL,
    ISO_SCOPE,
    ISO_STATUS,
    SOURCE_BCP,
    SOURCE_COMBINED,
    SOURCE_ETHNOLOGUE,
    SOURCE_GLOTTOLOG,
    SOURCE_ISO,
    SOURCE_UNESCO,
)

ENTITY_TYPE = "Language"

# BCP is ISO but preferring the two-letter 639-1 code, and UNESCO is seeded from
# the same short-code rows, so all three share ISO's hierarchy. The frontend does
# the same thing: ISO, BCP and UNESCO all receive parentISOCode. Setting the
# parent on ISO alone leaves BCP and UNESCO with no family tree at all.
ISO_TREE_SOURCES = (SOURCE_ISO, SOURCE_BCP, SOURCE_UNESCO)

# The ISO 639-5 families reach Combined, ISO and BCP but NOT UNESCO, matching
# addISOLanguageFamilyData. UNESCO holds only what languages.tsv seeds.
FAMILY_SOURCES = (SOURCE_COMBINED, SOURCE_ISO, SOURCE_BCP)


def load(ds: Dataset, root: Path) -> None:
    _iso_639_3(ds, root / "iso" / "iso-639-3.tab")
    # Before everything else that resolves a language id. The `locales` loader
    # runs after this one and drops any locale whose language is unknown, so a
    # retired code has to exist by now or five locales - chs_US, meg_NC,
    # nlr_AU, ppr_ID, yiy_AU - are silently lost.
    _retired_languages(ds, root / "iso" / "iso-639-3_Retirements.tab")
    _families_639_5(ds, root / "iso" / "families639-5.tsv")
    _families_to_languages(ds, root / "tc" / "familiesToLanguages.tsv")
    # HERE, and not at the end of the pipeline. languages.tsv's Combined
    # parents name families that the two calls above have just created, so they
    # could not be applied when languages.load() ran. They must still be
    # applied BEFORE Glottolog and the manual overrides, both of which
    # legitimately overwrite them - running this last instead made 296
    # previously-silent overwrites collide in the opposite order and report as
    # conflicts.
    from . import languages as _languages

    _languages.apply_parents(ds)
    _macrolanguages(ds, root / "iso" / "macrolanguages.tsv")
    iso_index = _frontend_iso_index(root)
    _glottolog(
        ds,
        root / "glottolog" / "glottolog.tsv",
        _curated_glottocode_map(root, iso_index),
        iso_index,
    )
    # Immediately after _glottolog, so glottolog.tsv wins wherever the two
    # files name a different glottocode, and before _glottocode_to_iso, which
    # only adds aliases.
    _languages.apply_glottolog_gaps(ds)
    _glottocode_to_iso(ds, root / "tc" / "glottocodeToISO.tsv")
    _ethnologue(ds, root / "sil")
    _combined_overrides(ds, root / "tc" / "languageFamilyCombinedOverrides.tsv")
    _unesco(ds)


def _ensure_language(
    ds: Dataset, lid: str, name: str | None, source_ref: str
) -> None:
    """Create the language and entity rows if this is the first sighting."""
    if lid not in ds["language"].ids():
        ds.register_entity(lid, ENTITY_TYPE, code_display=lid, name_display=name)
        ds["language"].upsert(
            id=lid, name_canonical=name or lid, source_ref=source_ref
        )
    else:
        ds.register_entity(lid, ENTITY_TYPE, code_display=lid, name_display=name)


# ---------------------------------------------------------------------------
# ISO 639-3 and BCP
# ---------------------------------------------------------------------------


def _iso_639_3(ds: Dataset, path: Path) -> None:
    """ISO and BCP rows.

    BCP is ISO but preferring the two-letter 639-1 code where one exists, so
    both rows are written from this one file and differ only in `code`.
    """
    for row in read_table(path):
        lid = row.get("Id")
        if not lid:
            continue

        name = row.get("Ref_Name")
        _ensure_language(ds, lid, name, path.name)
        ds.add_name(lid, ENTITY_TYPE, name, "source_name", source=SOURCE_ISO)

        scope = ISO_SCOPE.get(row.get("Scope") or "")
        code_6391 = row.get("Part1")

        ds["language_source_attribute"].upsert(
            language_id=lid,
            source=SOURCE_ISO,
            code=lid,
            name=name,
            scope=scope,
            notes=row.get("Comment"),
            code_6391=code_6391,
        )
        # BCP deliberately replaces the three-letter code with the two-letter
        # one where ISO 639-1 defines it. That is the entire difference between
        # BCP and ISO, so it is an override, not a disagreement.
        ds["language_source_attribute"].upsert(
            _override=True,
            language_id=lid,
            source=SOURCE_BCP,
            code=code_6391 or lid,
            name=name,
            scope=scope,
            code_6391=code_6391,
        )

        iso_status = ISO_STATUS.get(row.get("Language_Type") or "")
        if iso_status is not None:
            ds["language"].upsert(id=lid, iso_status=iso_status)

        for column, kind in (
            ("Part1", "iso639-1"),
            ("Part2b", "iso639-2b"),
            ("Part2t", "iso639-2t"),
        ):
            alias = row.get(column)
            if alias:
                ds["language_code_alias"].upsert(
                    language_id=lid, alias_code=alias, alias_kind=kind
                )


def _families_639_5(ds: Dataset, path: Path) -> None:
    """ISO 639-5 family codes. These are languoids in their own right.

    The family row is written to Combined, ISO and BCP but NOT UNESCO, which
    mirrors addISOLanguageFamilyData: UNESCO is limited to the languoids that
    languages.tsv seeds, and never gains the 639-5 families.
    """
    parents: list[tuple[str, str]] = []
    for row in read_table(path):
        fid = row.get("ISO 639-5")
        if not fid:
            continue
        raw_name = row.get("Language family name")
        # 'Austro-Asiatic languages' displays as 'Austro-Asiatic'.
        name = _trim_family_name(raw_name)
        _ensure_language(ds, fid, name, path.name)
        ds.add_name(fid, ENTITY_TYPE, name, "source_name", source=SOURCE_ISO)
        ds.add_name(fid, ENTITY_TYPE, raw_name, "alias", source=SOURCE_ISO)
        # 5 is the language_scope id for Family.
        for source in FAMILY_SOURCES:
            ds["language_source_attribute"].upsert(
                language_id=fid, source=source, code=fid, name=name, scope=5
            )
        parent = row.get("Parent")
        if parent:
            parents.append((fid, parent))

    known = ds["language"].ids()
    for fid, parent in parents:
        if parent in known and parent != fid:
            for source in FAMILY_SOURCES:
                ds["language_source_attribute"].upsert(
                    language_id=fid, source=source, parent_language_id=parent
                )


def _trim_family_name(name: str | None) -> str | None:
    """Drop the ' languages' and ' (family)' suffixes, as the frontend does."""
    if not name:
        return None
    import re as _re

    return _re.sub(r"\s+languages|\s+\(family\)", "", name, flags=_re.I).strip() or name


def _families_to_languages(ds: Dataset, path: Path) -> None:
    """Family -> member edges, one space-separated cell per family."""
    known = ds["language"].ids()
    missing = 0
    for row in read_table(path):
        family = row.get("ISO 639-5")
        if not family or family not in known:
            continue
        for member in split_multi(row.get("Constituents"), seps=" "):
            if member not in known:
                missing += 1
                continue
            if member == family:
                continue
            # ??= in the frontend: fill only where no parent is set yet.
            # languages.tsv already supplied one for most languoids and is
            # more specific than a family-wide assignment.
            for source in FAMILY_SOURCES:
                lsa = ds["language_source_attribute"].rows.get((member, source))
                if lsa is not None and lsa["parent_language_id"] is None:
                    lsa["parent_language_id"] = family
    if missing:
        ds.warn(
            None,
            "language_source_attribute.parent_language_id",
            f"{path.name}: {missing} family constituents are not known "
            f"languages; those edges were dropped",
        )


def _macrolanguages(ds: Dataset, path: Path) -> None:
    """Cross-check the macrolanguage file. Deliberately assigns nothing.

    addISOMacrolanguageData in the frontend writes no data at all: it compares
    the parent already in place against the macrolanguage relation and logs the
    difference. Assigning here instead would silently overwrite parents that
    languages.tsv and the family files had agreed on, and would fight the
    ??= semantics of the family step.

    The mismatches are real and worth surfacing, so they become findings
    rather than console noise.
    """
    known = ds["language"].ids()
    mismatched = 0
    for row in read_table(path):
        macro = row.get("M_Id")
        member = row.get("I_Id")
        if not macro or not member:
            continue
        if macro not in known or member not in known or macro == member:
            continue
        lsa = ds["language_source_attribute"].rows.get((member, SOURCE_ISO))
        if lsa is None:
            continue
        current = lsa["parent_language_id"]
        if current is None:
            lsa["parent_language_id"] = macro      # a genuine gap, fill it
        elif current != macro:
            mismatched += 1
    if mismatched:
        ds.warn(
            None,
            "language_source_attribute.parent_language_id",
            f"{path.name}: {mismatched} language(s) have an ISO parent that "
            f"disagrees with the macrolanguage file. Not overwritten; the "
            f"macrolanguage file is a cross-check, not the assignment.",
        )


# ---------------------------------------------------------------------------
# Glottolog
# ---------------------------------------------------------------------------


def _frontend_iso_index(root: Path) -> set[str]:
    """The codes that reach `languagesBySource.ISO` in the frontend.

    Two sources, and the second is not obvious:

    - every code in `iso-639-3.tab`, because addISODataToLanguages sets
      `ISO.code` from it and groupLanguagesBySource indexes on that;
    - a 639-5 family code ONLY IF it is absent from languages.tsv.
      addISOLanguageFamilyData creates a languoid for a family it cannot find
      and registers it in ISO, BCP and Combined - but when languages.tsv
      already has a row for that code it takes the else branch, which fills
      fields and never touches the ISO index.

    So `bnt` and `ine` are in it and `nah`, `ijo` and `kro` are not, even
    though all five are 639-5 families. That difference decides whether
    glottocodeToISO.tsv merges a glottocode onto them: `bant1294` becomes
    `bnt`, while `azte1234` stays a languoid of its own.
    """
    codes = {
        row.get("Id")
        for row in read_table(root / "iso" / "iso-639-3.tab")
        if row.get("Id")
    }
    in_languages_tsv = {
        row.get("Language Code")
        for row in read_table(root / "tc" / "languages.tsv")
        if row.get("Language Code")
    }
    for row in read_table(root / "iso" / "families639-5.tsv"):
        code = row.get("ISO 639-5")
        if code and code not in in_languages_tsv:
            codes.add(code)
    return codes


def _curated_glottocode_map(root: Path, iso_index: set[str]) -> dict[str, str]:
    """glottocode -> ISO code, from the two files that curate that equivalence.

    `glottolog.tsv` names an ISO code for most nodes but not all, and where it
    is silent this project says so itself, in two places:

    - `glottocodeToISO.tsv`, whose entire purpose is this mapping - the header
      is `Glottocode / ISO Code / Name`. `<contested>` is a marker, not a code.
    - `languages.tsv`'s Glottocode column, read the other way round.

    Both are human-curated statements that a Glottolog node and an ISO language
    are the same thing, and the frontend acts on them. Returned as one map so
    `_glottolog` can consult them where glottolog.tsv gives it nothing.
    """
    curated: dict[str, str] = {}

    for row in read_table(root / "tc" / "glottocodeToISO.tsv"):
        glottocode = row.get("Glottocode")
        iso = row.get("ISO Code")
        if not glottocode or not iso or glottocode.startswith("<"):
            continue
        # ONLY where the ISO code reaches the frontend's ISO index.
        #
        # addGlottologLanguages applies this file as
        # `languagesBySource.ISO[isoCode]`, so a mapping onto a code that is
        # not in that index finds nothing and never merges - the glottocode
        # stays a languoid of its own. See _frontend_iso_index for which codes
        # get there and why `bnt` does while `nah` does not.
        if iso not in iso_index:
            continue
        curated[glottocode] = iso

    # languages.tsv is the weaker source of the two: glottocodeToISO.tsv exists
    # for nothing else, so it wins where both name a code. setdefault, not [].
    for row in read_table(root / "tc" / "languages.tsv"):
        glottocode = row.get("Glottocode")
        lid = row.get("Language Code")
        if not glottocode or not lid:
            continue
        curated.setdefault(glottocode, lid)

    return curated


def _curated_glottocode_map(root: Path, iso_index: set[str]) -> dict[str, str]:
    """glottocode -> ISO code, from the two files that curate that equivalence.

    `glottolog.tsv` names an ISO code for most nodes but not all, and where it
    is silent this project says so itself, in two places:

    - `glottocodeToISO.tsv`, whose entire purpose is this mapping - the header
      is `Glottocode / ISO Code / Name`. `<contested>` is a marker, not a code.
    - `languages.tsv`'s Glottocode column, read the other way round.

    Both are human-curated statements that a Glottolog node and an ISO language
    are the same thing, and the frontend acts on them. Returned as one map so
    `_glottolog` can consult them where glottolog.tsv gives it nothing.
    """
    curated: dict[str, str] = {}

    for row in read_table(root / "tc" / "glottocodeToISO.tsv"):
        glottocode = row.get("Glottocode")
        iso = row.get("ISO Code")
        if not glottocode or not iso or glottocode.startswith("<"):
            continue
        # ONLY where the ISO code reaches the frontend's ISO index.
        #
        # addGlottologLanguages applies this file as
        # `languagesBySource.ISO[isoCode]`, so a mapping onto a code that is
        # not in that index finds nothing and never merges - the glottocode
        # stays a languoid of its own. See _frontend_iso_index for which codes
        # get there and why `bnt` does while `nah` does not.
        if iso not in iso_index:
            continue
        curated[glottocode] = iso

    # languages.tsv is the weaker source of the two: glottocodeToISO.tsv exists
    # for nothing else, so it wins where both name a code. setdefault, not [].
    for row in read_table(root / "tc" / "languages.tsv"):
        glottocode = row.get("Glottocode")
        lid = row.get("Language Code")
        if not glottocode or not lid:
            continue
        curated.setdefault(glottocode, lid)

    return curated


def _codes_only_in_retirements(retirements: Path, languages: Path) -> set[str]:
    """Retired ISO codes that are NOT languages in languages.tsv.

    The distinction matters. `adp`, `mhv`, `aam` and 200-odd others carry a
    retirement record AND a languages.tsv row - they are real languages here,
    and glottolog.tsv naming them is correct. Only a code that appears solely
    in the retirements file has no languoid of its own, and it is those the
    frontend gives a glottocode entry to instead.
    """
    known = {
        row.get("Language Code")
        for row in read_table(languages)
        if row.get("Language Code")
    }
    return {
        row.get("Id")
        for row in read_table(retirements)
        if row.get("Id") and row.get("Id") not in known
    }


def _glottolog(
    ds: Dataset, path: Path, curated: dict[str, str], iso_index: set[str]
) -> None:
    """Glottolog's ~27,000 nodes.

    Two passes. The first builds glottocode -> language id so that parent
    edges can be resolved without a second lookup per row; the second emits
    the rows. Two linear passes beat one pass plus a deferred fixup because
    the parent map is needed for every single row.
    """
    rows = list(read_table(path))

    # Pass 1: a glottolog node maps onto its ISO code when it has one, onto the
    # ISO code THIS PROJECT gives it when glottolog.tsv does not, and onto its
    # own glottocode only when nobody names one.
    #
    # The middle case is the whole point. Without it a node whose ISO Code cell
    # is empty becomes a language of its own even when languages.tsv or
    # glottocodeToISO.tsv says it IS an existing ISO language - `arab1395`
    # "Arabic" alongside `ara`, `azer1255` "Central Oghuz" alongside `aze`, 162
    # in total. The frontend has always merged these (addGlottologLanguages
    # finds the languoid already filed under that glottocode and fills it in
    # rather than creating one), because showing one language under several
    # classification schemes needs ONE object carrying several identities.
    # Commit 2c8607b7 added the mapping file for exactly that purpose.
    #
    # A self-mapping is skipped: `aben1250 -> aben1250` in languages.tsv says
    # only that the languoid is known by its glottocode, not that it is some
    # other language.
    # Every ISO code glottolog.tsv assigns directly. Gathered first because the
    # fallback below must not contradict one.
    taken = {
        row.get("ISO Code")
        for row in rows
        if row.get("Glottocode") and row.get("ISO Code")
    }

    code_to_id: dict[str, str] = {}
    for row in rows:
        glottocode = row.get("Glottocode")
        if not glottocode:
            continue
        iso = row.get("ISO Code")

        # RETIRED CODES KEEP THEIR GLOTTOCODE.
        #
        # glottolog.tsv names an ISO code for 226 nodes that no language here
        # has: 216 are RETIRED (`azr` Adzera, split into three; `mzf` Aiku,
        # split into four) and 10 are private-use `q...` tags. None is a live
        # ISO code.
        #
        # The frontend keeps BOTH: addGlottologLanguages finds nothing filed
        # under the glottocode and creates the languoid under the GLOTTOCODE,
        # while addISORetirementsToLanguages separately creates the retired
        # code as a SpecialCode entry. 192 of the glottocode ones are in the
        # default view.
        #
        # The same test covers glottolog.tsv's PRIVATE-USE codes. It puts `qbb`
        # in the ISO column of `oldl1238` Old Latin, and nine more in the `q`
        # range reserved for local use. None is in iso-639-3.tab, so none
        # reaches the frontend's ISO index either, and the frontend keys those
        # nodes by glottocode for exactly the same reason.
        #
        # `in iso_index`, NOT "is a known language": _retired_languages() runs
        # before this and creates all 221 retired codes, so by now they ARE
        # languages and an existence check would let every one through.
        #
        # Whether a withdrawn code should appear beside the languages that
        # replaced it is a data-quality question for the maintainers, and
        # answering it here would change what the site shows rather than what
        # the API serves.
        # `curated` carries languages.tsv column 2, which is the OTHER route:
        # the frontend files a languoid under its own glottocode there, so
        # addGlottologLanguages finds it and merges even when the ISO index has
        # nothing. `adp` reaches its node that way - it is a languages.tsv row
        # with the glottocode adap1234 and no iso-639-3.tab entry at all.
        if iso and iso not in iso_index and curated.get(glottocode) != iso:
            iso = None

        if not iso:
            mapped = curated.get(glottocode)
            # `taken` holds the ISO codes glottolog.tsv itself assigns, gathered
            # in the loop below. A curated mapping is only ever a FALLBACK for
            # a node glottolog.tsv leaves unnamed, so one that would hand this
            # node an ISO code glottolog.tsv has already given to a DIFFERENT
            # node is ignored.
            #
            # `zeem1243` is the case. glottocodeToISO.tsv line 141 maps it onto
            # `zem`, while languages.tsv gives `zem` the code `zeem1242` and
            # `zeem1243` to `zua`. Acting on the first would move `zem` off the
            # glottocode glottolog.tsv assigns it. That contradiction is FP-037
            # and belongs in the source files, not in a silent override here.
            if mapped and mapped != glottocode and mapped not in taken:
                iso = mapped
        code_to_id[glottocode] = iso if iso else glottocode

    # Pass 2
    for row in rows:
        glottocode = row.get("Glottocode")
        if not glottocode:
            continue
        lid = code_to_id[glottocode]
        name = row.get("Node Name")

        _ensure_language(ds, lid, name, path.name)
        ds.add_name(lid, ENTITY_TYPE, name, "source_name", source=SOURCE_GLOTTOLOG)

        if glottocode != lid:
            ds["language_code_alias"].upsert(
                language_id=lid, alias_code=glottocode, alias_kind="glottocode"
            )

        parent_code = row.get("Parent Glottocode")
        parent_id = code_to_id.get(parent_code) if parent_code else None

        ds["language_source_attribute"].upsert(
            language_id=lid,
            source=SOURCE_GLOTTOLOG,
            code=glottocode,
            name=name,
            scope=GLOTTOLOG_LEVEL.get(row.get("level") or ""),
            parent_language_id=parent_id if parent_id != lid else None,
        )

        lat = to_decimal(row.raw("latitude"))
        lon = to_decimal(row.raw("longitude"))
        if lat is not None and lon is not None:
            ds["language"].upsert(
                id=lid, latitude=lat, longitude=lon, coords_source=SOURCE_GLOTTOLOG
            )


def _retired_languages(ds: Dataset, path: Path) -> None:
    """Create a languoid for every retired ISO code that is not already one.

    Mirrors addISORetirementsToLanguages, which builds an entry with
    LanguageScope.SpecialCode, a Combined row carrying the retirement name, and
    an ISO row holding the code, whenever languagesBySource.ISO has none. 221
    codes take that branch - `fri`, `amd`, `jap`, and the rest withdrawn before
    they ever reached languages.tsv.

    Without these the two paths hold different languoids, which is half of
    FP-038. They are SpecialCode, so the default view - Macrolanguage and
    Language - does not show them: this changes what the API serves, not what
    the site displays.

    The retirement FACTS (reason, remedy, change_to, effective date) are loaded
    separately by satellites._retirements, which is where language_retirement
    lives. Only the languoid is created here, and only because it has to exist
    before the locales loader validates against it.
    """
    from .vocab import LANGUAGE_SCOPE_BY_NAME, SOURCE_COMBINED, SOURCE_ISO

    special_code = LANGUAGE_SCOPE_BY_NAME["SpecialCode"]
    known = ds["language"].ids()

    for row in read_table(path):
        lid = row.get("Id")
        if not lid or lid in known:
            continue

        name = row.get("Ref_Name")
        # scope is per-source on language_source_attribute; `language` has no
        # scope column of its own.
        _ensure_language(ds, lid, name, path.name)
        ds["language_source_attribute"].upsert(
            language_id=lid,
            source=SOURCE_COMBINED,
            code=lid,
            name=name,
            scope=special_code,
        )
        ds["language_source_attribute"].upsert(
            language_id=lid, source=SOURCE_ISO, code=lid
        )
        known.add(lid)


def _glottocode_to_iso(ds: Dataset, path: Path) -> None:
    """Manual glottocode-to-ISO mappings, including '<contested>' placeholders."""
    known = ds["language"].ids()
    for row in read_table(path):
        glottocode = row.get("Glottocode")
        iso = row.get("ISO Code")
        if not glottocode or not iso or iso not in known:
            continue
        if glottocode.startswith("<"):
            # '<contested>' is a marker, not a code.
            continue
        ds["language_code_alias"].upsert(
            language_id=iso, alias_code=glottocode, alias_kind="glottocode"
        )


# ---------------------------------------------------------------------------
# Ethnologue and UNESCO
# ---------------------------------------------------------------------------

# Present in ethnologue2012.tsv for rows that are not in the Ethnologue dataset
# at all. VitalityParsing.ts:56-57 returns undefined for it WITHOUT logging,
# unlike every other unrecognised value, so warning about it here would turn a
# documented marker into thousands of findings on the day the file arrives.
ETH_2012_NOT_IN_DATASET = "7.7"


def _eth_vitality(
    ds: Dataset, language_id: str, raw: str | None, scale: dict[str, int]
) -> int | None:
    """One Ethnologue vitality cell, mapped onto its 0-9 scale.

    An unrecognised spelling is warned about and dropped rather than guessed
    at. The scales are ordinal and D10 takes a maximum over them, so a wrong
    guess does not stay local: it propagates up the family tree and raises
    every ancestor with it.
    """
    value = (raw or "").strip().lower()
    if not value or value == ETH_2012_NOT_IN_DATASET:
        return None
    if value not in scale:
        ds.warn(
            language_id,
            "language_source_attribute.eth_vitality",
            f"unrecognised Ethnologue vitality {raw!r}, left unset",
        )
        return None
    return scale[value]


def _ethnologue(ds: Dataset, sil_dir: Path) -> None:
    """Ethnologue rows.

    Both upstream files are header-only in this repository, so this
    legitimately produces zero rows. Recorded so that an empty Ethnologue
    source reads as a known upstream gap rather than a loader bug.

    The two vitality columns are mapped even though nothing can currently
    reach them. D10 rolls eth_vitality_2012 and eth_vitality_2025 up the
    family tree and averages them into language.vitality_meta, and until this
    was added neither column had an assignment anywhere in the ETL - so the
    day these files gain rows, D10 would have kept reporting an empty
    Ethnologue axis and looked like the broken step. A gap in the loader and a
    gap in the data are indistinguishable once both are zero.
    """
    known = ds["language"].ids()
    produced = 0

    for row in read_table(sil_dir / "ethnologue2025.tsv"):
        lid = row.get("ISO Code")
        if not lid or lid not in known:
            continue
        ds["language_source_attribute"].upsert(
            language_id=lid,
            source=SOURCE_ETHNOLOGUE,
            code=lid,
            name=row.get("Language Name"),
            eth_population=to_int(row.raw("Population Size")),
            eth_vitality_2025=_eth_vitality(
                ds, lid, row.raw("Vitality"), ETHNOLOGUE_VITALITY_2025
            ),
            eth_digital_support=to_int(row.raw("Digital Support")),
        )
        produced += 1

    for row in read_table(sil_dir / "ethnologue2012.tsv"):
        lid = row.get("unique_join_code")
        if not lid or lid not in known:
            continue
        ds["language_source_attribute"].upsert(
            language_id=lid,
            source=SOURCE_ETHNOLOGUE,
            code=lid,
            eth_vitality_2012=_eth_vitality(
                ds, lid, row.raw("Eth_Language Status"), ETHNOLOGUE_VITALITY_2012
            ),
        )
        produced += 1

    if produced == 0:
        ds.warn(
            None,
            "language_source_attribute.source",
            "Ethnologue produced 0 rows: sil/ethnologue2012.tsv and "
            "sil/ethnologue2025.tsv are header-only in this repository. "
            "This is an upstream data gap, not a loader failure.",
        )


def _unesco(ds: Dataset) -> None:
    """Sanity check on UNESCO, which has no source file of its own.

    UNESCO rows are seeded entirely from languages.tsv, in the languages
    loader, for every languoid whose code is <= 3 characters. There is no
    UNESCO file anywhere in the dataset and there never was. This function
    exists only to catch a regression: if that seeding ever stops happening,
    UNESCO silently becomes an empty classification source, and a user
    selecting it sees a blank site rather than an error.
    """
    produced = sum(1 for _, source in ds["language_source_attribute"].rows
                   if source == SOURCE_UNESCO)
    if produced == 0:
        ds.error(
            None,
            "language_source_attribute.source",
            "UNESCO produced 0 rows. It is seeded from languages.tsv for codes "
            "of 3 characters or fewer, so zero rows means that seeding broke, "
            "not that a file is missing.",
        )


def _combined_overrides(ds: Dataset, path: Path) -> None:
    """Manual Combined-hierarchy fixes. Applied LAST so they win.

    is_manual_override tells a later ETL run not to clobber these.
    """
    from .vocab import SOURCE_COMBINED

    known = ds["language"].ids()
    for row in read_table(path):
        parent = row.get("parentLanguageCode")
        child = row.get("childLanguageCode")
        if not parent or not child:
            continue
        if parent not in known or child not in known or parent == child:
            # Attach the finding to whichever id EXISTS. This warning fires
            # precisely when one of them does not, and data_quality_finding
            # .entity_id is a foreign key onto entity - so reporting it against
            # the missing id aborts the whole load with a ForeignKeyViolation,
            # after the --fresh truncate has already emptied the database.
            #
            # `nort2899` is the live case: glottocodeToISO.tsv and languages.tsv
            # both map it onto `uun`, so _glottolog now merges it away and the
            # override file's line 14 names an id that no longer exists.
            subject = child if child in known else parent
            ds.warn(
                subject if subject in known else None,
                "language_source_attribute.parent_language_id",
                f"{row.origin()}: override {parent!r} -> {child!r} references "
                f"an unknown language; skipped",
            )
            continue
        # The parent must also EXIST IN THE COMBINED TREE, not merely be a
        # language. Four overrides name Glottolog-only family nodes -
        # lahn1241 Greater Panjabic, arak1255 Arakanese-Marma, newa1247 Newar,
        # chep1244 Chepangic - which have a Glottolog row and no Combined one.
        # Writing the edge anyway left the child pointing at a node absent from
        # its own tree: depth stayed 0 while parent_language_id was set, which
        # is the invariant `D10 depth 0 disagreeing with having no parent`
        # asserts.
        #
        # The frontend already refuses these. setCombinedParent() requires both
        # child.Combined and parent.Combined and returns early otherwise, so
        # skipping here is what makes the two paths agree.
        if (parent, SOURCE_COMBINED) not in ds["language_source_attribute"].rows:
            ds.warn(
                child,
                "language_source_attribute.parent_language_id",
                f"{row.origin()}: override parent {parent!r} of {child!r} has "
                f"no Combined row of its own; skipped, matching the frontend",
            )
            continue
        ds["language_source_attribute"].upsert(
            language_id=child,
            source=SOURCE_COMBINED,
            parent_language_id=parent,
            notes=row.get("notes"),
            is_manual_override=True,
        )

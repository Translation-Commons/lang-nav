"""locale, plus the two files that add columns to it.

A locale is simultaneously a junction (language x territory x script x variants)
and an entity with its own attributes, which is why it cannot be a pure link
table. The composite id is decomposed into real foreign keys so joins are
indexable, and the id string is ALSO kept because it is the user-facing,
URL-shareable identifier used throughout the app.
"""

from __future__ import annotations

import re
from pathlib import Path

from ..registry import Dataset
from ..sources import read_table, to_bool, to_int
from .vocab import OFFICIAL_STATUS, POPULATION_SOURCE

ENTITY_TYPE = "Locale"
LOCALE_SOURCE_STABLE = "StableDatabase"

_SCRIPT_RE = re.compile(r"^[A-Z][a-z]{3}$")
_TERRITORY_RE = re.compile(r"^([A-Z]{2}|[0-9]{3})$")

# The source records protection as prose, not a number, but the schema wants an
# ordinal 1-4. This ordering is an ETL INTERPRETATION, from weakest to
# strongest commitment under the Charter. If the maintainers disagree, this map
# is the only place to change.
ECRML_PROTECTION = {
    "Part II (Article 7.5)": 1,
    "Part II (Article 7)": 2,
    "Part II (Article 7) or Part II (Article 7) and Part III (Articles 8-14)": 3,
    "Part II (Article 7) and Part III (Articles 8-14)": 4,
}


def parse_locale_id(locale_id: str) -> tuple[str, str | None, str | None, list[str]]:
    """Split 'zho_Hant_TW_tailo' into language, script, territory, variants.

    Position is not enough on its own: script and territory are both optional,
    so each part is matched by shape. Variant ORDER is preserved because
    slv_Latn_SI_bohoric_nedis is a different string from the reverse.
    """
    parts = locale_id.split("_")
    language = parts[0]
    script: str | None = None
    territory: str | None = None
    i = 1

    if i < len(parts) and _SCRIPT_RE.match(parts[i]):
        script = parts[i]
        i += 1
    if i < len(parts) and _TERRITORY_RE.match(parts[i]):
        territory = parts[i]
        i += 1

    variants = [p.lower() for p in parts[i:] if p]
    return language, script, territory, variants


def load(ds: Dataset, root: Path) -> None:
    _core(ds, root / "tc" / "locales.tsv")
    _indigeneity(ds, root / "tc" / "indigeneity.tsv")
    _ecrml(ds, root / "other_sources" / "ecrml.tsv")


def _core(ds: Dataset, path: Path) -> None:
    known_languages = ds["language"].ids()
    pending_variants: list[tuple[str, list[str]]] = []

    for row in read_table(path):
        lid = row.get("BCP-47 Locale")
        if not lid:
            continue

        language, script, territory, variants = parse_locale_id(lid)
        if language not in known_languages:
            ds.warn(
                lid,
                "locale.language_id",
                f"{row.origin()}: locale {lid!r} references unknown language "
                f"{language!r}; row dropped because language_id is NOT NULL",
            )
            continue

        if (lid,) in ds["locale"].rows:
            # The merge layer would fold these together silently. A repeated
            # locale id is a source-data error, so it is reported instead.
            ds.warn(
                lid,
                "locale.id",
                f"{row.origin()}: locale {lid!r} is listed more than once in "
                f"{path.name}; the rows were merged",
            )

        name = row.get("Locale Display Name")
        endonym = row.get("Native Locale Name")

        ds.register_entity(
            lid, ENTITY_TYPE, code_display=lid, name_display=name,
            name_endonym=endonym,
        )
        ds.add_name(lid, ENTITY_TYPE, name, "display", language_tag="en")
        ds.add_name(lid, ENTITY_TYPE, endonym, "endonym")

        status = row.get("Official Status")
        if status and status not in OFFICIAL_STATUS:
            ds.warn(
                lid,
                "locale.official_status",
                f"{row.origin()}: unrecognised Official Status {status!r}; left NULL",
            )
            status = None

        pop_source = row.get("Population Source")
        if pop_source and pop_source not in POPULATION_SOURCE:
            ds.warn(
                lid,
                "locale.pop_speaking_source",
                f"{row.origin()}: unrecognised Population Source "
                f"{pop_source!r}; left NULL. This usually means the row's "
                f"columns are misaligned.",
            )
            pop_source = None

        ds["locale"].upsert(
            id=lid,
            language_id=language,
            script_id=script,
            territory_id=territory,
            locale_source=LOCALE_SOURCE_STABLE,
            # Ordered, so roh_CH_SURSILV and roh_CH_VALLADER stay distinct.
            variant_key=".".join(variants),
            name_endonym=endonym,
            official_status=status,
            pop_speaking_unadjusted=to_int(row.raw("Population")),
            pop_speaking_source=pop_source,
            source_ref=path.name,
        )

        if variants:
            pending_variants.append((lid, variants))

    # Variants are attached after the variant table is loaded, so this defers
    # to a second phase. Stored on the dataset rather than recomputed.
    ds.pending_locale_variants = pending_variants  # type: ignore[attr-defined]


def attach_variants(ds: Dataset) -> None:
    """Second phase: link locales to variants once both tables exist.

    Called by the orchestrator AFTER the variant loader has run, because
    locale_variant has required foreign keys in both directions.
    """
    pending = getattr(ds, "pending_locale_variants", [])
    known = ds["variant"].ids()
    missing: set[str] = set()

    for locale_id, variants in pending:
        for position, variant in enumerate(variants, start=1):
            if variant not in known:
                missing.add(variant)
                continue
            ds["locale_variant"].upsert(
                locale_id=locale_id, variant_id=variant, position=position
            )

    if missing:
        ds.warn(
            None,
            "locale_variant.variant_id",
            f"{len(missing)} locale variant subtag(s) are not in the IANA "
            f"registry and were dropped: {sorted(missing)[:10]}",
        )


def _index_by_language_territory(ds: Dataset) -> dict[tuple[str, str], str]:
    """Build (language, territory) -> locale id once, instead of scanning per row.

    indigeneity.tsv and ecrml.tsv are both keyed by a language/territory pair
    rather than by locale id. Scanning the ~10,800 locales for each of the
    ~4,100 rows in those two files would be roughly 44 million comparisons;
    one index makes it a hash lookup per row.
    """
    index: dict[tuple[str, str], str] = {}
    for (locale_id,), row in ds["locale"].rows.items():
        if row["locale_source"] != LOCALE_SOURCE_STABLE:
            continue
        territory = row["territory_id"]
        if territory is None:
            continue
        index.setdefault((row["language_id"], territory), locale_id)
    return index


def _indigeneity(ds: Dataset, path: Path) -> None:
    index = _index_by_language_territory(ds)
    unmatched = 0

    for row in read_table(path):
        language = row.get("Language ISO")
        territory = row.get("Territory ISO")
        if not language or not territory:
            continue

        locale_id = index.get((language, territory))
        if locale_id is None:
            unmatched += 1
            continue

        ds["locale"].upsert(
            id=locale_id,
            lang_formed_here=to_bool(row.raw("LanguageFormedInThisRegion")),
            # The source file misspells this header as "HistoricPresense".
            # Corrected here rather than in the schema.
            historic_presence=to_bool(row.raw("HistoricPresense")),
        )

    if unmatched:
        ds.warn(
            None,
            "locale.historic_presence",
            f"{path.name}: {unmatched} indigeneity rows had no matching "
            f"StableDatabase locale and were dropped",
        )


def _ecrml(ds: Dataset, path: Path) -> None:
    index = _index_by_language_territory(ds)
    unmatched = 0
    level_column = (
        "Level of protection under the Charter "
        "(Articles applying to the language concerned)"
    )

    for row in read_table(path):
        language = row.get("Language Code")
        territory = row.get("isoRegionCode")
        if not language or not territory:
            continue

        locale_id = index.get((language, territory))
        if locale_id is None:
            unmatched += 1
            continue

        text = row.get(level_column)
        level = ECRML_PROTECTION.get(text or "")
        if text and level is None:
            ds.warn(
                locale_id,
                "locale.ecrml_protection",
                f"{row.origin()}: unrecognised protection level {text!r}; left NULL",
            )
        if level is not None:
            ds["locale"].upsert(id=locale_id, ecrml_protection=level)

    if unmatched:
        ds.warn(
            None,
            "locale.ecrml_protection",
            f"{path.name}: {unmatched} ECRML rows had no matching "
            f"StableDatabase locale and were dropped",
        )

"""The satellite tables: UDHR, Wikipedia, CLDR coverage, retirements, names.

Also the place where source files with no target table are recorded. Three
files under the data directory describe digital support (Google Translate, iOS,
Windows 11 language packs) and the schema has nowhere to put them; saying so
explicitly is more useful than skipping them quietly.
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_table, split_multi, to_bool, to_date, to_decimal, to_int
from .vocab import CLDR_LEVEL, SOURCE_CLDR, WIKIPEDIA_STATUS

LANGUAGE = "Language"


def load(ds: Dataset, root: Path) -> None:
    _udhr(ds, root / "tc" / "udhr.tsv")
    _wikipedias(ds, root / "tc" / "wikipedias.tsv")
    _cldr_coverage(ds, root / "unicode" / "cldrCoverage.tsv")
    _retirements(ds, root / "iso" / "iso-639-3_Retirements.tab")
    _french_names(ds, root / "other_sources" / "languageNamesFrench.tsv")
    _unmapped(ds)


def _udhr(ds: Dataset, path: Path) -> None:
    """One language may have many UDHR translations."""
    known = ds["language"].ids()
    for row in read_table(path):
        code_path = row.get("Language Path")
        if not code_path:
            continue
        # 'som/afas1238' - the last segment is the most specific languoid.
        language_id = code_path.split("/")[-1]
        if language_id not in known:
            ds.warn(
                language_id,
                "language_udhr.language_id",
                f"{row.origin()}: UDHR path {code_path!r} resolves to unknown "
                f"language {language_id!r}; row dropped",
            )
            continue
        name = row.get("Name")
        if not name:
            continue
        # The unique index treats a NULL variant as '', so normalise here to
        # keep the in-memory key and the database key in agreement.
        ds["language_udhr"].upsert(
            language_id=language_id,
            language_code_path=code_path,
            name=name,
            variant=row.get("Variant") or "",
            document_url=row.get("DocumentURL"),
        )


def _wikipedias(ds: Dataset, path: Path) -> None:
    known_languages = ds["language"].ids()
    known_locales = ds["locale"].ids()
    known_scripts = ds["writing_system"].ids()
    unsupported_status: set[str] = set()

    for row in read_table(path):
        subdomain = row.get("WP code")
        if not subdomain:
            continue

        status = row.get("Status")
        if status and status not in WIKIPEDIA_STATUS:
            unsupported_status.add(status)
            status = None

        locale_codes = split_multi(row.get("Locale Code(s)"), seps=",")
        locale_id = next((c for c in locale_codes if c in known_locales), None)
        language_id = next(
            (c for c in locale_codes if c in known_languages), None
        )
        if language_id is None and locale_id is not None:
            language_id = ds["locale"].rows[(locale_id,)]["language_id"]

        ds["wikipedia_edition"].upsert(
            wikipedia_subdomain=subdomain,
            locale_id=locale_id,
            language_id=language_id,
            title_english=row.get("Title"),
            title_local=row.get("Local Title (formatted)"),
            status=status,
            language_name=row.get("Language"),
            articles=to_int(row.raw("Articles")),
            active_users=to_int(row.raw("Active Users")),
            url=row.get("URL"),
        )

        script = row.get("Script (ISO 15924 code)")
        if script and script in known_scripts:
            ds["wikipedia_edition_script"].upsert(
                wikipedia_subdomain=subdomain, script_id=script
            )

    if unsupported_status:
        ds.warn(
            None,
            "wikipedia_edition.status",
            f"{path.name}: status value(s) {sorted(unsupported_status)} are not "
            f"in the wikipedia_status enum ('Active', 'Closed', 'Incubator') "
            f"and were left NULL. The enum needs extending to hold them.",
        )


def _cldr_coverage(ds: Dataset, path: Path) -> None:
    """CLDR coverage, plus the CLDR source rows.

    The 'Language' column holds BCP-47 tags, so some rows ('hi_Latn',
    'zh_Hant') identify a locale rather than a language. Those cannot key a
    table whose primary key is language_id, so they are reported.
    """
    known_languages = ds["language"].ids()
    known_scripts = ds["writing_system"].ids()
    known_territories = ds["territory"].ids()
    locale_shaped: list[str] = []

    # This file's preamble is plain prose, not '#'-prefixed, so the header is
    # pinned explicitly.
    for row in read_table(path, header_startswith="Language\t"):
        code = row.get("Language")
        if not code:
            continue
        if code not in known_languages:
            if "_" in code:
                locale_shaped.append(code)
            continue

        def level(column: str) -> str | None:
            value = row.get(column)
            if value and value not in CLDR_LEVEL:
                return None
            return value

        script = row.get("Script")
        territory = row.get("Default Region")

        ds["language_cldr_coverage"].upsert(
            language_id=code,
            explicit_script_id=script if script in known_scripts else None,
            script_default_id=script if script in known_scripts else None,
            territory_default_id=(
                territory if territory in known_territories else None
            ),
            count_of_cldr_locales=to_int(row.raw("№ Locales")),
            target_coverage_level=level("Target Level"),
            actual_coverage_level=level("Computed Level"),
            in_icu=bool(row.get("ICU")),
            pct_values_confirmed=to_decimal(row.raw("Confirmed")),
            pct_modern_complete=to_decimal(row.raw("🄼%")),
            pct_moderate_complete=to_decimal(row.raw("ⓜ%")),
            pct_basic_complete=to_decimal(row.raw("ⓑ%")),
            pct_core_complete=to_decimal(row.raw("ⓒ%")),
        )

        for feature in split_multi(row.get("Missing Features"), seps=","):
            ds["language_cldr_missing_feature"].upsert(
                language_id=code, feature=feature
            )

        ds["language_source_attribute"].upsert(
            language_id=code,
            source=SOURCE_CLDR,
            code=code,
            name=row.get("English Name"),
        )
        ds.add_name(
            code, LANGUAGE, row.get("English Name"), "source_name",
            language_tag="en", source=SOURCE_CLDR,
        )
        ds.add_name(code, LANGUAGE, row.get("Native Name"), "endonym", source=SOURCE_CLDR)

    if locale_shaped:
        ds.warn(
            None,
            "language_cldr_coverage.language_id",
            f"{path.name}: {len(locale_shaped)} row(s) key on a locale tag "
            f"rather than a language and cannot be stored in a table keyed by "
            f"language_id: {sorted(locale_shaped)[:10]}",
        )


def _retirements(ds: Dataset, path: Path) -> None:
    known = ds["language"].ids()
    for row in read_table(path):
        lid = row.get("Id")
        if not lid or lid not in known:
            continue
        change_to = row.get("Change_To")
        ds["language_retirement"].upsert(
            language_id=lid,
            name=row.get("Ref_Name"),
            reason=(row.get("Ret_Reason") or "")[:1] or None,
            change_to_language_id=change_to if change_to in known else None,
            remedy=row.get("Ret_Remedy"),
            effective_date=to_date(row.get("Effective")),
        )
        # Also recorded on the ISO source row, where retirement is an ISO fact.
        from .vocab import SOURCE_ISO

        ds["language_source_attribute"].upsert(
            language_id=lid,
            source=SOURCE_ISO,
            retirement_reason=(row.get("Ret_Reason") or "")[:1] or None,
        )


def _french_names(ds: Dataset, path: Path) -> None:
    """The French name of each language.

    This lands on language.name_french AND in entity_name. That duplication is
    deliberate and documented in the schema, but it only holds while French is
    the ONLY translation language. A second one means dropping the column.
    """
    known = ds["language"].ids()
    for row in read_table(path, header_startswith="Code\t"):
        lid = row.get("Code")
        name = row.get("Nom en français")
        if not lid or not name or lid not in known:
            continue
        ds["language"].upsert(id=lid, name_french=name)
        ds.add_name(lid, LANGUAGE, name, "translation", language_tag="fr")


def _unmapped(ds: Dataset) -> None:
    """Source files with no destination in the current schema."""
    ds.note_unmapped(
        "google/gtranslate.tsv",
        "Google Translate availability. No table models per-platform digital "
        "support; the only related column is "
        "language_source_attribute.eth_digital_support, which is Ethnologue's "
        "1-5 scale and a different thing.",
    )
    ds.note_unmapped(
        "other_sources/ios.tsv",
        "iOS system language availability. Same gap as gtranslate.tsv.",
    )
    ds.note_unmapped(
        "other_sources/win11_language_packs.tsv",
        "Windows 11 language pack availability. Same gap as gtranslate.tsv.",
    )
    ds.note_unmapped(
        "wiki/map_countries.svg, wiki/map_world.svg",
        "Map assets, served directly to the browser. Not database data.",
    )

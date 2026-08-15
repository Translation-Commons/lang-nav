"""census and census_language_estimate, from 112 files across four directories.

The format is the most complex in the dataset. ONE FILE IS MANY CENSUSES: each
data COLUMN is a separate survey with its own methodology, population base and
citation. Canada 2021 asked four different language questions, so ca2021.tsv
produces four census rows.

Layout:

    #key <TAB> default <TAB> col2 <TAB> col3 ...     metadata block
    Language Code <TAB> Name <TAB> col2 <TAB> col3   header
    eng <TAB> English <TAB> 31,628,570 <TAB> ...     data

Column 1 of a metadata line is a default applying to every census in the file;
columns 2..N override it per census. Header columns beginning with '#' are
context for a human reader and are excluded from the load entirely.
"""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

from ..registry import Dataset
from ..sources import clean, to_date, to_decimal, to_int
from .vocab import COLLECTOR_TYPE, LANGUAGE_USE, is_ignored_language_code
from .organizations import org_id

ENTITY_TYPE = "Census"

CENSUS_DIRECTORIES = ("official", "data.un.org", "unofficial", "axl")

# The 37 recognised metadata keys. An unrecognised key is reported rather than
# silently ignored, because a typo in a key means a whole field is lost.
METADATA_FIELDS = {
    "codeDisplay", "nameDisplay", "isoRegionCode", "yearCollected",
    "languageUse", "proficiency", "acquisitionOrder", "domain",
    "population", "populationSource", "populationSurveyed",
    "populationWithPositiveResponses", "sampleRate", "responsesPerIndividual",
    "languagesIncluded", "geographicScope", "age", "gender", "nationality",
    "residenceBasis", "quantity", "notes",
    "collectorType", "collectorName", "collectorNameShort", "author",
    "presentedBy",
    "url", "datePublished", "dateAccessed", "documentName", "sectionName",
    "tableName", "columnName", "citation",
}

# Split on '/' only when it is not inside parentheses, so that a name like
# 'Cree (Plains/Woods)' is not torn apart.
_CODE_SPLIT = re.compile(r"/(?![^(]*\))")
_NUMBER_NOISE = re.compile(r"[,%\s]")


def load(ds: Dataset, root: Path) -> None:
    census_root = root / "census"
    paths = _census_paths(census_root)
    id_prefixes = _assign_id_prefixes(paths)

    for path in paths:
        _load_file(ds, path, id_prefixes[path])

    _misc_population_records(ds, census_root / "misc_pop_records.tsv")


def _census_paths(census_root: Path) -> list[Path]:
    """Resolve every census file from the per-directory manifests."""
    paths: list[Path] = []
    for directory in CENSUS_DIRECTORIES:
        manifest = census_root / directory / "censusList.txt"
        if not manifest.is_file():
            continue
        for line in manifest.read_text(encoding="utf-8-sig").split("\n"):
            stem = line.strip()
            if not stem:
                continue
            path = census_root / directory / f"{stem}.tsv"
            if path.is_file():
                paths.append(path)
    return paths


def _assign_id_prefixes(paths: list[Path]) -> dict[Path, str]:
    """Choose the shortest unambiguous id stem for each file.

    Census ids are natural keys that appear in URLs, so the short form
    'ca2021.2' is preferred. But census/official/id.tsv and
    census/data.un.org/id.tsv share a stem, so colliding stems are qualified
    with their directory. Deterministic, and only the colliding files pay.
    """
    stem_counts = Counter(p.stem for p in paths)
    return {
        p: (p.stem if stem_counts[p.stem] == 1 else f"{p.parent.name}.{p.stem}")
        for p in paths
    }


def _data_columns(header_line: str) -> list[int]:
    """Indices of the columns that hold census data.

    Columns 0 and 1 are the metadata key and its default. A header cell
    starting with '#' marks a context column that must not become a census.
    """
    cells = header_line.split("\t")
    return [
        i
        for i, cell in enumerate(cells)
        if i >= 2 and not cell.strip().startswith("#")
    ]


def _load_file(ds: Dataset, path: Path, id_prefix: str) -> None:
    lines = path.read_text(encoding="utf-8-sig").split("\n")
    if not lines or not lines[0].strip():
        ds.warn(None, "census", f"{path.name}: file is empty; skipped")
        return

    columns = _data_columns(lines[0])
    if not columns:
        ds.warn(
            None,
            "census",
            f"{path.name}: no census data columns found; skipped",
        )
        return

    censuses: list[dict] = [
        {"id": f"{id_prefix}.{i + 1}", "quantity": "count", "collector_type": "Unknown"}
        for i in range(len(columns))
    ]

    end_of_metadata = _parse_metadata(ds, path, lines, columns, censuses)
    kept = _register_censuses(ds, path, censuses)
    if kept:
        _parse_language_rows(ds, path, lines[end_of_metadata:], columns, censuses, kept)


def _parse_metadata(
    ds: Dataset, path: Path, lines: list[str], columns: list[int], censuses: list[dict]
) -> int:
    """Fill the census dicts from the '#'-prefixed block. Returns its end line."""
    line_no = 0
    for line_no, line in enumerate(lines):
        if line.startswith("##") or line.strip() == "":
            continue
        if not line.startswith("#"):
            break

        parts = [p.strip() for p in line.split("\t")]
        key = parts[0][1:]
        if key not in METADATA_FIELDS:
            ds.warn(
                None,
                "census",
                f"{path.name}:{line_no + 1}: unrecognised metadata field {key!r}",
            )
            continue

        default = parts[1] if len(parts) > 1 else ""
        for index, column in enumerate(columns):
            raw = parts[column] if column < len(parts) else ""
            value = raw if raw else default
            if value:
                _assign(ds, path, censuses[index], key, value)

    return line_no


def _assign(ds: Dataset, path: Path, census: dict, key: str, value: str) -> None:
    """Map one metadata key onto its column, coercing as the schema requires."""
    if key == "isoRegionCode":
        census["territory_id"] = value
    elif key == "yearCollected":
        census["year_collected"] = to_int(value)
    elif key == "nameDisplay":
        census["name_display"] = value
    elif key == "codeDisplay":
        census["code_display"] = value
    elif key in ("population", "populationSurveyed", "populationWithPositiveResponses"):
        census[
            {
                "population": "population",
                "populationSurveyed": "population_surveyed",
                "populationWithPositiveResponses": "population_with_positive_responses",
            }[key]
        ] = to_int(value)
    elif key == "sampleRate":
        # CensusData.sampleRate is `number | string`. A non-numeric value is
        # kept in sample_rate_note rather than being lost.
        rate = to_decimal(value)
        if rate is not None and 0 <= rate <= 99:
            census["sample_rate"] = rate
        else:
            census["sample_rate_note"] = value
    elif key == "collectorType":
        if value not in COLLECTOR_TYPE:
            ds.warn(None, "census.collector_type",
                    f"{path.name}: invalid collectorType {value!r}; used 'Unknown'")
            value = "Unknown"
        census["collector_type"] = value
    elif key == "languageUse":
        if value not in LANGUAGE_USE:
            ds.warn(None, "census.language_use",
                    f"{path.name}: invalid languageUse {value!r}; left NULL")
            return
        census["language_use"] = value
    elif key == "quantity":
        low = value.lower()
        if low not in ("count", "percent"):
            ds.warn(None, "census.quantity",
                    f"{path.name}: invalid quantity {value!r}; used 'count'")
            low = "count"
        census["quantity"] = low
    elif key in ("datePublished", "dateAccessed"):
        census["date_published" if key == "datePublished" else "date_accessed"] = (
            to_date(value)
        )
    elif key == "presentedBy":
        census["presenter_short"] = value
    elif key == "collectorNameShort":
        census["collector_name_short"] = value
    else:
        # Plain text columns whose names differ only by case convention.
        text_columns = {
            "proficiency": "proficiency",
            "acquisitionOrder": "acquisition_order",
            "domain": "domain",
            "populationSource": "population_source",
            "responsesPerIndividual": "responses_per_individual",
            "languagesIncluded": "languages_included",
            "geographicScope": "geographic_scope",
            "age": "age",
            "gender": "gender",
            "nationality": "nationality",
            "residenceBasis": "residence_basis",
            "notes": "notes",
            "collectorName": "collector_name",
            "author": "author",
            "url": "url",
            "documentName": "document_name",
            "sectionName": "section_name",
            "tableName": "table_name",
            "columnName": "column_name",
            "citation": "citation",
        }
        column = text_columns.get(key)
        if column:
            census[column] = value


def _register_censuses(ds: Dataset, path: Path, censuses: list[dict]) -> dict[int, str]:
    """Write the census rows. Returns index -> id for those that survived."""
    known_territories = ds["territory"].ids()
    known_orgs = ds["organization"].ids()
    kept: dict[int, str] = {}

    for index, census in enumerate(censuses):
        cid = census["id"]
        territory = census.get("territory_id")
        year = census.get("year_collected")

        # territory_id and year_collected are both NOT NULL, and year has a
        # 1800-2100 CHECK, so a row failing either cannot be loaded at all.
        if not territory or territory not in known_territories:
            ds.warn(cid, "census.territory_id",
                    f"{path.name}: census {cid} has isoRegionCode "
                    f"{territory!r} which is not a known territory; row dropped")
            continue
        if year is None or not (1800 <= year <= 2100):
            ds.warn(cid, "census.year_collected",
                    f"{path.name}: census {cid} has yearCollected {year!r} "
                    f"outside 1800-2100; row dropped")
            continue

        name = census.get("name_display") or cid
        code = census.get("code_display") or cid
        ds.register_entity(cid, ENTITY_TYPE, code_display=code, name_display=name)
        ds.add_name(cid, ENTITY_TYPE, name, "display", language_tag="en")
        for extra in ("document_name", "table_name"):
            ds.add_name(cid, ENTITY_TYPE, census.get(extra), "alias", language_tag="en")

        collector = census.get("collector_name_short")
        collector_org = org_id(collector) if collector else None
        presenter = census.get("presenter_short")
        presenter_org = org_id(presenter) if presenter else None

        ds["census"].upsert(
            id=cid,
            territory_id=territory,
            year_collected=year,
            language_use=census.get("language_use"),
            proficiency=census.get("proficiency"),
            acquisition_order=census.get("acquisition_order"),
            domain=census.get("domain"),
            population=census.get("population"),
            population_source=census.get("population_source"),
            population_surveyed=census.get("population_surveyed"),
            population_with_positive_responses=census.get(
                "population_with_positive_responses"
            ),
            sample_rate=census.get("sample_rate"),
            sample_rate_note=census.get("sample_rate_note"),
            responses_per_individual=census.get("responses_per_individual"),
            age=census.get("age"),
            gender=census.get("gender"),
            nationality=census.get("nationality"),
            residence_basis=census.get("residence_basis"),
            languages_included=census.get("languages_included"),
            geographic_scope=census.get("geographic_scope"),
            quantity=census.get("quantity", "count"),
            notes=census.get("notes"),
            collector_type=census.get("collector_type", "Unknown"),
            collector_org_id=collector_org if collector_org in known_orgs else None,
            presenter_org_id=presenter_org if presenter_org in known_orgs else None,
            collector_name=census.get("collector_name"),
            collector_name_short=collector,
            author=census.get("author"),
            url=census.get("url"),
            date_published=census.get("date_published"),
            date_accessed=census.get("date_accessed"),
            document_name=census.get("document_name"),
            section_name=census.get("section_name"),
            table_name=census.get("table_name"),
            column_name=census.get("column_name"),
            citation=census.get("citation"),
            source_ref=f"{path.parent.name}/{path.name}#{index + 1}",
        )
        kept[index] = cid

    return kept


def _parse_language_rows(
    ds: Dataset,
    path: Path,
    lines: list[str],
    columns: list[int],
    censuses: list[dict],
    kept: dict[int, str],
) -> None:
    """Unpivot the language rows into census_language_estimate."""
    known_languages = ds["language"].ids()
    unknown: set[str] = set()

    for line in lines:
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 3:
            continue

        # A row may name several codes ('hbs/srp'); the estimate applies to
        # every one of them, which is what the frontend does.
        codes = [c.strip() for c in _CODE_SPLIT.split(parts[0]) if c.strip()]
        codes = [c for c in codes if not is_ignored_language_code(c)]
        if not codes:
            continue

        source_name = _clean_language_name(parts[1])

        for index, column in enumerate(columns):
            if index not in kept:
                continue
            raw = parts[column] if column < len(parts) else ""
            if not raw.strip():
                continue

            estimate, suppressed = _population_estimate(raw, censuses[index])
            if estimate is None:
                continue

            for code in codes:
                if code not in known_languages:
                    unknown.add(code)
                    continue
                existing = ds["census_language_estimate"].rows.get((kept[index], code))
                if existing is not None:
                    # The same language listed twice in one census accumulates,
                    # matching the frontend's behaviour.
                    existing["population_estimate"] += estimate
                    continue
                ds["census_language_estimate"].upsert(
                    census_id=kept[index],
                    language_id=code,
                    population_estimate=estimate,
                    raw_value=raw.strip(),
                    is_suppressed=suppressed,
                    source_name=source_name,
                )

    if unknown:
        ds.warn(
            None,
            "census_language_estimate.language_id",
            f"{path.name}: {len(unknown)} language code(s) in this census are "
            f"not known languages and were dropped: {sorted(unknown)[:10]}",
        )


def _population_estimate(raw: str, census: dict) -> tuple[int | None, bool]:
    """Parse one cell. Returns (estimate, is_suppressed).

    A non-numeric or non-positive value becomes 1, not 0, because it almost
    always means "too small to disclose" rather than "nobody". is_suppressed
    records which of the two happened, so a genuine count of 1 and a
    privacy-suppressed cell stay distinguishable. Without that flag the
    difference is lost permanently at load time.
    """
    text = _NUMBER_NOISE.sub("", raw.strip())
    if not text:
        return None, False

    try:
        value = float(text)
        numeric = True
    except ValueError:
        value = 0.0
        numeric = False

    if numeric and value > 0 and census.get("quantity") == "percent":
        base = census.get("population")
        if not base:
            return None, False
        value = round(value / 100.0 * base)

    if not numeric or value <= 0:
        return 1, True
    return int(value), False


def _clean_language_name(name: str) -> str | None:
    """Mirrors parseCensusLanguageName()."""
    text = name.strip()
    if not text or text.startswith("#"):
        return None
    match = re.match(r"^\d+(.*)", text)
    if match:
        text = match.group(1).strip()
    if text and text == text.upper():
        text = text.title()
    return text or None


def _misc_population_records(ds: Dataset, path: Path) -> None:
    """A two-row supplementary file with no census structure.

    It has no target table in the current schema, so it is recorded as
    unmapped rather than silently ignored.
    """
    if path.is_file():
        ds.note_unmapped(
            "census/misc_pop_records.tsv",
            "supplementary population records with no corresponding table in "
            "the schema; would need a table or a merge into locale",
        )

"""territory, assembled from five files.

This is the clearest example of why the merge layer exists: no single file
describes a territory. territories.tsv gives identity and both hierarchies,
and four other files each contribute a couple of columns keyed by the same
natural primary key.
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_table, split_multi, to_decimal, to_int
from .vocab import TERRITORY_SCOPE

ENTITY_TYPE = "Territory"


def load(ds: Dataset, root: Path) -> None:
    _core(ds, root / "tc" / "territories.tsv")
    _land_area(ds, root / "wiki" / "country_land_area.tsv")
    _coordinates(ds, root / "other_sources" / "country-coord.csv")
    _gdp_literacy(ds, root / "other_sources" / "territories_gdp_literacy.tsv")
    _names(ds, root / "wiki" / "territory_names.tsv")


def _core(ds: Dataset, path: Path) -> None:
    for row in read_table(path):
        tid = row.get("TerritoryCode")
        if not tid:
            continue

        name = row.get("Territory Name")
        type_name = row.get("Territory Type")
        scope = TERRITORY_SCOPE.get(type_name or "")
        if scope is None:
            ds.warn(
                tid,
                "territory.scope",
                f"{row.origin()}: unrecognised Territory Type {type_name!r}; "
                f"row skipped because scope is NOT NULL",
            )
            continue

        ds.register_entity(tid, ENTITY_TYPE, code_display=tid, name_display=name)
        ds.add_name(tid, ENTITY_TYPE, name, "display", language_tag="en")

        ds["territory"].upsert(
            id=tid,
            scope=scope,
            contained_un_region_id=row.get("Contained UN Region"),
            sovereign_id=row.get("Sovereign"),
            population_from_un=to_int(row.raw("Population")),
            source_ref=path.name,
        )


def _land_area(ds: Dataset, path: Path) -> None:
    for row in read_table(path):
        tid = row.get("Territory Code")
        if not tid or tid not in ds["territory"].ids():
            continue
        ds["territory"].upsert(
            id=tid, land_area_km2=to_decimal(row.raw("Land Area (km²)"))
        )


def _coordinates(ds: Dataset, path: Path) -> None:
    # The only comma-separated file in the whole dataset.
    for row in read_table(path, delimiter=","):
        tid = row.get("Alpha-2 code")
        if not tid or tid not in ds["territory"].ids():
            continue
        # ISO 3166-1 numeric is three digits and the leading zeros are part of
        # the code: Brazil is 076, not 76. The source file drops them, and this
        # column is text precisely so they can be kept. The frontend pads on
        # read (loadCountryCoordinates.ts), so storing the short form leaves the
        # database disagreeing with the site on the 30 codes below 100.
        code_numeric = row.get("Numeric code")
        ds["territory"].upsert(
            id=tid,
            code_alpha3=row.get("Alpha-3 code"),
            code_numeric=code_numeric.zfill(3) if code_numeric else None,
            latitude=to_decimal(row.raw("Latitude (average)")),
            longitude=to_decimal(row.raw("Longitude (average)")),
        )


def _gdp_literacy(ds: Dataset, path: Path) -> None:
    for row in read_table(path):
        tid = row.get("Territory Code")
        if not tid or tid not in ds["territory"].ids():
            continue
        literacy = to_decimal(row.raw("Literacy"))
        if literacy is not None and not (0 <= literacy <= 100):
            # territory_literacy_range would reject this at COPY time.
            ds.warn(
                tid,
                "territory.literacy_percent",
                f"{row.origin()}: literacy {literacy} outside 0-100; dropped",
            )
            literacy = None
        ds["territory"].upsert(
            id=tid, gdp=to_int(row.raw("GDP")), literacy_percent=literacy
        )


def _names(ds: Dataset, path: Path) -> None:
    """Endonyms and alternate names, into entity_name plus territory.name_endonym."""
    for row in read_table(path):
        tid = row.get("ID")
        if not tid or tid not in ds["territory"].ids():
            continue

        endonym = row.get("Endonym")
        source = row.get("Endonym Source")
        if endonym:
            ds["territory"].upsert(id=tid, name_endonym=endonym)
            ds.add_name(tid, ENTITY_TYPE, endonym, "endonym", source=source)

        # SEMICOLON, not comma. Both columns are semicolon-separated, and the
        # frontend splits them on ";" (loadTerritoryNames.ts). Splitting on ","
        # was wrong in both directions at once:
        #
        #   IN "Other Endonyms" holds 20 semicolon-separated names and NO comma,
        #      so it survived as a single 20-name string.
        #   BQ "Other Names" is the single name "Bonaire, Sint Eustatius, and
        #      Saba", which was torn into three fragments.
        #
        # A territory name may contain a comma; that is what BQ demonstrates.
        # Do not "restore" the comma here without re-reading both columns.
        for other in split_multi(row.get("Other Endonyms"), seps=";"):
            ds.add_name(tid, ENTITY_TYPE, other, "endonym", source=source)
        for other in split_multi(row.get("Other Names"), seps=";"):
            ds.add_name(tid, ENTITY_TYPE, other, "alias", language_tag="en")

        exonym = row.get("Exonym")
        if exonym:
            ds.add_name(tid, ENTITY_TYPE, exonym, "alias", language_tag="en")

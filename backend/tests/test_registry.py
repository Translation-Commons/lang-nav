"""Tests for the in-memory merge layer.

The merge semantics are the part of this ETL most likely to lose data quietly,
so they are pinned here: a None must never overwrite a real value, a
disagreement must be recorded rather than dropped, and a foreign key that does
not resolve must either be nulled or take its row with it.
"""

import pytest

from etl.registry import Dataset


def test_upsert_merges_columns_from_several_files():
    """territory is assembled from four files; none of them may clobber another."""
    ds = Dataset()
    ds["territory"].upsert(id="AD", scope=2, population_from_un=80000)
    ds["territory"].upsert(id="AD", land_area_km2=468)
    ds["territory"].upsert(id="AD", gdp=3400000000)

    row = ds["territory"].rows[("AD",)]
    assert row["scope"] == 2
    assert row["population_from_un"] == 80000
    assert row["land_area_km2"] == 468
    assert row["gdp"] == 3400000000
    assert len(ds["territory"]) == 1


def test_none_never_overwrites_an_existing_value():
    ds = Dataset()
    ds["territory"].upsert(id="AD", gdp=3400000000)
    ds["territory"].upsert(id="AD", gdp=None)
    assert ds["territory"].rows[("AD",)]["gdp"] == 3400000000


def test_conflicting_values_are_recorded_not_silently_dropped():
    ds = Dataset()
    ds["territory"].upsert(id="AD", gdp=100)
    ds["territory"].upsert(id="AD", gdp=200)
    ds.report_conflicts()

    assert ds["territory"].rows[("AD",)]["gdp"] == 200  # later wins
    assert any("conflicting values for gdp" in f.message for f in ds.findings)


def test_unknown_column_raises():
    ds = Dataset()
    with pytest.raises(KeyError):
        ds["territory"].upsert(id="AD", not_a_column=1)


def test_entity_first_writer_wins_for_display_name():
    """Authority loaders must not replace the curated name.

    languages.tsv runs before ISO and Glottolog, and all three have a different
    name for the same languoid.
    """
    ds = Dataset()
    ds.register_entity("cmn", "Language", name_display="Mandarin Chinese")
    ds.register_entity("cmn", "Language", name_display="Chinese, Mandarin")   # ISO
    ds.register_entity("cmn", "Language", name_display="Mandarin Chinese ")   # Glottolog

    assert ds["entity"].rows[("cmn",)]["name_display"] == "Mandarin Chinese"


def test_entity_falls_back_to_id_when_no_name_given():
    ds = Dataset()
    ds.register_entity("xyz", "Language")
    row = ds["entity"].rows[("xyz",)]
    assert row["name_display"] == "xyz"
    assert row["code_display"] == "xyz"


def test_nullable_fk_is_nulled_and_warned():
    ds = Dataset()
    ds["territory"].upsert(id="AD", scope=2, sovereign_id="ZZ")  # ZZ does not exist
    ds.resolve_foreign_keys()

    assert ds["territory"].rows[("AD",)]["sovereign_id"] is None
    assert any("does not exist in territory" in f.message for f in ds.findings)
    assert all(f.severity == "warning" for f in ds.findings)


def test_required_fk_drops_the_row_as_an_error():
    ds = Dataset()
    ds["language"].upsert(id="eng", name_canonical="English")
    ds["locale"].upsert(id="eng_US", language_id="eng")
    ds["locale"].upsert(id="zzz_US", language_id="zzz")  # zzz does not exist
    ds.resolve_foreign_keys()

    assert ("eng_US",) in ds["locale"].rows
    assert ("zzz_US",) not in ds["locale"].rows
    assert any(f.severity == "error" for f in ds.findings)


def test_resolved_fk_survives():
    ds = Dataset()
    ds["territory"].upsert(id="DK", scope=2)
    ds["territory"].upsert(id="GL", scope=1, sovereign_id="DK")
    ds.resolve_foreign_keys()
    assert ds["territory"].rows[("GL",)]["sovereign_id"] == "DK"
    assert ds.findings == []


def test_not_null_default_is_applied_at_copy_time_only():
    """is_manual_override stays None in memory and becomes False on the wire."""
    ds = Dataset()
    ds["language"].upsert(id="sqi", name_canonical="Albanian")
    ds["language_source_attribute"].upsert(language_id="sqi", source="Combined")

    row = ds["language_source_attribute"].rows[("sqi", "Combined")]
    assert row["is_manual_override"] is None

    table = ds["language_source_attribute"]
    index = table.columns.index("is_manual_override")
    assert next(iter(table.tuples()))[index] is False


def test_explicit_value_beats_the_default():
    ds = Dataset()
    ds["language_source_attribute"].upsert(
        language_id="sqi", source="Combined", is_manual_override=True
    )
    table = ds["language_source_attribute"]
    index = table.columns.index("is_manual_override")
    assert next(iter(table.tuples()))[index] is True


def test_locale_variant_key_defaults_to_empty_string_at_copy_time():
    """variant_key is NOT NULL DEFAULT '' and must never reach COPY as None."""
    ds = Dataset()
    ds["language"].upsert(id="roh", name_canonical="Romansh")
    ds["locale"].upsert(id="roh_CH", language_id="roh", territory_id="CH")

    table = ds["locale"]
    index = table.columns.index("variant_key")
    assert table.rows[("roh_CH",)]["variant_key"] is None
    assert next(iter(table.tuples()))[index] == ""


def test_add_name_deduplicates_on_the_schema_unique_key():
    ds = Dataset()
    ds.add_name("eng", "Language", "English", "display", language_tag="en")
    ds.add_name("eng", "Language", "English", "display", language_tag="en")
    ds.add_name("eng", "Language", "English", "alias", language_tag="en")
    assert len(ds["entity_name"]) == 2


def test_add_name_ignores_empty_names():
    ds = Dataset()
    ds.add_name("eng", "Language", None, "display")
    ds.add_name("eng", "Language", "", "display")
    assert len(ds["entity_name"]) == 0

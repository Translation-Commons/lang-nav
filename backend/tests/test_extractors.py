"""Tests for the trickier extractor logic.

Concentrated on the two places where a subtle error produces plausible-looking
but wrong data: locale id decomposition, and the census format where one file
is many censuses.
"""

from etl.loaders.census import (
    _census_paths,
    _clean_language_name,
    _data_columns,
    _population_estimate,
    _assign_id_prefixes,
)
from pathlib import Path

from etl.loaders import territories as loaders_territories
from etl.loaders.languages import _split_subtitle
from etl.loaders.locales import parse_locale_id
from etl.loaders.vocab import is_ignored_language_code
from etl.sources import split_multi


# --- locale id decomposition ----------------------------------------------


def test_parse_locale_id_shapes():
    assert parse_locale_id("zho_CN") == ("zho", None, "CN", [])
    assert parse_locale_id("zho_Hans_CN") == ("zho", "Hans", "CN", [])
    assert parse_locale_id("roh_CH_RUMGR") == ("roh", None, "CH", ["rumgr"])
    assert parse_locale_id("eng_basiceng") == ("eng", None, None, ["basiceng"])
    assert parse_locale_id("eng") == ("eng", None, None, [])


def test_parse_locale_id_numeric_territory():
    """UN M.49 codes like 001 are territories too."""
    assert parse_locale_id("eng_001") == ("eng", None, "001", [])


def test_parse_locale_id_preserves_variant_order():
    """slv_Latn_SI_bohoric_nedis is a different string from the reverse."""
    _, _, _, variants = parse_locale_id("slv_Latn_SI_bohoric_nedis")
    assert variants == ["bohoric", "nedis"]


def test_romansh_idioms_get_distinct_variant_keys():
    """The eight roh_CH locales share (language, script, territory).

    Only variant_key keeps them apart. Without it the schema's UNIQUE
    constraint rejects seven legitimate Romansh idiom locales.
    """
    ids = [
        "roh_CH", "roh_CH_SURSILV", "roh_CH_VALLADER", "roh_CH_PUTER",
        "roh_CH_SURMIRAN", "roh_CH_SUTSILV", "roh_CH_JAUER", "roh_CH_RUMGR",
    ]
    tuples = []
    for lid in ids:
        lang, script, terr, variants = parse_locale_id(lid)
        assert (lang, script, terr) == ("roh", None, "CH")
        tuples.append((lang, script, terr, "StableDatabase", ".".join(variants)))

    # All eight must be distinct once variant_key is part of the key.
    assert len(set(tuples)) == 8
    # And exactly one of them is the variant-less base locale.
    assert sum(1 for t in tuples if t[4] == "") == 1


# --- census format ---------------------------------------------------------


def test_data_columns_skips_key_and_default_columns():
    header = "#nameDisplay\t\tCanada 2021\tCanada 2021 @Home"
    assert _data_columns(header) == [2, 3]


def test_data_columns_excludes_hash_prefixed_context_columns():
    """A '#' header marks a column that exists for a human reader only."""
    header = "#nameDisplay\t\tReal Census\t#Context Notes\tAnother Census"
    assert _data_columns(header) == [2, 4]


def test_assign_id_prefixes_disambiguates_colliding_stems(tmp_path):
    """census/official/id.tsv and census/data.un.org/id.tsv both exist."""
    official = tmp_path / "official"
    un = tmp_path / "data.un.org"
    official.mkdir()
    un.mkdir()
    a = official / "id.tsv"
    b = un / "id.tsv"
    c = official / "ca2021.tsv"
    for p in (a, b, c):
        p.write_text("x", encoding="utf-8")

    prefixes = _assign_id_prefixes([a, b, c])
    # The unique stem keeps the short, documented form.
    assert prefixes[c] == "ca2021"
    # The colliding ones are qualified, and remain distinct.
    assert prefixes[a] == "official.id"
    assert prefixes[b] == "data.un.org.id"
    assert prefixes[a] != prefixes[b]


def test_population_estimate_strips_thousands_separators():
    assert _population_estimate("31,628,570", {"quantity": "count"}) == (31628570, False)


def test_population_estimate_converts_percentages():
    census = {"quantity": "percent", "population": 1000}
    assert _population_estimate("12.5", census) == (125, False)


def test_suppressed_values_become_one_and_are_flagged():
    """A non-numeric cell usually means 'too small to disclose', not zero.

    Without is_suppressed, a real count of 1 and a privacy-suppressed cell
    become permanently indistinguishable.
    """
    assert _population_estimate("too few", {"quantity": "count"}) == (1, True)
    assert _population_estimate("0", {"quantity": "count"}) == (1, True)
    assert _population_estimate("-5", {"quantity": "count"}) == (1, True)
    # A genuine 1 is NOT flagged.
    assert _population_estimate("1", {"quantity": "count"}) == (1, False)


def test_blank_cell_yields_nothing():
    assert _population_estimate("   ", {"quantity": "count"}) == (None, False)


def test_percent_without_a_population_base_is_dropped():
    assert _population_estimate("12.5", {"quantity": "percent"}) == (None, False)


def test_clean_language_name_strips_row_numbers_and_fixes_caps():
    assert _clean_language_name("12 Blackfoot") == "Blackfoot"
    assert _clean_language_name("ENGLISH") == "English"
    assert _clean_language_name("# do not use") is None
    assert _clean_language_name("") is None


def test_ignored_language_codes():
    for code in ("mul", "mis", "und", "zxx", "", "Language Code", "#bad"):
        assert is_ignored_language_code(code)
    for code in ("eng", "cmn", "algo1256"):
        assert not is_ignored_language_code(code)


# --- language name splitting ----------------------------------------------


def test_split_subtitle():
    assert _split_subtitle("Chinese (Mandarin)") == ("Chinese", "Mandarin")
    assert _split_subtitle("English") == ("English", None)
    # A leading parenthesis is not a subtitle.
    assert _split_subtitle("(unnamed)") == ("(unnamed)", None)


# --- territory names, and the separator that was wrong ---------------------

# Both name columns in territory_names.tsv are semicolon-separated, and the
# frontend splits them on ";" (loadTerritoryNames.ts). The loader split on ","
# instead, which failed in OPPOSITE directions depending on the cell:
#
#   * a cell of semicolon-separated names with no comma survived as one string
#   * a single name containing commas was torn into fragments
#
# An aggregate row count over entity_name cannot see either, because the two
# errors partly cancel. These pin the behaviour on the real cells that caught
# it, so the separator cannot be changed back without a test saying so.


def test_other_endonyms_split_on_semicolon_not_comma():
    """India's cell: 20 semicolon-separated names, no comma anywhere."""
    cell = "भारत; भारतम्; Bhārat Gaṇarājya; Bāratam"
    assert split_multi(cell, seps=";") == [
        "भारत", "भारतम्", "Bhārat Gaṇarājya", "Bāratam",
    ]


def test_a_territory_name_may_contain_a_comma():
    """BQ's only other name is `Bonaire, Sint Eustatius, and Saba`. Splitting
    on a comma turned one name into three fragments, one of them `and Saba`."""
    cell = "Bonaire, Sint Eustatius, and Saba"
    assert split_multi(cell, seps=";") == [cell]
    assert len(split_multi(cell, seps=",")) == 3, (
        "this is the defect being guarded against, kept as a demonstration"
    )


def test_the_territory_loader_asks_for_semicolons():
    """Reads the loader itself. The two calls are one character away from the
    bug, and nothing else in the file would fail if they regressed."""
    source = (Path(loaders_territories.__file__)).read_text(encoding="utf-8")
    assert 'split_multi(row.get("Other Endonyms"), seps=";")' in source
    assert 'split_multi(row.get("Other Names"), seps=";")' in source

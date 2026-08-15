"""Tests for the readers and coercions.

Every case here is a hazard that actually occurs in the source files, not a
hypothetical. The comma-formatted numbers, the percent signs, the '#' metadata
blocks, the prose preamble and the header-only files are all real.
"""

from decimal import Decimal

import pytest

from etl.sources import (
    clean,
    read_iana_registry,
    read_table,
    split_multi,
    to_bool,
    to_date,
    to_decimal,
    to_int,
)


# --- coercions -------------------------------------------------------------


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("1,296,041,185", 1296041185),   # territories.tsv population
        ("36,328,480", 36328480),        # census population
        ("100.00%", 100),                # cldrCoverage percentage
        ("  42  ", 42),
        ("", None),
        ("   ", None),
        (None, None),
        ("-", None),
        ("N/A", None),
        ("not a number", None),
        ("1234.0", 1234),
    ],
)
def test_to_int(raw, expected):
    assert to_int(raw) == expected


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("99.90%", Decimal("99.90")),
        ("1,234.56", Decimal("1234.56")),
        ("0.25", Decimal("0.25")),
        ("", None),
        ("rubbish", None),
    ],
)
def test_to_decimal(raw, expected):
    assert to_decimal(raw) == expected


@pytest.mark.parametrize(
    "raw,expected",
    [("1", True), ("0", False), ("yes", True), ("no", False),
     ("TRUE", True), ("", None), ("maybe", None)],
)
def test_to_bool(raw, expected):
    assert to_bool(raw) is expected


def test_to_date_formats():
    assert to_date("2022-08-17").isoformat() == "2022-08-17"
    assert to_date("6/30/26").year == 2026
    assert to_date("nonsense") is None


def test_split_multi():
    # keyman Platform Support
    assert split_multi("windows,macos,ios") == ["windows", "macos", "ios"]
    # familiesToLanguages Constituents are space separated
    assert split_multi("aal ber btf", seps=" ") == ["aal", "ber", "btf"]
    assert split_multi("") == []
    assert split_multi(None) == []


def test_clean_turns_blank_into_none():
    assert clean("  x  ") == "x"
    assert clean("   ") is None
    assert clean(None) is None


# --- tabular reader --------------------------------------------------------


def test_read_table_skips_hash_metadata(tmp_path):
    path = tmp_path / "sample.tsv"
    path.write_text(
        "#url\thttps://example.org\n"
        "#dateAccessed\t2025-06-06\n"
        "Code\tName\n"
        "aaa\tGhotuo\n"
        "aab\tAlumu-Tesu\n",
        encoding="utf-8",
    )
    rows = list(read_table(path))
    assert [r.get("Code") for r in rows] == ["aaa", "aab"]
    assert rows[0].get("Name") == "Ghotuo"


def test_read_table_pins_header_for_prose_preamble(tmp_path):
    """cldrCoverage.tsv has a prose preamble with no '#' prefix."""
    path = tmp_path / "coverage.tsv"
    path.write_text(
        "From https://www.unicode.org/cldr/charts/\n"
        "Last accessed 2025-05-07\n"
        "Language\tEnglish Name\n"
        "en\tEnglish\n",
        encoding="utf-8",
    )
    rows = list(read_table(path, header_startswith="Language\t"))
    assert len(rows) == 1
    assert rows[0].get("English Name") == "English"


def test_read_table_pads_short_rows(tmp_path):
    path = tmp_path / "short.tsv"
    path.write_text("A\tB\tC\nx\ty\n", encoding="utf-8")
    row = next(iter(read_table(path)))
    assert row.get("C") is None


def test_read_table_header_only_yields_nothing(tmp_path):
    """sil/ethnologue2025.tsv is header-only upstream. Must not raise."""
    path = tmp_path / "empty.tsv"
    path.write_text("ISO Code\tLanguage Name\n", encoding="utf-8")
    assert list(read_table(path)) == []


def test_read_table_missing_file_yields_nothing(tmp_path):
    assert list(read_table(tmp_path / "absent.tsv")) == []


def test_read_table_comma_delimiter(tmp_path):
    """country-coord.csv is the one comma-separated source."""
    path = tmp_path / "coord.csv"
    path.write_text("Country,Alpha-2 code\nAndorra,AD\n", encoding="utf-8")
    row = next(iter(read_table(path, delimiter=",")))
    assert row.get("Alpha-2 code") == "AD"


def test_row_origin_reports_file_and_line(tmp_path):
    path = tmp_path / "x.tsv"
    path.write_text("A\n1\n2\n", encoding="utf-8")
    rows = list(read_table(path))
    assert rows[0].origin() == "x.tsv:2"
    assert rows[1].origin() == "x.tsv:3"


# --- IANA registry ---------------------------------------------------------


def test_read_iana_registry_handles_repeats_and_continuations(tmp_path):
    path = tmp_path / "variants.txt"
    path.write_text(
        "%%\n"
        "Type: variant\n"
        "Subtag: 1994\n"
        "Description: Standardized Resian orthography\n"
        "Added: 2007-07-28\n"
        "Prefix: sl-rozaj\n"
        "Prefix: sl-rozaj-biske\n"
        "%%\n"
        "Type: variant\n"
        "Subtag: 1606nict\n"
        "Description: Late Middle French (to 1606)\n"
        "Comments: 16th century French as in Jean Nicot,\n"
        "  but also including some French similar to that of\n"
        "  Rabelais\n",
        encoding="utf-8",
    )
    records = list(read_iana_registry(path))
    assert len(records) == 2

    first = records[0]
    assert first.first("Subtag") == "1994"
    # Prefix repeats and must not overwrite itself.
    assert first.all("Prefix") == ["sl-rozaj", "sl-rozaj-biske"]

    second = records[1]
    comments = second.first("Comments")
    # Continuation lines are folded into the preceding value.
    assert comments.startswith("16th century French")
    assert comments.endswith("Rabelais")

"""Readers for the source files, plus the value coercions they all need.

Every hazard listed in the data inventory is handled in exactly one place here
rather than being re-solved in each extractor:

  - comma-formatted numbers        1,296,041,185 -> 1296041185
  - percent signs                  100.00%       -> 100.00
  - '#'-prefixed metadata lines    skipped
  - country-coord.csv              comma separated, not tab
  - iana/variants.txt              record-per-paragraph, not tabular
  - header-only files              yield zero rows without raising
"""

from __future__ import annotations

import csv
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Iterator


# ---------------------------------------------------------------------------
# Value coercion
# ---------------------------------------------------------------------------

_NUMBER_NOISE = re.compile(r"[,%\s ]")


def clean(value: str | None) -> str | None:
    """Trim, and turn empty strings into None so they become SQL NULL."""
    if value is None:
        return None
    v = value.strip()
    return v or None


def to_int(value: str | None) -> int | None:
    """Parse an integer, tolerating '1,296,041,185' and '52%'."""
    v = clean(value)
    if v is None:
        return None
    v = _NUMBER_NOISE.sub("", v)
    if not v or v in {"-", "N/A", "NA"}:
        return None
    try:
        # float() first so that '1234.0' and '1.2e3' do not blow up
        return int(float(v))
    except ValueError:
        return None


def to_decimal(value: str | None) -> Decimal | None:
    """Parse a decimal, tolerating thousands separators and percent signs."""
    v = clean(value)
    if v is None:
        return None
    v = _NUMBER_NOISE.sub("", v)
    if not v or v in {"-", "N/A", "NA"}:
        return None
    try:
        return Decimal(v)
    except InvalidOperation:
        return None


def to_bool(value: str | None) -> bool | None:
    """Parse the several boolean spellings used across these files."""
    v = clean(value)
    if v is None:
        return None
    low = v.lower()
    if low in {"1", "true", "yes", "y"}:
        return True
    if low in {"0", "false", "no", "n"}:
        return False
    return None


_DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d", "%m/%d/%y", "%Y")


def to_date(value: str | None) -> date | None:
    """Parse a date in any of the formats these files actually use."""
    v = clean(value)
    if v is None:
        return None
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(v, fmt).date()
        except ValueError:
            continue
    return None


def split_multi(value: str | None, seps: str = ",") -> list[str]:
    """Split a multi-valued cell into its parts, dropping blanks."""
    v = clean(value)
    if v is None:
        return []
    pattern = "[" + re.escape(seps) + "]"
    return [p.strip() for p in re.split(pattern, v) if p.strip()]


# ---------------------------------------------------------------------------
# Tabular readers
# ---------------------------------------------------------------------------


@dataclass
class Row:
    """One data row, with the file and line number kept for error reporting."""

    values: dict[str, str]
    path: Path
    line_no: int

    def get(self, column: str) -> str | None:
        return clean(self.values.get(column))

    def raw(self, column: str) -> str:
        return self.values.get(column, "")

    def origin(self) -> str:
        return f"{self.path.name}:{self.line_no}"


def _open(path: Path):
    # utf-8-sig strips the BOM some of these files carry.
    return path.open("r", encoding="utf-8-sig", newline="")


def read_table(
    path: Path,
    delimiter: str = "\t",
    skip_comments: bool = True,
    header_startswith: str | None = None,
) -> Iterator[Row]:
    """Read a delimited file that has a single header row.

    skip_comments drops '#'-prefixed and blank lines before the header is
    located, which is what the metadata blocks in these files require.

    header_startswith pins the header to the first line beginning with that
    text. Needed for files like cldrCoverage.tsv whose preamble lines are
    plain prose rather than '#'-prefixed.
    """
    if not path.is_file():
        return

    with _open(path) as fh:
        lines = fh.read().split("\n")

    header: list[str] | None = None
    header_line_no = 0

    for i, line in enumerate(lines, start=1):
        if line.strip() == "":
            continue
        if header_startswith is not None:
            if not line.startswith(header_startswith):
                continue
        elif skip_comments and line.startswith("#"):
            continue
        header = next(csv.reader([line], delimiter=delimiter))
        header_line_no = i
        break

    if header is None:
        # Genuinely empty or header-only file. Not an error: the two SIL
        # ethnologue files are legitimately header-only upstream.
        return

    for i, line in enumerate(lines[header_line_no:], start=header_line_no + 1):
        if line.strip() == "":
            continue
        if skip_comments and line.startswith("#"):
            continue
        parts = next(csv.reader([line], delimiter=delimiter))
        # Pad short rows rather than raising: several files have trailing
        # columns omitted when the last values are empty.
        if len(parts) < len(header):
            parts = parts + [""] * (len(header) - len(parts))
        yield Row(values=dict(zip(header, parts)), path=path, line_no=i)


def read_headers(path: Path, delimiter: str = "\t") -> list[str]:
    """Return the header row of a file, for column-count assertions."""
    for row in read_table(path, delimiter=delimiter):
        return list(row.values.keys())
    return []


# ---------------------------------------------------------------------------
# iana/variants.txt - a record-per-paragraph format, not tabular
# ---------------------------------------------------------------------------


@dataclass
class IanaRecord:
    """One '%%'-delimited record. Keys repeat, so values are always lists."""

    fields: dict[str, list[str]] = field(default_factory=dict)

    def first(self, key: str) -> str | None:
        vals = self.fields.get(key)
        return clean(vals[0]) if vals else None

    def all(self, key: str) -> list[str]:
        return [v for v in (clean(x) for x in self.fields.get(key, [])) if v]


def read_iana_registry(path: Path) -> Iterator[IanaRecord]:
    """Parse the IANA language subtag registry format.

    Records are separated by a '%%' line. Within a record, 'Key: value' pairs
    may repeat (Prefix: appears many times) and long values wrap onto
    continuation lines that begin with whitespace.
    """
    if not path.is_file():
        return

    with _open(path) as fh:
        lines = fh.read().split("\n")

    current = IanaRecord()
    last_key: str | None = None

    def flush(rec: IanaRecord) -> Iterator[IanaRecord]:
        if rec.fields:
            yield rec

    for line in lines:
        if line.startswith("%%"):
            yield from flush(current)
            current = IanaRecord()
            last_key = None
            continue

        if not line.strip():
            continue

        if line[0].isspace() and last_key is not None:
            # Continuation of the previous value.
            current.fields[last_key][-1] += " " + line.strip()
            continue

        if ":" not in line:
            continue

        key, _, value = line.partition(":")
        key = key.strip()
        current.fields.setdefault(key, []).append(value.strip())
        last_key = key

    yield from flush(current)

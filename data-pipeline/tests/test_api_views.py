"""Guards on `schema/007_api_views.sql`.

Static checks on the SQL text. These need no database, in keeping with the rest
of the backend suite, so they run in CI where nothing is loaded.
"""

import re
from pathlib import Path

SCHEMA_DIR = Path(__file__).resolve().parent.parent / "schema"
API_VIEWS_SQL = (SCHEMA_DIR / "007_api_views.sql").read_text(encoding="utf-8")


# ── Project hard rules ─────────────────────────────────────────────────────


def test_no_local_paths_or_private_references():
    """Project hard rule 8."""
    assert ".private" not in API_VIEWS_SQL
    assert not re.search(r"\b[A-Za-z]:[\\/]", API_VIEWS_SQL)


def test_no_em_dashes():
    """Project hard rule 4. chr(8212) rather than the literal character, since
    writing it here would itself break the rule."""
    assert API_VIEWS_SQL.count(chr(8212)) == 0


# ── The N+1 this file used to have ─────────────────────────────────────────


def test_the_json_aggregates_are_grouped_not_lateral():
    """`api.language` must not aggregate with a correlated LATERAL subquery.

    IT DID, and it was an N+1 in disguise. A LATERAL correlated on `l.id` runs
    ONCE PER OUTER ROW: EXPLAIN reported `Index Searches: 27378` and
    `loops=27378` for each of the two aggregates, and the whole view took
    1,237 ms against 151 ms for its base columns alone. Grouping first and
    joining the result is one pass instead of 27,378 lookups, returns
    byte-identical output on all 27,378 rows, and measured 1,007 ms - with the
    query's time-to-first-byte through PostgREST going from 2,405 ms to
    1,664 ms.

    The reason to pin it is that the LATERAL version READS BETTER - "for this
    language, collect its rows" - so it is what someone would naturally write
    again. This test is here to make that choice a deliberate one.
    """
    assert "JOIN LATERAL" not in API_VIEWS_SQL.upper(), (
        "An aggregate in api.language went back to a correlated LATERAL "
        "subquery, which runs once per language. Group the rows first and "
        "join on language_id instead."
    )


def test_the_alias_filter_stays_inside_the_grouped_subquery():
    """`alias_kind IN (...)` must filter before the group, not after the join.

    Moving it to the outer query would filter rows the LEFT JOIN already
    produced, dropping every language with no matching alias and silently
    turning the LEFT JOIN into an inner one.
    """
    grouped = re.search(
        r"SELECT c\.language_id,.*?GROUP BY c\.language_id",
        API_VIEWS_SQL,
        re.S,
    )
    assert grouped is not None, "the aliases aggregate is no longer a grouped subquery"
    assert "alias_kind IN" in grouped.group(0), (
        "the alias_kind filter moved out of the grouped subquery, which turns "
        "its LEFT JOIN into an inner join"
    )


def test_the_json_aggregates_strip_nulls():
    """Absent keys, not `"c1":null`, on every aggregated row.

    `json_build_object` emits every key on every row whether or not it has a
    value, so `code_6391` and `retirement_reason` - 368 and 388 non-null values
    out of 60,441 - shipped as explicit nulls 60,000+ times each. Stripping
    them took the sources payload from 5.90 MB to 3.30 MB and the whole
    language response from 17.68 MB to 15.05 MB.

    Safe because the mapper reads every field through `orUndefined`, which is
    `?? undefined`, and `??` cannot tell an absent key from a null. Verified by
    comparing all 27,378 rows before and after with nulls and absent keys
    treated alike: semantically identical.

    Pinned because dropping the wrapper is invisible locally - the wire time is
    ~5 ms against a 1.7 s time-to-first-byte, so nothing gets slower on a dev
    machine. It costs bandwidth on a real network instead.
    """
    aggregates = API_VIEWS_SQL.count("json_agg(")
    stripped = API_VIEWS_SQL.count("json_agg(json_strip_nulls(")
    assert aggregates > 0, "api.language no longer aggregates anything"
    assert stripped == aggregates, (
        f"{aggregates - stripped} of {aggregates} json_agg calls no longer "
        "strip nulls, so absent values ship as explicit null on every row"
    )

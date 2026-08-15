"""ETL orchestrator.

    python -m etl.run --schema        apply 001_schema.sql + 003_derive.sql
    python -m etl.run --load          extract, merge, COPY, derive
    python -m etl.run --indexes       apply 002_indexes.sql (after loading)
    python -m etl.run --roles         apply 005_roles.sql + 006_rls.sql alone
    python -m etl.run --all           all three, in that order
    python -m etl.run --verify        golden-value checks only, read-only
    python -m etl.run --extract-only  parse every file, write nothing (no DB)

--schema and --load apply 005_roles.sql themselves; --roles exists so the API
grants can be re-applied on their own, without a reload.

Exit code is non-zero if any error-severity finding was recorded, so a run
cannot report success while having dropped rows.
"""

from __future__ import annotations

import argparse
import sys
import time
import uuid
from pathlib import Path

import psycopg

from . import db, derive
from .config import SCHEMA_DIR, ConfigError, data_root, langnav_db
from .loaders import LOADERS
from .registry import Dataset, TABLE_ORDER

# Exit code used when a load is refused because the database is not empty.
REFUSED = 2

# Tables the ETL owns. The lookup tables (language_scope, territory_scope,
# language_modality, vitality_*, language_iso_status) are seeded by
# 001_schema.sql and are deliberately NOT in this list.
OWNED_TABLES = TABLE_ORDER + (
    "language_ancestry",
    "territory_ancestry",
    "data_quality_finding",
    "ingest_run",
)


def extract(verbose: bool = True) -> Dataset:
    """Run every extractor into memory. Touches no database."""
    ds = Dataset()
    root = data_root()

    for label, loader in LOADERS:
        started = time.perf_counter()
        loader(ds, root)
        if verbose:
            elapsed = time.perf_counter() - started
            print(f"  extracted {label:20s} {elapsed:6.2f}s")

    ds.resolve_foreign_keys()
    ds.report_conflicts()
    return ds


def load(conn: psycopg.Connection, ds: Dataset, run_id: str) -> dict[str, int]:
    """COPY every table, in foreign-key dependency order.

    Constraints are deferred for the duration of this transaction. Dependency
    order gets almost everything right, but the schema contains a genuine cycle
    (language.primary_script_id <-> writing_system.primary_language_id) that no
    ordering can satisfy, plus four self-referencing keys whose success would
    otherwise depend on the row order inside a source file. Integrity is still
    fully enforced, just once at COMMIT rather than per statement.
    """
    with conn.cursor() as cur:
        cur.execute("SET CONSTRAINTS ALL DEFERRED")

    _preflight_not_null(conn, ds)

    written: dict[str, int] = {}
    for name in TABLE_ORDER:
        table = ds[name]
        if not len(table):
            continue
        written[name] = db.copy_rows(conn, name, table.columns, table.tuples())
        # Release each table as soon as it is on the wire. The whole dataset
        # fits in memory comfortably, but there is no reason to hold it.
        table.rows.clear()

    if ds.findings:
        db.copy_rows(
            conn,
            "data_quality_finding",
            ("entity_id", "field", "severity", "message", "run_id"),
            (f.as_row(run_id) for f in ds.findings),
        )
    return written


class PreflightError(RuntimeError):
    """Raised when in-memory rows cannot satisfy the table definition."""


def _preflight_not_null(conn: psycopg.Connection, ds: Dataset) -> None:
    """Check every table's NOT NULL columns before sending a single byte.

    A COPY that violates NOT NULL aborts the whole transaction, so discovering
    these one per run is slow and uninformative. This reports all of them
    together, with a sample offending row for each.
    """
    required = db.not_null_columns(conn)
    problems: list[str] = []

    for name in TABLE_ORDER:
        table = ds[name]
        if not len(table):
            continue
        needed = required.get(name, set()) & set(table.columns) - set(table.defaults)
        if not needed:
            continue
        for column in sorted(needed):
            bad = sum(1 for row in table.rows.values() if row[column] is None)
            if bad:
                sample = next(
                    key for key, row in table.rows.items() if row[column] is None
                )
                problems.append(
                    f"  {name}.{column}: {bad} row(s) have NULL "
                    f"(NOT NULL in the schema). Example key: {sample}"
                )

    if problems:
        raise PreflightError(
            "pre-flight check failed, nothing was written:\n" + "\n".join(problems)
        )


def verify(conn: psycopg.Connection) -> list[tuple[str, str, bool]]:
    """The post-install golden-value checks. Read-only.

    Returns (label, actual, passed). `language` is checked against its
    source_ref because the table is the union of every authority's languoids,
    so its total is legitimately larger than the 8,208 rows in languages.tsv.
    """
    checks: list[tuple[str, str, bool]] = []

    def check(label: str, sql: str, predicate) -> None:
        value = db.scalar(conn, sql)
        checks.append((label, str(value), bool(predicate(value))))

    check("language rows from languages.tsv (expect 8208)",
          "SELECT count(*) FROM language WHERE source_ref = 'languages.tsv'",
          lambda v: v == 8208)
    check("language rows total (union of all sources)",
          "SELECT count(*) FROM language", lambda v: v > 8000)
    check("territory (expect 289)",
          "SELECT count(*) FROM territory", lambda v: v == 289)
    check("writing_system (expect 225)",
          "SELECT count(*) FROM writing_system", lambda v: v == 225)
    check("locale, StableDatabase (expect ~10806)",
          "SELECT count(*) FROM locale WHERE locale_source = 'StableDatabase'",
          lambda v: 10000 <= v <= 11000)
    # Measured at 246,830 on 2026-08-02. The design estimate was ~300k; the
    # upper bound stays loose because the real failure mode is a cycle, which
    # inflates this by orders of magnitude rather than by a few percent.
    check("language_ancestry (measured ~247k, far more means a cycle)",
          "SELECT count(*) FROM language_ancestry", lambda v: 0 < v < 5_000_000)
    check("territory_stats (expect 289)",
          "SELECT count(*) FROM territory_stats", lambda v: v == 289)
    check("census rows",
          "SELECT count(*) FROM census", lambda v: v > 0)
    check("census_language_estimate rows",
          "SELECT count(*) FROM census_language_estimate", lambda v: v > 0)
    check("orphaned entity ids (expect 0)",
          """SELECT count(*) FROM entity e
              WHERE NOT EXISTS (SELECT 1 FROM language     WHERE id = e.id)
                AND NOT EXISTS (SELECT 1 FROM territory    WHERE id = e.id)
                AND NOT EXISTS (SELECT 1 FROM writing_system WHERE id = e.id)
                AND NOT EXISTS (SELECT 1 FROM locale       WHERE id = e.id)
                AND NOT EXISTS (SELECT 1 FROM variant      WHERE id = e.id)
                AND NOT EXISTS (SELECT 1 FROM census       WHERE id = e.id)
                AND NOT EXISTS (SELECT 1 FROM keyboard     WHERE id = e.id)
                AND NOT EXISTS (SELECT 1 FROM organization WHERE id = e.id)""",
          lambda v: v == 0)
    check("entity_name.entity_type disagreeing with entity.type (expect 0)",
          """SELECT count(*) FROM entity_name n JOIN entity e ON e.id = n.entity_id
              WHERE n.entity_type <> e.type""",
          lambda v: v == 0)

    # Territory names are semicolon-separated, and both columns were being split
    # on a comma. The bug was invisible in aggregate because it failed in
    # opposite directions: a cell with semicolons and no comma survived whole,
    # while a single name containing commas was torn apart. These two check the
    # two directions separately, because either one alone still passes when the
    # separator is wrong.
    # strpos rather than LIKE '%;%': psycopg reads % in a SQL string as a
    # placeholder and rejects '%;' outright. See the tooling quirks in the
    # backend notes. Escaping it as '%%;%%' also works and is easier to get
    # wrong on the next edit.
    check("territory names, no unsplit semicolon remains (expect 0)",
          """SELECT count(*) FROM entity_name
              WHERE entity_type = 'Territory' AND strpos(name, ';') > 0""",
          lambda v: v == 0)
    # ISO 3166-1 numeric is three digits; the source file drops leading zeros
    # and the frontend pads on read. 30 codes are below 100, so an unpadded
    # store disagrees with the site on more than a tenth of the table.
    check("territory code_numeric is three digits (expect 0 short)",
          """SELECT count(*) FROM territory
              WHERE code_numeric IS NOT NULL AND length(code_numeric) <> 3""",
          lambda v: v == 0)
    check("territory BR numeric code is 076, not 76",
          "SELECT code_numeric FROM territory WHERE id = 'BR'",
          lambda v: v == '076')
    check("territory BQ keeps its comma-bearing name whole (expect 1)",
          """SELECT count(*) FROM entity_name
              WHERE entity_type = 'Territory' AND entity_id = 'BQ'
                AND name = 'Bonaire, Sint Eustatius, and Saba'""",
          lambda v: v == 1)
    # 18, not the 20 values in the cell. Two of the 20 are duplicates of each
    # other and one is "Bhārat", which is also India's name_endonym - and
    # add_name is keyed on (entity_id, name, kind, language_tag, source), so
    # both collapse into the row that already exists. Counting the cell rather
    # than the rows it produces gives 20 and fails.
    check("territory IN other endonyms, split into rows (expect 18)",
          """SELECT count(*) FROM entity_name n JOIN territory t ON t.id = n.entity_id
              WHERE n.entity_type = 'Territory' AND n.entity_id = 'IN'
                AND n.kind = 'endonym' AND n.name IS DISTINCT FROM t.name_endonym""",
          lambda v: v == 18)

    # D3, the territory roll-up. These are the checks that would catch a wrong
    # aggregation, which produces a plausible number rather than an error.
    check("D3 territory.population filled (expect 289)",
          "SELECT count(population) FROM territory", lambda v: v == 289)
    check("D3 groups with coordinates (expect 32)",
          """SELECT count(*) FROM territory t JOIN territory_scope ts ON ts.id = t.scope
              WHERE ts.is_group AND t.latitude IS NOT NULL""",
          lambda v: v == 32)
    check("D3 world population equals the sum of its continents (expect 0 diff)",
          """SELECT (SELECT population FROM territory WHERE id = '001')
                  - (SELECT SUM(population) FROM territory
                      WHERE contained_un_region_id = '001')""",
          lambda v: v == 0)
    # Every group must equal the sum of its own children, not just the root.
    check("D3 groups disagreeing with their children's sum (expect 0)",
          """SELECT count(*) FROM territory p
              JOIN territory_scope ts ON ts.id = p.scope
              JOIN (SELECT contained_un_region_id AS pid, SUM(population) AS pop
                      FROM territory WHERE contained_un_region_id IS NOT NULL
                     GROUP BY contained_un_region_id) agg ON agg.pid = p.id
             WHERE ts.is_group AND agg.pop <> 0 AND p.population <> agg.pop""",
          lambda v: v == 0)
    check("D3 groups with an out-of-range literacy percent (expect 0)",
          """SELECT count(*) FROM territory t JOIN territory_scope ts ON ts.id = t.scope
              WHERE ts.is_group
                AND t.literacy_percent IS NOT NULL
                AND t.literacy_percent NOT BETWEEN 0 AND 100""",
          lambda v: v == 0)
    check("D3 territories with an impossible coordinate (expect 0)",
          """SELECT count(*) FROM territory
              WHERE (latitude  IS NOT NULL AND latitude  NOT BETWEEN -90 AND 90)
                 OR (longitude IS NOT NULL AND longitude NOT BETWEEN -180 AND 180)""",
          lambda v: v == 0)
    check("D3 world pinned to the origin (expect 0,0)",
          "SELECT latitude || ',' || longitude FROM territory WHERE id = '001'",
          lambda v: str(v) in {"0.000000,0.000000", "0,0"})
    # Leaves must come through the roll-up untouched. If a country's population
    # no longer matches its UN figure, a group predicate has leaked.
    check("D3 leaf territories altered by the roll-up (expect 0)",
          """SELECT count(*) FROM territory t JOIN territory_scope ts ON ts.id = t.scope
              WHERE NOT ts.is_group
                AND t.population IS DISTINCT FROM t.population_from_un""",
          lambda v: v == 0)

    # D4, locale populations from censuses.
    check("D4 locales with a winning speaking census (expect ~3100)",
          "SELECT count(pop_speaking_census_id) FROM locale",
          lambda v: 2900 <= v <= 3300)
    # Scoped to StableDatabase from D5 onward. Every check below that counts a
    # DERIVED column has to be, because D5 adds ~21,500 generated rows that
    # legitimately carry one. An unscoped count would silently stop testing
    # what it was written to test.
    check("D4 locales with a speaking population (expect ~9301)",
          """SELECT count(pop_speaking_adjusted) FROM locale
              WHERE locale_source = 'StableDatabase'""",
          lambda v: 9050 <= v <= 9550)
    # Scoring speaking and writing separately is the whole reason D4 ranks
    # twice. If this collapses to 0, the writing weights have stopped working.
    check("D4 locales where speaking and writing chose different censuses (expect > 0)",
          """SELECT count(*) FROM locale
              WHERE pop_speaking_census_id IS NOT NULL
                AND pop_writing_census_id  IS NOT NULL
                AND pop_speaking_census_id <> pop_writing_census_id""",
          lambda v: v > 0)
    check("D4 percentages outside 0..100 (expect 0)",
          """SELECT count(*) FROM locale
              WHERE (pop_speaking_percent IS NOT NULL
                     AND pop_speaking_percent NOT BETWEEN 0 AND 100)
                 OR (pop_writing_percent IS NOT NULL
                     AND pop_writing_percent NOT BETWEEN 0 AND 100)""",
          lambda v: v == 0)
    check("D4 locale literacy outside 0..100 (expect 0)",
          """SELECT count(*) FROM locale
              WHERE literacy_percent IS NOT NULL
                AND literacy_percent NOT BETWEEN 0 AND 100""",
          lambda v: v == 0)
    # A locale with neither a census nor a curated figure must stay NULL. A 0
    # here would be indistinguishable from "nobody speaks this language".
    # Scoped away from D6 as well as to StableDatabase. D6 part B legitimately
    # gives a curated locale an adjusted figure it had no curated number for -
    # that is a family sum, not D4 inventing one - and it stamps
    # 'Aggregated from Languages' when it does. Without the exclusion this stops
    # testing D4 and starts reporting D6 working correctly as a failure.
    check("D4 locales with no source that were given a number anyway (expect 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'StableDatabase'
                AND pop_speaking_unadjusted IS NULL
                AND pop_speaking_census_id IS NULL
                AND pop_speaking_adjusted IS NOT NULL
                AND pop_speaking_source_derived
                    IS DISTINCT FROM 'Aggregated from Languages'""",
          lambda v: v == 0)
    # Writers CAN exceed speakers: the two uses pick different censuses, so a
    # 'Writes' census with a higher percentage than the winning 'Speaks' one
    # produces exactly this. The frontend caps literacy at 100 for the same
    # reason. Bounded rather than zero, because a large jump means the writing
    # arm has stopped applying its discounts.
    check("D4 locales with more writers than speakers (bounded, expect < 500)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'StableDatabase'
                AND pop_writing_adjusted > pop_speaking_adjusted""",
          lambda v: v < 500)
    # The curated figures must survive D4 untouched. The frontend overwrites
    # its in-memory equivalents; doing that here would lose locales.tsv.
    # Scoped from D6 onward. D6 is the first step to write pop_speaking_unadjusted
    # on a GENERATED row: a family locale's pre-census sum has exactly the
    # meaning this column carries for a curated one, and storing it there is
    # what lets D5's > 10 cutoff pick family locales up unchanged. Unscoped,
    # this check would count those 1,173 rows and stop describing locales.tsv.
    # 9040 before PR #745 revised locales.tsv (2026-08-11).
    check("D4 curated pop_speaking_unadjusted preserved (expect 9078)",
          """SELECT count(pop_speaking_unadjusted) FROM locale
              WHERE locale_source = 'StableDatabase'""",
          lambda v: v == 9078)
    # Now that pop_speaking_adjusted exists, territory_stats can order by
    # something real for COUNTRIES. Territory groups stay meaningless until D5
    # creates their locales.
    check("D4 territory_stats largest_language_speakers now populated (expect > 0)",
          "SELECT count(largest_language_speakers) FROM territory_stats",
          lambda v: v > 0)

    # Added 2026-08-05, catching up with merged PRs #742 and #744.
    check("D3 territory.population_writing filled (expect 289)",
          "SELECT count(population_writing) FROM territory", lambda v: v == 289)
    check("D3 world writing population is below its total (expect 1)",
          """SELECT count(*) FROM territory
              WHERE id = '001' AND population_writing < population""",
          lambda v: v == 1)
    # D6 writes the same column with 'Aggregated from Languages' on the curated
    # locales it raises, so the D4 count has to exclude that value or it drifts
    # upward every time the family sums reach one more macrolanguage.
    # 3100 before PR #745 added six census files (2026-08-11).
    check("D4 derived population source filled for census locales (expect 3243)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'StableDatabase'
                AND pop_speaking_source_derived IS NOT NULL
                AND pop_speaking_source_derived <> 'Aggregated from Languages'""",
          lambda v: v == 3243)
    # The curated attribution from locales.tsv must survive D4 untouched. The
    # frontend overwrites its in-memory equivalent; we deliberately do not.
    # 8844 before PR #745 revised locales.tsv (2026-08-11).
    check("D4 curated pop_speaking_source preserved (expect 8840)",
          "SELECT count(pop_speaking_source) FROM locale", lambda v: v == 8840)
    # Not an error: a contributor's attribution disagreeing with what the
    # winning census implies is exactly the signal keeping both columns buys.
    check("D4 curated vs derived source disagreements (bounded, expect < 2000)",
          """SELECT count(*) FROM locale
              WHERE pop_speaking_source IS NOT NULL
                AND pop_speaking_source_derived IS NOT NULL
                AND pop_speaking_source <> pop_speaking_source_derived""",
          lambda v: v < 2000)

    # Added 2026-08-05 for D5. The frontend overwrites its in-memory
    # pop.speaking.unadjusted with the winning census's estimate; these two
    # columns hold that without destroying the curated figure. D5 sums them, so
    # a gap here is a wrong regional population rather than a missing one.
    check("D4 derived head-count filled (expect ~9213, the census locales plus curated)",
          """SELECT count(pop_speaking_unadjusted_derived) FROM locale
              WHERE locale_source = 'StableDatabase'""",
          lambda v: 8800 <= v <= 9500)
    check("D4 derived head-count differs from curated where a census won (expect > 0)",
          """SELECT count(*) FROM locale
              WHERE pop_speaking_census_id IS NOT NULL
                AND pop_speaking_unadjusted IS NOT NULL
                AND pop_speaking_unadjusted_derived <> pop_speaking_unadjusted""",
          lambda v: v > 0)

    # D5, the regional locales. This step CREATES ROWS, so the checks are about
    # existence and arithmetic rather than about columns being filled.
    check("D5 regional locale rows (measured 21555)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createRegionalLocales'""",
          lambda v: 20000 <= v <= 23000)
    check("D5 territory groups given locales (expect 32)",
          """SELECT count(DISTINCT territory_id) FROM locale
              WHERE locale_source = 'createRegionalLocales'""",
          lambda v: v == 32)
    check("D5 regional locales at the world (measured 5882)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createRegionalLocales' AND territory_id = '001'""",
          lambda v: 5000 <= v <= 7000)
    # The single number most likely to be noticed if it moves, and the one an
    # off-by-one-level bug changes without breaking anything else.
    # Was 1,232,293,765 until PR #745 (2026-08-11). The 43,669,147 drop
    # reconciles exactly against two independent causes, which is why it was
    # accepted rather than investigated as a regression:
    #   eng_TZ  -43,770,499  the new tz.tsv census supplies 1,566,000 for
    #                        English in Tanzania, overriding a curated
    #                        46,548,849. Upstream data, and the frontend
    #                        prefers a census over a curated figure too.
    #   eng_MW    +101,352   the new under-ten penalty stops a 1-person
    #                        afrobarometer record from winning, promoting one
    #                        estimating 103,320.
    # Net -43,669,147, matching the observed move to the digit.
    check("D5 English worldwide speakers (measured 1188624618)",
          """SELECT pop_speaking_adjusted FROM locale
              WHERE id = 'reg.eng_001'""",
          lambda v: v is not None and abs(int(v) - 1_188_624_618) < 1_000_000)
    check("D5 Hindi worldwide speakers (measured 810041889)",
          """SELECT pop_speaking_adjusted FROM locale
              WHERE id = 'reg.hin_001'""",
          lambda v: v is not None and abs(int(v) - 810_041_889) < 1_000_000)
    # Every group, not just the world. A predicate that leaks one level would
    # still satisfy a root-only check.
    check("D5 groups whose speakers disagree with their children's sum (expect 0)",
          """SELECT count(*) FROM locale p
              JOIN territory pt ON pt.id = p.territory_id
              JOIN LATERAL (
                    SELECT NULLIF(SUM(c.pop_speaking_adjusted), 0) AS total
                      FROM locale c
                      JOIN territory ct ON ct.id = c.territory_id
                      JOIN territory_scope cts ON cts.id = ct.scope
                     WHERE ct.contained_un_region_id = p.territory_id
                       AND c.language_id = p.language_id
                       AND c.script_id IS NOT DISTINCT FROM p.script_id
                       AND c.variant_key = p.variant_key
                       -- Mirrors D5's own leaf filter, and it has to. D6
                       -- generates a family locale per classification source
                       -- and D5 aggregates the ISO ones only; a check that
                       -- summed all of them would report D5 as broken for
                       -- doing exactly what it is supposed to do. Measured at
                       -- 477 false failures without this line.
                       AND (c.language_source IS NULL
                            OR c.language_source = 'ISO')
                       AND (CASE WHEN cts.is_group
                                 THEN c.locale_source = 'createRegionalLocales'
                                 ELSE TRUE END)
                   ) agg ON TRUE
             WHERE p.locale_source = 'createRegionalLocales'
               AND p.pop_speaking_adjusted IS DISTINCT FROM agg.total""",
          lambda v: v == 0)
    # The prefix is the whole reason a curated locale on a group territory can
    # coexist with a generated one. If this is not 0 the two have collided.
    # left() rather than LIKE: a % in a SQL string is a psycopg placeholder.
    check("D5 generated ids missing their reg. prefix (expect 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createRegionalLocales'
                AND left(id, 4) <> 'reg.'""",
          lambda v: v == 0)
    check("D5 curated group-territory locales still present (expect 30)",
          """SELECT count(*) FROM locale l
              JOIN territory t ON t.id = l.territory_id
              JOIN territory_scope ts ON ts.id = t.scope
             WHERE l.locale_source = 'StableDatabase' AND ts.is_group""",
          lambda v: v == 30)
    # A generated row must never carry a curated column. It is what keeps D4
    # from claiming these rows on a later run.
    check("D5 generated rows carrying a curated value (expect 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createRegionalLocales'
                AND (pop_speaking_unadjusted IS NOT NULL
                     OR pop_speaking_source IS NOT NULL
                     OR official_status IS NOT NULL)""",
          lambda v: v == 0)
    # computeAggregatedLocalesPopulation.ts:22-25 leaves this undefined rather
    # than copying the territory rate. A regional locale with literacy but no
    # writers means the D4 fallback leaked in.
    # Resolved 2026-08-05. territory_stats used to pick its locales with
    # an unconditional locale_source = 'StableDatabase', so it could not see a
    # single row D5 creates. It reported the world's largest language as `vol`
    # (Volapuk, 200 speakers), that being the only curated locale on '001' with
    # a number at all. A wrong answer, not a missing one.
    check("territory_stats groups with a largest language (expect 32)",
          """SELECT count(*) FROM territory_stats s
              JOIN territory t ON t.id = s.territory_id
              JOIN territory_scope ts ON ts.id = t.scope
             WHERE ts.is_group AND s.largest_language_id IS NOT NULL""",
          lambda v: v == 32)
    # The specific regression. Before the fix this was 200.
    check("territory_stats world largest language is a real one (expect > 1e9)",
          """SELECT largest_language_speakers FROM territory_stats
              WHERE territory_id = '001'""",
          lambda v: v is not None and int(v) > 1_000_000_000)
    # The two columns must never disagree. An id with no count behind it reads
    # as "computed, and this is the answer" when nothing was computed.
    check("territory_stats rows naming a language with no count (expect 0)",
          """SELECT count(*) FROM territory_stats
              WHERE largest_language_id IS NOT NULL
                AND largest_language_speakers IS NULL""",
          lambda v: v == 0)
    # Countries were already correct and must stay that way: the fix changes
    # which locales a GROUP reads, and nothing about a leaf.
    check("territory_stats countries unchanged by the group fix (expect zho for CN)",
          """SELECT largest_language_id FROM territory_stats
              WHERE territory_id = 'CN'""",
          lambda v: v == "zho")

    check("D5 regional literacy without both sides of the ratio (expect 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createRegionalLocales'
                AND literacy_percent IS NOT NULL
                AND (COALESCE(pop_speaking_adjusted, 0) = 0
                     OR COALESCE(pop_writing_adjusted, 0) = 0)""",
          lambda v: v == 0)

    # D6, the family locales. Like D5 this CREATES ROWS, so most of these are
    # about which rows exist rather than about columns being filled. Every count
    # here has to be source-aware: D6 runs once per classification source.
    check("D6 family locale rows, all sources (measured 21118)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createFamilyLocales'""",
          lambda v: 19000 <= v <= 23000)
    check("D6 sources that produced rows (expect 5 of 7)",
          """SELECT count(DISTINCT language_source) FROM locale
              WHERE locale_source = 'createFamilyLocales'""",
          lambda v: v == 5)
    # The ISO count is pinned separately because it is the only one the live
    # site can be compared against, and because D5 aggregates ISO alone.
    check("D6 ISO family locale rows (measured 1388)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createFamilyLocales'
                AND language_source = 'ISO'""",
          lambda v: 1200 <= v <= 1600)
    check("D6 Glottolog family locale rows (measured 16836)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createFamilyLocales'
                AND language_source = 'Glottolog'""",
          lambda v: 15000 <= v <= 18500)
    check("D6 distinct ISO families given locales (measured 144)",
          """SELECT count(DISTINCT language_id) FROM locale
              WHERE locale_source = 'createFamilyLocales'
                AND language_source = 'ISO'""",
          lambda v: 120 <= v <= 180)
    # Every generated row must sit on a languoid that is a parent IN ITS OWN
    # SOURCE. Checking against ISO alone would pass 16,832 Glottolog rows as
    # failures and is exactly the mistake the language_source column exists to
    # stop: a row belongs to one tree, and only that tree can validate it.
    check("D6 family locales whose language is not a parent in their own source (expect 0)",
          """SELECT count(*) FROM locale l
              WHERE l.locale_source = 'createFamilyLocales'
                AND NOT EXISTS (SELECT 1 FROM language_source_attribute a
                                 WHERE a.source = l.language_source
                                   AND a.parent_language_id = l.language_id)""",
          lambda v: v == 0)
    # THE REASON locale.language_source EXISTS. These pairs have a family locale
    # in more than one classification, so before the column they collided on
    # locale's UNIQUE key and whichever source ran last silently won. If this
    # ever reads 0, the per-source scoping has stopped working and every source
    # is producing the same tree.
    check("D6 (language, territory) pairs held by more than one source (expect > 0)",
          """SELECT count(*) FROM (
                SELECT language_id, territory_id FROM locale
                 WHERE locale_source = 'createFamilyLocales'
                 GROUP BY 1, 2 HAVING count(DISTINCT language_source) > 1) x""",
          lambda v: v > 0)
    # And of those, the ones where the sources genuinely disagree about the
    # number. This is the subset that would have been silently wrong rather than
    # merely duplicated.
    check("D6 pairs where sources disagree on the population (measured 31)",
          """SELECT count(*) FROM (
                SELECT language_id, territory_id FROM locale
                 WHERE locale_source = 'createFamilyLocales'
                 GROUP BY 1, 2
                HAVING count(DISTINCT COALESCE(pop_speaking_unadjusted, -1)) > 1) x""",
          lambda v: v > 0)
    # Two rows for the same family in the same source and territory would mean
    # the level loop ran a language twice.
    check("D6 duplicate (language, territory, source) rows (expect 0)",
          """SELECT count(*) FROM (
                SELECT language_id, territory_id, language_source FROM locale
                 WHERE locale_source = 'createFamilyLocales'
                 GROUP BY 1, 2, 3 HAVING count(*) > 1) x""",
          lambda v: v == 0)
    # D5 aggregates ISO family locales ONLY. If a regional locale ever appears
    # for a languoid that is a family in some other source but NOT in ISO, the
    # leaf filter has leaked and the regional numbers are overcounted.
    check("D6 regional locales built from a non-ISO family (expect 0)",
          """SELECT count(*) FROM locale r
              WHERE r.locale_source = 'createRegionalLocales'
                AND EXISTS (SELECT 1 FROM locale f
                             WHERE f.locale_source = 'createFamilyLocales'
                               AND f.language_id = r.language_id
                               AND f.language_source <> 'ISO')
                AND NOT EXISTS (SELECT 1 FROM language_source_attribute a
                                 WHERE a.source = 'ISO'
                                   AND a.parent_language_id = r.language_id)
                AND NOT EXISTS (SELECT 1 FROM locale cur
                                 WHERE cur.language_id = r.language_id
                                   AND cur.locale_source = 'StableDatabase')""",
          lambda v: v == 0)
    # THE SHADOWING RULE. createLocalesForLanguageFamily creates nothing when a
    # locale already exists at (family, territory) - the curated figure wins and
    # is what travels upward. If this is ever non-zero, a measured
    # macrolanguage population has been replaced by the sum of its parts.
    check("D6 family locales duplicating a curated locale (expect 0)",
          """SELECT count(*) FROM locale l
              WHERE l.locale_source = 'createFamilyLocales'
                AND EXISTS (SELECT 1 FROM locale c
                             WHERE c.language_id  = l.language_id
                               AND c.territory_id = l.territory_id
                               AND c.script_id IS NULL
                               AND c.variant_key = ''
                               AND c.locale_source = 'StableDatabase')""",
          lambda v: v == 0)
    # createFamilyLocales.ts:41-42 drops script and variant locales from the
    # child list, so no generated row can carry either.
    check("D6 family locales carrying a script or variant (expect 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createFamilyLocales'
                AND (script_id IS NOT NULL OR variant_key <> '')""",
          lambda v: v == 0)
    # The source is IN the id, not only in the column, because entity.id is a
    # single primary key and the same family in two classifications is two rows.
    # left() rather than LIKE: a % in a SQL string is a psycopg placeholder.
    check("D6 generated ids missing their fam.SOURCE. prefix (expect 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createFamilyLocales'
                AND left(id, 5 + length(language_source::text))
                    <> 'fam.' || language_source::text || '.'""",
          lambda v: v == 0)
    # Part A stores the pre-census sum and part B the post-census one, in the
    # same two columns a curated locale uses. If they never disagree then part B
    # is not running and half the step is silently dead - the same class of
    # check as D4's "speaking and writing chose different censuses".
    check("D6 family locales moved by part B (measured 5660, ISO 354, expect > 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'createFamilyLocales'
                AND pop_speaking_unadjusted_derived
                    IS DISTINCT FROM pop_speaking_unadjusted""",
          lambda v: v > 0)
    # Part B reaches CURATED locales too, and raising a macrolanguage to the sum
    # of its children is the point of it. 0 would mean the parent-locale edge
    # table found nothing.
    check("D6 curated locales raised by the family sum (measured 13, expect > 0)",
          """SELECT count(*) FROM locale
              WHERE locale_source = 'StableDatabase'
                AND pop_speaking_source_derived = 'Aggregated from Languages'""",
          lambda v: v > 0)
    # `if (pop.census) return`. A locale whose speaking figure came from a
    # winning census must keep it.
    check("D6 census-backed locales overwritten by the family sum (expect 0)",
          """SELECT count(*) FROM locale
              WHERE pop_speaking_census_id IS NOT NULL
                AND pop_speaking_source_derived = 'Aggregated from Languages'""",
          lambda v: v == 0)
    # Every sum is capped at the territory's population, and every cap is
    # written to data_quality_finding. A row above the cap means the clamp was
    # dropped somewhere.
    check("D6 rows exceeding their territory's population (expect 0)",
          """SELECT count(*) FROM locale l
              JOIN territory t ON t.id = l.territory_id
             WHERE l.pop_speaking_adjusted > t.population
               AND (l.locale_source = 'createFamilyLocales'
                    OR l.pop_speaking_source_derived = 'Aggregated from Languages')""",
          lambda v: v == 0)
    # THE INTEGRATION POINT. D5's leaf branch takes every locale on a leaf
    # territory whatever its source, so family locales must show up as extra
    # regional locales for family languoids. If this collapses, D6 and D5 have
    # stopped talking to each other and the regional numbers are short by
    # whatever the families would have added, with nothing raising.
    check("D6 regional locales now existing for ISO family languoids (expect > 1000)",
          """SELECT count(*) FROM locale r
              WHERE r.locale_source = 'createRegionalLocales'
                AND EXISTS (SELECT 1 FROM language_source_attribute a
                             WHERE a.source = 'ISO'
                               AND a.parent_language_id = r.language_id)""",
          lambda v: v > 1000)

    # ── D7, writing system populations ─────────────────────────────────────
    # Predicted from the loaded data before the function was written, the way
    # D6's row counts were, so a match is two independent routes to one number.
    check("D7 writing systems with an upper bound (expect 125)",
          "SELECT count(population_upper_bound) FROM writing_system",
          lambda v: v == 125)
    # 125 are SET and only 88 exceed zero. The frontend initialises the field to
    # 0 for any script that is some language's primary one, so a 0 says
    # "languages write with this and we have no figures" while NULL says "no
    # language writes with this". Collapsing them loses a real distinction, and
    # this is the check that would catch it.
    check("D7 writing systems with a POSITIVE upper bound (expect 88)",
          "SELECT count(*) FROM writing_system WHERE population_upper_bound > 0",
          lambda v: v == 88)
    check("D7 Latn upper bound (expect 5240995838)",
          "SELECT population_upper_bound FROM writing_system WHERE id = 'Latn'",
          lambda v: v == 5_240_995_838)
    check("D7 writing systems with a descendant population (expect 39)",
          "SELECT count(population_of_descendants) FROM writing_system",
          lambda v: v == 39)
    # The case the column exists for, and the frontend's own worked example:
    # Egyptian hieroglyphs have no writers of their own and everything descended
    # from them has billions. If this collapses to NULL the closure has stopped
    # reaching past the first level.
    check("D7 Egyp descendant population (expect 9679661074)",
          "SELECT population_of_descendants FROM writing_system WHERE id = 'Egyp'",
          lambda v: v == 9_679_661_074)
    # `descendantPopulation || undefined`. 13 scripts are the parent of
    # something whose descendants all sum to zero; a stored 0 would be
    # indistinguishable from having no children at all.
    check("D7 writing systems storing a zero descendant population (expect 0)",
          """SELECT count(*) FROM writing_system
              WHERE population_of_descendants = 0""",
          lambda v: v == 0)
    # The closure has to reach every node or some scripts are silently skipped.
    # 197 have a parent, 28 are roots, and all 225 are reachable from a root.
    check("D7 writing systems unreachable from a root (expect 0)",
          """WITH RECURSIVE reachable AS (
                SELECT id FROM writing_system WHERE parent_writing_system_id IS NULL
                UNION ALL
                SELECT c.id FROM writing_system c
                  JOIN reachable r ON c.parent_writing_system_id = r.id)
              SELECT count(*) FROM writing_system w
               WHERE NOT EXISTS (SELECT 1 FROM reachable r WHERE r.id = w.id)""",
          lambda v: v == 0)
    # STRUCTURAL. A parent's descendant sum must cover each child's own
    # descendants plus that child itself. This is the check that catches a
    # closure joined on the wrong column, which is otherwise a plausible number.
    check("D7 writing systems whose parent totals less than they do (expect 0)",
          """SELECT count(*) FROM writing_system c
              JOIN writing_system p ON p.id = c.parent_writing_system_id
             WHERE COALESCE(p.population_of_descendants, 0)
                 < COALESCE(c.population_of_descendants, 0)
                 + COALESCE(c.population_upper_bound, 0)""",
          lambda v: v == 0)

    # ── D7, descendant counts (Q1(a), FP-010) ──────────────────────────────
    # Until 2026-08-06 both columns were NOT NULL DEFAULT 0, so a plain count()
    # reported them fully populated while D7 had never run and every value was
    # 0. Now that they are nullable, count() is the honest audit again - and if
    # this ever drops below the row count, D7 did not run.
    check("D7 language_source_attribute rows counted (expect 60173)",
          "SELECT count(descendant_count) FROM language_source_attribute",
          lambda v: v == 60173)
    check("D7 attribute rows with descendants (expect 9574)",
          """SELECT count(*) FROM language_source_attribute
              WHERE descendant_count > 0""",
          lambda v: v == 9574)
    # Two independent routes to one number: the sum of the per-node counts must
    # equal the number of ancestor edges in the closure D1 built. A grouping
    # error moves one without the other.
    check("D7 counts disagreeing with the ancestry closure (expect 0)",
          """SELECT count(*) FROM (
                SELECT a.source,
                       sum(a.descendant_count) AS counted,
                       (SELECT count(*) FROM language_ancestry la
                         WHERE la.source = a.source AND la.depth > 0) AS edges
                  FROM language_source_attribute a
                 GROUP BY a.source) x
             WHERE x.counted <> x.edges""",
          lambda v: v == 0)
    check("D7 Glottolog descendant edges (expect 182385)",
          """SELECT sum(descendant_count) FROM language_source_attribute
              WHERE source = 'Glottolog'""",
          lambda v: v == 182385)
    # STRUCTURAL, and the strongest check here. A parent's descendant set
    # strictly contains each child's plus the child itself, so a parent must
    # count MORE than any of its children in the same source. An off-by-one or a
    # join that crosses sources breaks this and nothing else would show it.
    check("D7 languoids counting no more than a child does (expect 0)",
          """SELECT count(*) FROM language_source_attribute c
              JOIN language_source_attribute p
                ON p.language_id = c.parent_language_id AND p.source = c.source
             WHERE p.descendant_count <= c.descendant_count""",
          lambda v: v == 0)
    # CLDR defines 153 attribute rows and no parent edges at all, so every one
    # of them is correctly 0 rather than NULL: they ARE in the tree, with
    # nothing beneath them.
    check("D7 CLDR rows with a descendant count above zero (expect 0)",
          """SELECT count(*) FROM language_source_attribute
              WHERE source = 'CLDR' AND descendant_count > 0""",
          lambda v: v == 0)
    # The mirror. NULL where there is no Combined row, because those languoids
    # are not in that tree at all - a different statement from having nothing
    # beneath them, and 0 would erase it.
    check("D7 languages mirroring a Combined count (expect 8342)",
          "SELECT count(descendant_count) FROM language",
          lambda v: v == 8342)
    check("D7 languages whose mirror disagrees with the Combined row (expect 0)",
          """SELECT count(*) FROM language l
              JOIN language_source_attribute a
                ON a.language_id = l.id AND a.source = 'Combined'
             WHERE l.descendant_count IS DISTINCT FROM a.descendant_count""",
          lambda v: v == 0)
    check("D7 languages given a count with no Combined row (expect 0)",
          """SELECT count(*) FROM language l
              WHERE l.descendant_count IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM language_source_attribute a
                                 WHERE a.language_id = l.id
                                   AND a.source = 'Combined')""",
          lambda v: v == 0)

    # ── D8, the language population precedence chain ──────────────────────
    check("D8 languages with a speaking estimate (measured 7634)",
          "SELECT count(pop_speaking_estimate) FROM language",
          lambda v: 7400 <= v <= 7900)
    check("D8 languages with a writing estimate (measured 7633)",
          "SELECT count(pop_writing_estimate) FROM language",
          lambda v: 7400 <= v <= 7900)
    check("D8 languages with an overall estimate (measured 7630)",
          "SELECT count(population_estimate) FROM language",
          lambda v: 7400 <= v <= 7900)
    check("D8 languages fed by a World locale (measured 6005)",
          "SELECT count(pop_speaking_from_locales) FROM language",
          lambda v: 5800 <= v <= 6300)
    # The single number most easily checked by hand: English's estimate comes
    # from its World locale, so it must equal reg.eng_001 exactly. If these ever
    # disagree, the precedence chain is reading the wrong column.
    check("D8 English estimate equals its World locale (expect 0 difference)",
          """SELECT abs(COALESCE((SELECT pop_speaking_estimate FROM language
                                   WHERE id = 'eng'), 0)
                      - COALESCE((SELECT pop_speaking_adjusted FROM locale
                                   WHERE id = 'reg.eng_001'), 0))""",
          lambda v: v == 0)
    # Far fewer than the 260 languoids that HAVE children, because the
    # descendants branch is the last resort - a family D5 gave a World row takes
    # the territories branch. What survives here is the FP-014 gap.
    #
    # THIS IS A SUM COMPUTED, NOT A BRANCH TAKEN. Every node in the level loop
    # gets a descendant sum whenever its children have estimates, whether or
    # not that sum ends up being ITS OWN chosen estimate - the World-locale and
    # rough-figure branches both run first and both can win instead. The check
    # below counts languoids that actually SELECTED this branch; this one
    # counts how many had a sum available at all. Found retrospectively: the
    # two numbers differ by two orders of magnitude, and the old label
    # conflated them.
    check("D8 languages with a descendant sum computed (measured 234)",
          "SELECT count(pop_speaking_of_descendants) FROM language",
          lambda v: 150 <= v <= 350)
    # The number the old check's name actually promised: languoids whose FINAL
    # speaking estimate came from the descendants branch, not merely languoids
    # that had a sum available. Nearly all 234 above lost to a higher-precedence
    # branch - a World locale or the rough languages.tsv figure - so this is
    # smaller by two orders of magnitude, and that gap is the FP-014 story: the
    # descendants branch is the last resort, and it is rarely reached.
    check("D8 languages whose speaking estimate IS the descendant sum (measured 8)",
          """SELECT count(*) FROM language
              WHERE pop_speaking_estimate_source = 'Aggregated from Languages'""",
          lambda v: 0 <= v <= 50)
    # The overall figure is a max of the two uses, so it can never be below
    # either. A sum would break this instantly.
    check("D8 overall estimates below one of their own uses (expect 0)",
          """SELECT count(*) FROM language
              WHERE population_estimate IS NOT NULL
                AND (population_estimate < COALESCE(pop_speaking_estimate, 0)
                  OR population_estimate < COALESCE(pop_writing_estimate, 0))""",
          lambda v: v == 0)
    # `language` mirrors Combined and nothing else, exactly as descendant_count
    # does. A languoid outside that tree must keep NULL.
    check("D8 estimates given to a language with no Combined row (expect 0)",
          """SELECT count(*) FROM language l
              WHERE l.pop_speaking_estimate IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM language_source_attribute a
                                 WHERE a.language_id = l.id
                                   AND a.source = 'Combined')""",
          lambda v: v == 0)

    # ── D9, the largest descendant ────────────────────────────────────────
    # 232 of the 260 Combined languoids that have descendants at all. The 28
    # without an answer have subtrees that are entirely families or entirely
    # unpopulated, which is a legitimate NULL rather than a miss.
    check("D9 Combined languoids with a largest descendant (measured 232)",
          """SELECT count(largest_descendant_id) FROM language_source_attribute
              WHERE source = 'Combined'""",
          lambda v: 200 <= v <= 260)
    check("D9 languages mirroring a Combined answer (measured 232)",
          "SELECT count(largest_descendant_id) FROM language",
          lambda v: 200 <= v <= 260)
    # Chinese is the check that can be done by hand: Mandarin is the biggest
    # thing under it and nothing else comes close.
    check("D9 zho largest descendant (expect cmn)",
          "SELECT largest_descendant_id FROM language WHERE id = 'zho'",
          lambda v: v == "cmn")
    # Indo-European resolves to Punjabi, which looks wrong and is not. English
    # is a ROOT in the Combined tree - it has no parent there - so its
    # 1,188,624,618 is correctly not a candidate for `ine`. If this ever starts
    # returning eng, the Combined tree has gained edges and D8's numbers move
    # with it.
    check("D9 ine largest descendant (expect pan, NOT eng)",
          "SELECT largest_descendant_id FROM language WHERE id = 'ine'",
          lambda v: v == "pan")
    check("D9 ine largest descendant population (measured 176654800)",
          """SELECT population_estimate FROM language
              WHERE id = (SELECT largest_descendant_id FROM language
                           WHERE id = 'ine')""",
          lambda v: v == 176654800)
    # THE CHECK THAT PROVES THE BASE-SCOPE FALLBACK IS LIVE. tid and kgd carry
    # no scope on their Combined row and are Families only via ISO/Glottolog.
    # Without the fallback these two ancestors name a language family as their
    # largest language; with it they correctly name nothing.
    check("D9 itd and ncq resolve to NULL, proving the scope fallback (expect 0)",
          """SELECT count(largest_descendant_id) FROM language
              WHERE id IN ('itd', 'ncq')""",
          lambda v: v == 0)
    check("D9 languoids that are their own largest descendant (expect 0)",
          """SELECT count(*) FROM language_source_attribute
              WHERE largest_descendant_id = language_id""",
          lambda v: v == 0)
    # The Family exclusion, tested on the same effective scope the function
    # uses. A raw lsa.scope test here would pass while the bug was present,
    # because 8,227 of 8,342 Combined rows have no scope of their own.
    check("D9 answers pointing at a language family (expect 0)",
          """SELECT count(*) FROM language_source_attribute a
              JOIN language_source_attribute d
                ON d.language_id = a.largest_descendant_id AND d.source = a.source
              LEFT JOIN language_source_attribute iso
                ON iso.language_id = d.language_id AND iso.source = 'ISO'
              LEFT JOIN language_source_attribute glot
                ON glot.language_id = d.language_id AND glot.source = 'Glottolog'
             WHERE a.largest_descendant_id IS NOT NULL
               AND COALESCE(d.scope, iso.scope, glot.scope) = 5""",
          lambda v: v == 0)
    check("D9 answers pointing at a zero or unknown population (expect 0)",
          """SELECT count(*) FROM language_source_attribute a
              JOIN language_source_attribute d
                ON d.language_id = a.largest_descendant_id AND d.source = a.source
             WHERE a.largest_descendant_id IS NOT NULL
               AND COALESCE(d.population_estimate, 0) <= 0""",
          lambda v: v == 0)
    # The "is it really the maximum" check, and the one that would catch a
    # partition or join mistake. If any other qualifying descendant of an
    # ancestor beats the one that was chosen, the ranking is wrong.
    check("D9 answers beaten by another of their own descendants (expect 0)",
          """SELECT count(*) FROM language_source_attribute a
              JOIN language chosen ON chosen.id = a.largest_descendant_id
             WHERE a.source = 'Combined'
               AND a.largest_descendant_id IS NOT NULL
               AND EXISTS (
                     SELECT 1 FROM language_ancestry an
                       JOIN language_source_attribute d
                         ON d.language_id = an.descendant_id AND d.source = 'Combined'
                       LEFT JOIN language_source_attribute iso
                         ON iso.language_id = d.language_id AND iso.source = 'ISO'
                       LEFT JOIN language_source_attribute glot
                         ON glot.language_id = d.language_id AND glot.source = 'Glottolog'
                      WHERE an.source = 'Combined'
                        AND an.ancestor_id = a.language_id
                        AND an.depth > 0
                        AND COALESCE(d.scope, iso.scope, glot.scope) IS DISTINCT FROM 5
                        AND d.population_estimate > chosen.population_estimate)""",
          lambda v: v == 0)
    # An ancestor with no descendants at all cannot have an answer. This is the
    # depth > 0 clause: without it every populated languoid would name itself.
    check("D9 answers given to a languoid with no descendants (expect 0)",
          """SELECT count(*) FROM language_source_attribute a
              WHERE a.largest_descendant_id IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM language_ancestry an
                                 WHERE an.source = a.source
                                   AND an.ancestor_id = a.language_id
                                   AND an.depth > 0)""",
          lambda v: v == 0)
    # `language` mirrors Combined and nothing else, exactly as D7 and D8 do.
    check("D9 answers given to a language with no Combined row (expect 0)",
          """SELECT count(*) FROM language l
              WHERE l.largest_descendant_id IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM language_source_attribute a
                                 WHERE a.language_id = l.id
                                   AND a.source = 'Combined')""",
          lambda v: v == 0)
    check("D9 mirrors disagreeing with the Combined row (expect 0)",
          """SELECT count(*) FROM language l
              JOIN language_source_attribute a
                ON a.language_id = l.id AND a.source = 'Combined'
             WHERE l.largest_descendant_id
                   IS DISTINCT FROM a.largest_descendant_id""",
          lambda v: v == 0)
    # The other six trees have no D8 estimates to rank, so D9 must not have
    # written to them. A non-zero here means the call site widened without D8.
    check("D9 answers written to a non-Combined source (expect 0)",
          """SELECT count(largest_descendant_id) FROM language_source_attribute
              WHERE source <> 'Combined'""",
          lambda v: v == 0)

    # ── D10, depth ────────────────────────────────────────────────────────
    # Depth covers every source, not just Combined, because it depends on D1
    # alone. 60,173 measured 2026-08-11.
    check("D10 depth filled on every source attribute (expect 60173)",
          "SELECT count(depth) FROM language_source_attribute",
          lambda v: v == 60173)
    check("D10 attributes with no depth (expect 0)",
          "SELECT count(*) FROM language_source_attribute WHERE depth IS NULL",
          lambda v: v == 0)
    # The definition, asserted rather than described. depth 0 and "no parent in
    # this source" have to be the same set in both directions: one direction
    # alone passes on a table of zeroes.
    check("D10 depth 0 disagreeing with having no parent (expect 0)",
          """SELECT count(*) FROM language_source_attribute
              WHERE (depth = 0) <> (parent_language_id IS NULL)""",
          lambda v: v == 0)
    # A child is always exactly one level below its parent. This is the check
    # that fails if max() over the closure ever stops meaning root distance -
    # the multi-parent case the function comment warns about.
    check("D10 children not exactly one level below their parent (expect 0)",
          """SELECT count(*) FROM language_source_attribute c
              JOIN language_source_attribute p
                ON p.language_id = c.parent_language_id AND p.source = c.source
             WHERE c.depth <> p.depth + 1""",
          lambda v: v == 0)
    check("D10 deepest Combined languoid (expect 5)",
          """SELECT max(depth) FROM language_source_attribute
              WHERE source = 'Combined'""",
          lambda v: v == 5)
    check("D10 deepest Glottolog languoid (expect 26)",
          """SELECT max(depth) FROM language_source_attribute
              WHERE source = 'Glottolog'""",
          lambda v: v == 26)

    # ── D10, the vitality rollup ──────────────────────────────────────────
    # 7,923 declared plus 117 inherited, measured 2026-08-11. Note the
    # declared figure counts every `language` row, not the Combined ones: one
    # languoid carries an iso_status and has no Combined row, and the frontend
    # gives it a vitality too, because computeRecursiveLanguageData iterates
    # the whole dictionary rather than one tree.
    check("D10 languages with a derived ISO vitality (measured 8040)",
          "SELECT count(vitality_iso) FROM language",
          lambda v: 7900 <= v <= 8200)
    # The tree walk's entire output. Everything else on this axis is a copy of
    # a declared value, so a 0 here is the level loop having stopped rolling
    # anything up - which leaves 7,922 filled rows and looks like success.
    check("D10 vitality inherited from descendants (measured 117)",
          """SELECT count(*) FROM language
              WHERE vitality_iso IS NOT NULL AND iso_status IS NULL""",
          lambda v: 100 <= v <= 140)
    # The declared value must never be overwritten by the rollup, which is the
    # `if (lang.ISO.status != null)` branch. A max() taken unconditionally
    # would raise extinct languages to the vitality of their living dialects.
    check("D10 declared ISO statuses changed by the rollup (expect 0)",
          """SELECT count(*) FROM language
              WHERE iso_status IS NOT NULL AND vitality_iso <> iso_status""",
          lambda v: v == 0)
    # No inherited value may exceed the best value in its own subtree. Catches
    # an off-by-one-level loop, which produces plausible vitality everywhere
    # rather than an error anywhere.
    check("D10 inherited vitality exceeding its own subtree (expect 0)",
          """SELECT count(*) FROM language l
              WHERE l.iso_status IS NULL AND l.vitality_iso IS NOT NULL
                AND l.vitality_iso > (
                      SELECT max(d.iso_status) FROM language_ancestry a
                        JOIN language d ON d.id = a.descendant_id
                       WHERE a.source = 'Combined'
                         AND a.ancestor_id = l.id AND a.depth > 0)""",
          lambda v: v == 0)
    # EXPECTED ZERO, and the reason is upstream. sil/ethnologue2012.tsv and
    # sil/ethnologue2025.tsv are header-only in this repository, so both
    # Ethnologue scales are empty and every metascore falls through to ISO.
    # Asserted as zero rather than left uncounted: an empty column with no
    # check beside it is indistinguishable from a step that never ran, and
    # this one legitimately cannot fill. The day those files gain rows this
    # check fails and points at the reason.
    check("D10 Ethnologue fine vitality (expect 0, files are header-only)",
          "SELECT count(vitality_eth_fine) FROM language", lambda v: v == 0)
    check("D10 Ethnologue coarse vitality (expect 0, files are header-only)",
          "SELECT count(vitality_eth_coarse) FROM language", lambda v: v == 0)
    # With both Ethnologue scales empty the metascore IS the ISO rollup, so
    # these two must agree row for row. That equality stops holding the moment
    # Ethnologue data arrives, at which point the two checks above fail first
    # and say why.
    check("D10 metascores disagreeing with the ISO rollup (expect 0)",
          """SELECT count(*) FROM language
              WHERE vitality_meta IS DISTINCT FROM vitality_iso""",
          lambda v: v == 0)
    # A metascore where every input is NULL would be written as 0, which reads
    # as Extinct on all three scales.
    check("D10 metascores invented from no input (expect 0)",
          """SELECT count(*) FROM language
              WHERE vitality_meta IS NOT NULL AND vitality_iso IS NULL
                AND vitality_eth_fine IS NULL AND vitality_eth_coarse IS NULL""",
          lambda v: v == 0)
    # LanguageISOStatus.SpecialCode is -1 and the metascore falls through to
    # it. The column shipped as smallint CHECK (BETWEEN 0 AND 9); this is the
    # check that proves the widened bound is real rather than decoration.
    check("D10 Special Code languoids scoring -1 (expect 4)",
          "SELECT count(*) FROM language WHERE vitality_meta = -1",
          lambda v: v == 4)

    # ── D10, coordinates ──────────────────────────────────────────────────
    # THE LOADED POSITIONS MUST NOT MOVE. latitude holds Glottolog data as
    # well as derived data, and 1,137 of those languoids have no Combined row,
    # so an unqualified clear before the rebuild deletes them and the run
    # still reports success. This number going DOWN is the whole point of the
    # check; a total over both provenances would hide it.
    check("D10 Glottolog-loaded coordinates still present (expect 8907)",
          "SELECT count(*) FROM language WHERE coords_source = 'Glottolog'",
          lambda v: v == 8907)
    # 170 measured, and the split is what justifies the level loop. 162 could
    # be answered from loaded positions alone; the other 8 have no child with
    # one and only become answerable once a child has itself been placed. 48
    # of the 170 draw on at least one derived child, so a single pass would
    # not merely miss 8 rows, it would move 48 more.
    check("D10 coordinates derived for grouping nodes (measured 170)",
          "SELECT count(*) FROM language WHERE coords_source = 'Combined'",
          lambda v: 150 <= v <= 260)
    check("D10 coordinates set without a provenance (expect 0)",
          """SELECT count(*) FROM language
              WHERE latitude IS NOT NULL AND coords_source IS NULL""",
          lambda v: v == 0)
    # atan2 cannot produce an out-of-range angle, so a failure here means the
    # inputs were averaged as degrees rather than in Cartesian space.
    check("D10 derived coordinates out of range (expect 0)",
          """SELECT count(*) FROM language
              WHERE coords_source = 'Combined'
                AND (latitude NOT BETWEEN -90 AND 90
                  OR longitude NOT BETWEEN -180 AND 180)""",
          lambda v: v == 0)
    # A derived position belongs to a node that had none of its own. If this
    # is non-zero the clear is running after the fill, or is unscoped.
    check("D10 derived coordinates on a leaf with no children (expect 0)",
          """SELECT count(*) FROM language l
              WHERE l.coords_source = 'Combined'
                AND NOT EXISTS (SELECT 1 FROM language_source_attribute c
                                 WHERE c.source = 'Combined'
                                   AND c.parent_language_id = l.id)""",
          lambda v: v == 0)

    # ── D11, family modality ───────────────────────────────────────────────
    # 946 declared plus 82 derived. The effective value is what the frontend
    # exposes as lang.modality and is what an API should serve.
    check("D11 effective modality on Combined (measured 1028)",
          """SELECT count(modality) FROM language_source_attribute
              WHERE source = 'Combined'""",
          lambda v: v == 1028)
    check("D11 modalities derived, not declared (measured 82)",
          """SELECT count(*) FROM language_source_attribute a
              JOIN language l ON l.id = a.language_id
             WHERE a.source = 'Combined'
               AND a.modality IS NOT NULL AND l.modality IS NULL""",
          lambda v: v == 82)
    # THE LOADED COLUMN MUST NOT MOVE, and for two reasons rather than one.
    # language.modality holds the 946 values from languages.tsv, and
    # language_modality_discount() reads it when D8 estimates a population from
    # a rough number - so a derived value leaking in here would both destroy
    # loaded data and close a cycle between two derive steps.
    check("D11 declared modality untouched (expect 946)",
          "SELECT count(modality) FROM language",
          lambda v: v == 946)
    check("D11 a declared modality was overwritten (expect 0)",
          """SELECT count(*) FROM language_source_attribute a
              JOIN language l ON l.id = a.language_id
             WHERE a.source = 'Combined' AND l.modality IS NOT NULL
               AND a.modality IS DISTINCT FROM l.modality""",
          lambda v: v == 0)
    # Must stay 0 until D8 fills the other trees AND the maintainers decide
    # what a per-source modality would even mean. Running D11 on Glottolog
    # today divides by populations that do not exist and derives
    # Spoken & Written for every mixed family - a complete, plausible, wrong
    # answer rather than an error.
    check("D11 written to a non-Combined source (expect 0)",
          """SELECT count(modality) FROM language_source_attribute
              WHERE source <> 'Combined'""",
          lambda v: v == 0)
    # THE LEVEL-LOOP TRIPWIRE. ine has no child that DECLARES a modality - iir
    # and gem carry the weight and both are themselves derived - so a single
    # bottom-up pass leaves this NULL and moves 27 other answers without
    # failing any other check here. 1 is MostlySpoken.
    check("D11 ine Indo-European is Mostly Spoken, from two derived children",
          """SELECT modality FROM language_source_attribute
              WHERE source = 'Combined' AND language_id = 'ine'""",
          lambda v: v == 1)
    check("D11 derived answers with no declared-modality child (measured 12)",
          """SELECT count(*) FROM language_source_attribute a
              JOIN language l ON l.id = a.language_id
             WHERE a.source = 'Combined'
               AND a.modality IS NOT NULL AND l.modality IS NULL
               AND NOT EXISTS (
                     SELECT 1 FROM language_source_attribute c
                       JOIN language cl ON cl.id = c.language_id
                      WHERE c.source = 'Combined'
                        AND c.parent_language_id = a.language_id
                        AND cl.modality IS NOT NULL)""",
          lambda v: v == 12)
    # THE RESULT MOST LIKELY TO BE REPORTED AS A BUG, and it is faithful.
    # Australian has 279 children, 5 with a modality, and exactly one of those
    # with a nonzero population: rsm Miriwoong Sign Language, population 3. The
    # average is taken over the children that HAVE a modality, so those 3
    # speakers carry 100% of the weight. 3 is Sign. See FP-019.
    check("D11 aus Australian is Sign, on one 3-speaker sign language",
          """SELECT modality FROM language_source_attribute
              WHERE source = 'Combined' AND language_id = 'aus'""",
          lambda v: v == 3)
    # The frontend divides by zero here: sio's only modality-bearing child has
    # no population, so every term is NaN, NaN fails all five threshold
    # comparisons, and the function returns SpokenAndWritten. Ported as
    # written so the database agrees with the live site. 0 is SpokenAndWritten.
    check("D11 sio Siouan is Spoken & Written, the zero-weight case",
          """SELECT modality FROM language_source_attribute
              WHERE source = 'Combined' AND language_id = 'sio'""",
          lambda v: v == 0)
    # The tightest threshold call in the dataset: tbq scores 0.473, which is
    # 0.027 below the 0.5 boundary that would make it Mostly Spoken. It is the
    # check that would notice the arithmetic drifting.
    check("D11 tbq Tibeto-Burman is Spoken & Written, 0.027 from the boundary",
          """SELECT modality FROM language_source_attribute
              WHERE source = 'Combined' AND language_id = 'tbq'""",
          lambda v: v == 0)
    # The dialect early return skips the languoid AND its whole subtree in the
    # TypeScript; the SQL guard is node-level, which is exact only while no
    # dialect has children. It does not today, under the same ISO-then-
    # Glottolog scope fallback D9 needed. The day this is non-zero, the subtree
    # rule has to be implemented.
    check("D11 dialects with children, which the node-level guard assumes away",
          """SELECT count(*) FROM language_source_attribute p
              LEFT JOIN language_source_attribute pi
                     ON pi.language_id = p.language_id AND pi.source = 'ISO'
              LEFT JOIN language_source_attribute pg
                     ON pg.language_id = p.language_id AND pg.source = 'Glottolog'
             WHERE p.source = 'Combined'
               AND COALESCE(p.scope, pi.scope, pg.scope) = 2
               AND EXISTS (SELECT 1 FROM language_source_attribute c
                            WHERE c.source = 'Combined'
                              AND c.parent_language_id = p.language_id)""",
          lambda v: v == 0)
    # A leaf has no children to average, so a derived value on one means the
    # loop is reading something other than the parent edges.
    check("D11 derived modality on a leaf with no children (expect 0)",
          """SELECT count(*) FROM language_source_attribute a
              JOIN language l ON l.id = a.language_id
             WHERE a.source = 'Combined'
               AND a.modality IS NOT NULL AND l.modality IS NULL
               AND NOT EXISTS (SELECT 1 FROM language_source_attribute c
                                WHERE c.source = 'Combined'
                                  AND c.parent_language_id = a.language_id)""",
          lambda v: v == 0)
    return checks


def _is_empty(conn: psycopg.Connection) -> bool:
    return db.scalar(conn, "SELECT count(*) FROM entity") == 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="etl.run")
    parser.add_argument("--schema", action="store_true",
                        help="apply 001_schema.sql")
    parser.add_argument("--load", action="store_true",
                        help="extract, merge and COPY, then derive")
    parser.add_argument("--indexes", action="store_true",
                        help="apply 002_indexes.sql")
    parser.add_argument("--roles", action="store_true",
                        help="apply 005_roles.sql (API grants) on its own")
    parser.add_argument("--all", action="store_true",
                        help="--schema then --load then --indexes")
    parser.add_argument("--verify", action="store_true",
                        help="golden-value checks only, read-only")
    parser.add_argument("--extract-only", action="store_true",
                        help="parse every source file and report, without a database")
    parser.add_argument(
        "--fresh", action="store_true",
        help="TRUNCATE the ETL-owned tables before loading. DESTRUCTIVE: "
             "deletes every loaded row in this database. Required to re-run "
             "a load into a non-empty database.",
    )
    args = parser.parse_args(argv)

    if args.all:
        args.schema = args.load = args.indexes = True
    if not any((args.schema, args.load, args.indexes, args.roles,
                args.verify, args.extract_only)):
        parser.print_help()
        return 2

    try:
        if args.extract_only:
            return _report_extract(extract())

        cfg = langnav_db()
    except ConfigError as exc:
        print(f"configuration error: {exc}", file=sys.stderr)
        return 2

    print(f"connecting to {cfg.redacted()}")
    with db.connect(cfg) as conn:
        if args.schema:
            print("applying schema/001_schema.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "001_schema.sql")
            print("applying schema/004_alter.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "004_alter.sql")
            print("applying schema/003_derive.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "003_derive.sql")
            print("applying schema/005_roles.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "005_roles.sql")
            print("applying schema/006_rls.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "006_rls.sql")
            conn.commit()
            counts = db.object_counts(conn)
            print(f"  created {counts}")

        exit_code = 0
        if args.load:
            exit_code = _do_load(conn, args.fresh)
            # Bail out rather than printing a wall of passing verification
            # checks under a "refusing to load" message, which reads as success.
            if exit_code == REFUSED:
                return exit_code

        if args.indexes:
            print("applying schema/002_indexes.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "002_indexes.sql")
            conn.commit()
            print(f"  objects now {db.object_counts(conn)}")

        # Standalone, like --indexes, and for the same reason: it is re-runnable
        # against a populated database. Without it the only ways to re-grant
        # after the roles are created would be --schema or --load --fresh, both
        # of which destroy data to apply a SELECT grant.
        if args.roles and not (args.schema or args.load):
            print("applying schema/005_roles.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "005_roles.sql")
            print("applying schema/006_rls.sql")
            db.run_sql_file(conn, SCHEMA_DIR / "006_rls.sql")
            conn.commit()

        if args.verify or args.load:
            print("\nverification")
            failed = 0
            for label, value, passed in verify(conn):
                mark = "PASS" if passed else "FAIL"
                if not passed:
                    failed += 1
                print(f"  [{mark}] {label}: {value}")
            if failed:
                print(f"\n{failed} verification check(s) failed")
                exit_code = exit_code or 1

    return exit_code


def _do_load(conn: psycopg.Connection, fresh: bool) -> int:
    # Schema files first, in their own committed transaction, BEFORE any COPY.
    #
    # Both are idempotent (ADD COLUMN IF NOT EXISTS, CREATE OR REPLACE) and are
    # re-applied on every load, not just on --schema, so that a long-lived
    # database cannot drift away from the files in the repo.
    #
    # The ordering is not cosmetic. The load phase issues SET CONSTRAINTS ALL
    # DEFERRED, and Postgres refuses "ALTER TABLE ... because it has pending
    # trigger events" for any table the transaction has already touched. Running
    # this after the COPY aborts the load, and since --fresh has already
    # committed its TRUNCATE by then, the rollback leaves an EMPTY database.
    print("applying schema/004_alter.sql")
    db.run_sql_file(conn, SCHEMA_DIR / "004_alter.sql")
    print("applying schema/003_derive.sql")
    db.run_sql_file(conn, SCHEMA_DIR / "003_derive.sql")
    # 005 last: it grants on whatever 001, 003 and 004 have created by now.
    # Re-applied on every load because table grants die with the tables when
    # 001_schema.sql is re-applied, while the roles themselves survive. Skips
    # itself with a NOTICE on an installation that has no API roles.
    print("applying schema/005_roles.sql")
    db.run_sql_file(conn, SCHEMA_DIR / "005_roles.sql")
    # 006 after 005: it refuses to enable RLS unless the role exists, because
    # enabling it without a policy denies every read.
    print("applying schema/006_rls.sql")
    db.run_sql_file(conn, SCHEMA_DIR / "006_rls.sql")
    conn.commit()

    if not _is_empty(conn):
        if not fresh:
            print(
                "\nrefusing to load: this database already contains data.\n"
                "Re-run with --fresh to TRUNCATE the ETL-owned tables first.\n"
                "That deletes every loaded row in this database.",
                file=sys.stderr,
            )
            return REFUSED
        print("--fresh: truncating ETL-owned tables")
        with conn.cursor() as cur:
            cur.execute(
                "TRUNCATE TABLE "
                + ", ".join(OWNED_TABLES)
                + " RESTART IDENTITY CASCADE"
            )
        conn.commit()

    run_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute("INSERT INTO ingest_run (run_id) VALUES (%s)", (run_id,))

    print("extracting")
    started = time.perf_counter()
    ds = extract()

    print("loading")
    written = load(conn, ds, run_id)
    for name, count in written.items():
        print(f"  copied {name:32s} {count:8d}")

    print("deriving")
    ancestry = derive.rebuild_ancestry(conn)
    print(f"  language_ancestry  {ancestry['language_ancestry']:8d}")
    print(f"  territory_ancestry {ancestry['territory_ancestry']:8d}")
    updated = derive.update_census_language_counts(conn)
    print(f"  census.language_count updated for {updated} censuses")
    # D3 after D2 (it walks the closure table) and before D13 (territory_stats
    # aggregates the columns it writes).
    rollup = derive.rebuild_territory_rollup(conn, run_id)
    print("  territory roll-up filled: " + ", ".join(
        f"{name} {count}" for name, count in rollup.items()
    ))
    # D4 after D3: it multiplies percentages back out by territory.population
    # and discounts writing by territory.literacy_percent.
    locale_pop = derive.rebuild_locale_population_from_censuses(conn, run_id)
    print("  locale populations: " + ", ".join(
        f"{name} {count}" for name, count in locale_pop.items()
    ))
    # D6 between D4 and D5, which is the frontend's order rather than the
    # numbering's: connectObjects.ts:41 creates family locale rows before
    # regional ones, and updatePopulations.ts:24 sums the family populations
    # before the regional ones, so that D5 rolls up finished family locales.
    #
    # Once per classification source, ISO FIRST. Part B updates curated locales,
    # which belong to no source and are shared by every pass, and it does that on
    # the ISO pass only - so running ISO first means the later passes read rows
    # that have already settled and the result does not depend on their order.
    for source in derive.FAMILY_LOCALE_SOURCES:
        family = derive.rebuild_family_locales(conn, run_id, source)
        print(f"  family locales {source:10s} " + ", ".join(
            f"{name} {count}" for name, count in family.items()
        ))
    totals = derive.family_locale_totals(conn)
    print("  family locales TOTAL      " + ", ".join(
        f"{name} {count}" for name, count in totals.items()
    ))
    # D5 after D4: it sums pop_speaking_unadjusted_derived, which D4 writes.
    # After D6, whose rows it picks up through the leaf branch it already had.
    # Before D13, because territory_stats reads the locales of a territory and
    # a group has none until this runs.
    regional = derive.rebuild_regional_locales(conn, run_id)
    print("  regional locales: " + ", ".join(
        f"{name} {count}" for name, count in regional.items()
    ))
    # D7. Both halves are independent of D3 through D6 - the writing-system
    # figures come from loaded columns and the counts from the D1 closure - so
    # this is placed where the documented chain puts D7 rather than because
    # anything above it is required. Before D8, which will need the counts.
    ws_pop = derive.rebuild_writing_system_populations(conn, run_id)
    print("  writing system populations: " + ", ".join(
        f"{name} {count}" for name, count in ws_pop.items()
    ))
    counted = derive.rebuild_descendant_counts(conn, run_id)
    print("  descendant counts: " + ", ".join(
        f"{name} {count}" for name, count in counted.items()
    ))
    # D8, and it must come after D5: a language's estimate is usually its World
    # locale, and those rows do not exist until the regional roll-up has run.
    # Running it earlier leaves most languoids on the rough languages.tsv figure
    # instead, which is a plausible number and a wrong one.
    lang_pop = derive.rebuild_language_populations(conn, run_id)
    print("  language populations: " + ", ".join(
        f"{name} {count}" for name, count in lang_pop.items()
    ))
    # D9, and it must come after D8: it ranks descendants by the estimates D8
    # writes, so running it earlier gives every ancestor a NULL answer - which
    # is indistinguishable from the step never having run.
    largest = derive.rebuild_largest_descendants(conn, run_id)
    print("  largest descendants: " + ", ".join(
        f"{name} {count}" for name, count in largest.items()
    ))
    # D10, first half. Only D1 is required, so this could sit much earlier; it
    # is here to keep the two halves of one step together in the output.
    depths = derive.rebuild_language_depth(conn, run_id)
    print("  language depth: " + ", ".join(
        f"{name} {count}" for name, count in depths.items()
    ))
    # D10, second half, and it must come after D8: the coordinate average
    # weights each child by the fourth root of its population, so running it
    # earlier drops every child from its own parent's average and leaves the
    # grouping nodes where Glottolog put them - fewer positions, no error.
    # Placed after D9 to match the documented chain; neither reads the other.
    recursive = derive.rebuild_recursive_language_data(conn, run_id)
    print("  recursive language data: " + ", ".join(
        f"{name} {count}" for name, count in recursive.items()
    ))
    # D11, the last step in the chain. After D8, whose population estimates are
    # the weights the average uses; running it earlier would leave every mixed
    # family with a zero denominator and derive Spoken & Written for all of
    # them, which is a plausible answer and a wrong one. Nothing reads what it
    # writes, so its position relative to D9 and D10 is documentation rather
    # than a constraint.
    modality = derive.rebuild_language_modality(conn, run_id)
    print("  language modality: " + ", ".join(
        f"{name} {count}" for name, count in modality.items()
    ))
    stats = derive.refresh_materialized_views(conn)
    print(f"  territory_stats    {stats:8d}")
    derive.analyze(conn)

    with conn.cursor() as cur:
        cur.execute(
            "UPDATE ingest_run SET finished_at = now(), status = 'succeeded' "
            "WHERE run_id = %s",
            (run_id,),
        )
    conn.commit()

    elapsed = time.perf_counter() - started
    errors = _summarise_findings(ds)
    print(f"\nload finished in {elapsed:.1f}s, run_id {run_id}")
    return 1 if errors else 0


def _summarise_findings(ds: Dataset) -> int:
    warnings = [f for f in ds.findings if f.severity == "warning"]
    errors = [f for f in ds.findings if f.severity == "error"]

    if ds.unmapped_files:
        print("\nsource files with no target table in this schema:")
        for path, reason in ds.unmapped_files:
            print(f"  {path}\n      {reason}")

    print(f"\nfindings: {len(errors)} error(s), {len(warnings)} warning(s)")
    for finding in errors[:20]:
        print(f"  ERROR   {finding.field}: {finding.message}")
    for finding in warnings[:20]:
        print(f"  warning {finding.field}: {finding.message}")
    if len(warnings) > 20:
        print(f"  ... and {len(warnings) - 20} more warnings "
              f"(all are in data_quality_finding)")
    return len(errors)


def _report_extract(ds: Dataset) -> int:
    print("\nrow counts by table:")
    for name, count in ds.counts().items():
        print(f"  {name:36s} {count:8d}")
    errors = _summarise_findings(ds)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())

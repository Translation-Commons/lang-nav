"""Derived structures.

This pass implements twelve of the thirteen numbered derive steps. D12 is not
among them because it is not a real step; see the NOT_IMPLEMENTED block below.

    D1   rebuild_language_ancestry   (plus the cycle assertion)
    D2   rebuild_territory_ancestry  (both hierarchies)
    D3   rebuild_territory_rollup    (population, area, gdp, literacy, coords)
    D4   rebuild_locale_population_from_censuses
    D6   rebuild_family_locales      (CREATES ROWS; once per classification
                                      source; runs between D4 and D5)
    D5   rebuild_regional_locales    (CREATES ROWS, does not just fill columns)
    D7   rebuild_writing_system_populations + rebuild_descendant_counts
    D8   rebuild_language_population_from_locales
         + rebuild_language_populations   (Combined tree only)
    D9   rebuild_largest_descendants      (Combined tree only)
    D10  rebuild_language_depth           (ALL sources)
         + rebuild_recursive_language_data (Combined tree only)
    D11  rebuild_language_modality        (Combined tree only)
    D13  REFRESH MATERIALIZED VIEW territory_stats

plus census.language_count, which is a plain aggregate rather than a recursive
computation.

D6 is listed above D5 because that is the order it runs in, which is not the
order the steps are numbered in. The frontend creates family locale rows first
(connectObjects.ts:41, "create them before regional locales") and sums the
family populations first (updatePopulations.ts:24), so that the regional
roll-up aggregates finished family locales.

D7 IS NARROWER THAN THE ORIGINAL PLAN, deliberately. It was scoped as "the
descendant populations" for writing systems AND languages, plus descendant_count.
The writing-system half and the counts are genuinely independent and are done
here. The LANGUAGE descendant populations are not separable from D8 and have
moved into it: getLanguagePopulationFollowingDescendants returns the child's
ESTIMATE, so a parent's descendant sum is built from its children's D8 output
and the two are one bottom-up pass. See the D8 entry below.

D8 AND D9 ARE COMBINED-TREE ONLY, and that is a sequencing decision rather than
a shortcut: both SQL functions already take a source parameter, so widening
either is a call-site change. D9 is additionally BLOCKED on D8 rather than
merely deferred, because it ranks descendants by the estimates D8 writes.

D10 IS SPLIT IN TWO, along the line where the dependencies actually fall rather
than at the boundary the frontend function has. Depth needs D1 and nothing
else, so it is filled for all six populated sources. The vitality rollup and
the coordinate fill write columns that live on `language`, which mirrors
Combined, and the coordinate weights come from D8 - so that half is Combined
only. Its third output, the digital support score, is not implemented at all
and is declared below: three of its five inputs have no destination table.

D11 IS COMBINED-TREE ONLY, for a reason none of the earlier steps had. It is
neither blocked nor deferred: there is no per-source semantics to port.
computeLanguageFamiliesModality traverses the Combined child lists whatever
source is selected, so the Combined answer is the only one the live site has
ever produced, and inventing a Glottolog one needs a maintainer decision before
it needs code.

What is NOT implemented is D11 for the six non-Combined trees, D10's per-source
half, and a regional roll-up per classification source: D6 generates family
locales for every source, but D5 aggregates the ISO ones only. They are
declared below so that calling one raises instead of silently leaving a column
NULL and letting a caller believe the number is real.

The heavy steps run inside Postgres rather than in Python on purpose. The
language graph is a DAG, not a tree: the same languoid can be reachable by more
than one route, which is why the closure table takes MIN(depth) and why ltree
was rejected. A recursive CTE expresses that directly; the Python equivalent
would need its own cycle detection and would pull roughly 300,000 rows across
the wire to send them straight back.

Their bodies live in schema/003_derive.sql rather than in 001_schema.sql, which
holds structure only. See the header of that file for why.
"""

from __future__ import annotations

import psycopg

from . import db

# Derive steps that exist in the pipeline design but are not implemented here.
# Ordered as the dependency chain requires, because getting the order wrong
# produces silently wrong numbers rather than an error.
NOT_IMPLEMENTED = {
    "regional_locales_per_source": (
        "A regional roll-up per classification source. D6 now generates family "
        "locales for every source, but D5 aggregates the ISO ones ONLY, because "
        "it groups leaf locales by (language, script, variant) with no source "
        "dimension - five copies of one family locale would be summed into one "
        "bucket. The consequence is that a non-ISO family locale exists at "
        "country level and has no worldwide roll-up. Widening it is not just a "
        "grouping change: 146 of the 254 ISO family languoids ALSO carry "
        "curated locales, which have no source, so they would split from the "
        "generated ones into two regional rows where the frontend produces one. "
        "Decided and deferred 2026-08-05; see FP-013 step 4"
    ),
    "language_population_precedence_per_source": (
        "D8 for the six NON-Combined trees. The Combined tree is implemented - "
        "see rebuild_language_populations - and the SQL function already takes "
        "a source parameter, so this is a call-site change rather than a "
        "rewrite. Deferred because nothing consumes a per-source language "
        "estimate until the API exists, and because FP-014 bites harder here: "
        "D5 rolls up ISO family locales only, so a non-ISO family has no World "
        "locale and would fall through to the descendants branch, giving a "
        "systematically lower number than the same languoid under ISO"
    ),
    "parent_child_population_contradictions": (
        "The data_quality_finding half of D8. The frontend's "
        "discountPopulationEstimatesIfSimilarToParent rewrites any child "
        "estimate >= its parent down to parent - 0.01 and restamps the source "
        "as Algorithmic. Q1 says do NOT port that, so our numbers legitimately "
        "differ from the live site wherever it fires. What is still owed is the "
        "other half of that decision: detecting those languoids and recording "
        "them as findings instead of silently leaving the contradiction"
    ),
    "largest_descendant_per_source": (
        "D9 for the six NON-Combined trees. The Combined tree is implemented - "
        "see rebuild_largest_descendants - and the SQL function already takes a "
        "source parameter, so this is a call-site change rather than a rewrite. "
        "It is BLOCKED, not merely deferred: D9 ranks descendants by "
        "language_source_attribute.population_estimate, which D8 has only "
        "filled for Combined, so running it on any other source today would "
        "write NULL to every row and look exactly like a step that had never "
        "run. Widen D8 first"
    ),
    "recursive_language_data_per_source": (
        "D10's vitality rollup and coordinate fill for the six NON-Combined "
        "trees. Depth is already done for every source - it depends on D1 "
        "alone - and the Combined tree is implemented; see "
        "rebuild_recursive_language_data. This one is DEFERRED rather than "
        "blocked, and it needs more than a call-site change: the vitality "
        "columns live on `language`, which mirrors Combined by design, so "
        "language_source_attribute would need its own vitality_iso, "
        "vitality_eth_fine, vitality_eth_coarse and vitality_meta first. "
        "Coordinates additionally weight children by the estimates D8 has "
        "walked for Combined alone"
    ),
    "language_digital_support_scores": (
        "computeDigitalSupportScores, the third output of "
        "computeRecursiveLanguageData. Carved out of D10 because it is a LOAD "
        "gap rather than a derive one: three of the five dimensions read files "
        "with no destination table - google/gtranslate.tsv, "
        "other_sources/ios.tsv and other_sources/win11_language_packs.tsv, all "
        "three recorded in note_unmapped - and there is no column for the "
        "score or any of its five constituents. The two dimensions that COULD "
        "be computed today, documentation and i18n frameworks, are averaged "
        "against three permanent zeroes, so a partial implementation would "
        "publish a score that is wrong by construction for every language"
    ),
    "family_modality_per_source": (
        "D11 for the six NON-Combined trees. The Combined tree is implemented; "
        "see rebuild_language_modality, whose SQL function already takes a "
        "source parameter. This one is neither blocked nor merely deferred: "
        "THERE IS NO FRONTEND SEMANTICS TO PORT. "
        "computeLanguageFamiliesModality traverses lang.Combined.childLanguages "
        "unconditionally (computeLanguageFamiliesModality.ts:29) even though it "
        "is handed languagesInSelectedSource and filters roots by the selected "
        "source's parent, so the only answer the live site ever produces is the "
        "Combined one. A Glottolog modality would be an invention, and it would "
        "need a decision from the maintainers before it needed code. D8's "
        "unfilled per-source populations would block the weights anyway"
    ),
    # D12 is deliberately absent. It was listed as computeLocalesWritingPopulation,
    # but that function no longer exists in the frontend: writing population is
    # computed alongside speaking inside computeLocalesPopulationFromCensuses,
    # and D4 fills locale.pop_writing_percent and pop_writing_adjusted with it.
    # Leaving a D12 entry here would send someone looking for finished work.
}


class DeriveStepNotImplemented(NotImplementedError):
    """Raised when a caller asks for a derive step this pass does not do."""


def run_step(name: str) -> None:
    if name in NOT_IMPLEMENTED:
        raise DeriveStepNotImplemented(
            f"{name} is not implemented: {NOT_IMPLEMENTED[name]}. "
            f"The columns it would populate are still NULL."
        )
    raise KeyError(f"unknown derive step {name!r}")


def rebuild_ancestry(conn: psycopg.Connection) -> dict[str, int]:
    """D1 and D2. Returns the resulting row counts."""
    with conn.cursor() as cur:
        # Includes assert_no_language_cycles(), which raises if any node is
        # its own ancestor at depth > 0.
        cur.execute("SELECT rebuild_language_ancestry()")
        cur.execute("SELECT rebuild_territory_ancestry()")
    return {
        "language_ancestry": int(db.scalar(conn, "SELECT count(*) FROM language_ancestry")),
        "territory_ancestry": int(db.scalar(conn, "SELECT count(*) FROM territory_ancestry")),
    }


def rebuild_territory_rollup(conn: psycopg.Connection, run_id: str) -> dict[str, int]:
    """D3. Aggregate the geographic hierarchy upward. Returns filled counts.

    Depends on D2: the function walks levels using territory_ancestry. Must run
    before D13, because territory_stats aggregates the columns it writes.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_territory_rollup(%s)", (run_id,))
    return {
        "population": int(db.scalar(conn, "SELECT count(population) FROM territory")),
        "land_area_km2": int(
            db.scalar(conn, "SELECT count(land_area_km2) FROM territory")
        ),
        "gdp": int(db.scalar(conn, "SELECT count(gdp) FROM territory")),
        "literacy_percent": int(
            db.scalar(conn, "SELECT count(literacy_percent) FROM territory")
        ),
        "coordinates": int(db.scalar(conn, "SELECT count(latitude) FROM territory")),
        "population_writing": int(
            db.scalar(conn, "SELECT count(population_writing) FROM territory")
        ),
    }


def rebuild_locale_population_from_censuses(
    conn: psycopg.Connection, run_id: str
) -> dict[str, int]:
    """D4. Pick a winning census per locale and derive its populations.

    Depends on D3: territory.population is the multiplier that turns a
    percentage back into a headcount, and territory.literacy_percent is the
    writing discount. Running this before D3 yields quiet zeroes.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_locale_population_from_censuses(%s)", (run_id,))
    counts = {
        "speaking_adjusted": "SELECT count(pop_speaking_adjusted) FROM locale",
        "speaking_from_census": "SELECT count(pop_speaking_census_id) FROM locale",
        "writing_adjusted": "SELECT count(pop_writing_adjusted) FROM locale",
        "writing_from_census": "SELECT count(pop_writing_census_id) FROM locale",
        # Scoped, because D5's generated rows carry these columns too and an
        # unscoped count would silently stop describing D4.
        "literacy_percent": """
            SELECT count(literacy_percent) FROM locale
             WHERE locale_source = 'StableDatabase'
        """,
        "source_derived": """
            SELECT count(pop_speaking_source_derived) FROM locale
             WHERE locale_source = 'StableDatabase'
        """,
        # The two rankings disagreeing is the point of scoring twice. If this is
        # ever 0, the writing weights have stopped doing anything.
        "different_census_per_use": """
            SELECT count(*) FROM locale
             WHERE pop_speaking_census_id IS NOT NULL
               AND pop_writing_census_id  IS NOT NULL
               AND pop_speaking_census_id <> pop_writing_census_id
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_regional_locales(conn: psycopg.Connection, run_id: str) -> dict[str, int]:
    """D5. Synthesise the locale rows for territory GROUPS. Returns counts.

    This step CREATES ROWS rather than filling columns, which is easy to miss
    when auditing: `locale` looks populated because the 10,978 curated rows are
    already there.

    Depends on D3 for territory.population, which is the percentage's
    denominator, and on D4 for pop_speaking_unadjusted_derived, which is the
    head-count it actually sums. Running it before D4 yields a table full of
    NULL populations rather than an error.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_regional_locales(%s)", (run_id,))
    counts = {
        "rows": "SELECT count(*) FROM locale WHERE locale_source = 'createRegionalLocales'",
        "groups": """
            SELECT count(DISTINCT territory_id) FROM locale
             WHERE locale_source = 'createRegionalLocales'
        """,
        "with_speakers": """
            SELECT count(pop_speaking_adjusted) FROM locale
             WHERE locale_source = 'createRegionalLocales'
        """,
        # Regional locales exist so that a territory group can be sorted and
        # reported on. If this is 0, nothing downstream of D5 can work.
        "at_world": """
            SELECT count(*) FROM locale
             WHERE locale_source = 'createRegionalLocales' AND territory_id = '001'
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


# The classification sources D6 generates family locales for, IN CALL ORDER.
#
# ISO IS FIRST AND THAT IS NOT COSMETIC. Part B updates curated locales, which
# belong to no source and are shared by every pass, and it does so on the ISO
# pass only - ISO being the tree searchLocalesForMissingLinks.ts:34 hardcodes
# and therefore the one pass that reproduces the frontend. Running it first
# means the four later passes read curated rows that have already settled, so
# the result does not depend on the order of those four.
#
# All seven are listed rather than the five that have parent edges today. CLDR
# has 0 parent edges of 153 attributes and Ethnologue has no attribute rows at
# all, so both produce nothing - but they produce nothing by measurement rather
# than by omission, and the day either gains a tree it is picked up rather than
# silently skipped.
FAMILY_LOCALE_SOURCES = (
    "ISO",
    "Combined",
    "BCP",
    "UNESCO",
    "Glottolog",
    "CLDR",
    "Ethnologue",
)


def rebuild_family_locales(
    conn: psycopg.Connection, run_id: str, source: str
) -> dict[str, int]:
    """D6, for ONE classification source. Returns counts for that source.

    Like D5 this CREATES ROWS, and like D5 it ports two frontend functions that
    sum different inputs: createFamilyLocales.ts decides which rows exist from
    the curated populations, computeLanguageFamilyLocalePopulations decides what
    they say from the census-corrected ones.

    Must run AFTER D4, whose census figures part B sums, and BEFORE D5, which
    rolls the ISO rows up into the regional ones - the frontend order, from
    updatePopulations.ts:21-29 and connectObjects.ts:41.

    Call once per source, in FAMILY_LOCALE_SOURCES order. Generated rows carry
    language_source and a `fam.<SOURCE>.` id prefix, because 80 languoids have a
    different child set in different sources and both answers are correct.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_family_locales(%s, %s)", (run_id, source))
    counts = {
        "rows": """
            SELECT count(*) FROM locale
             WHERE locale_source = 'createFamilyLocales' AND language_source = %s
        """,
        "families": """
            SELECT count(DISTINCT language_id) FROM locale
             WHERE locale_source = 'createFamilyLocales' AND language_source = %s
        """,
        "with_speakers": """
            SELECT count(pop_speaking_adjusted) FROM locale
             WHERE locale_source = 'createFamilyLocales' AND language_source = %s
        """,
        # Part A stores the pre-census sum and part B the post-census one, in
        # separate columns, exactly as they are for a curated locale. If these
        # never disagree then part B is not running and half the step is dead -
        # the same class of check as D4's "different census per use".
        "moved_by_part_b": """
            SELECT count(*) FROM locale
             WHERE locale_source = 'createFamilyLocales' AND language_source = %s
               AND pop_speaking_unadjusted_derived IS DISTINCT FROM
                   pop_speaking_unadjusted
        """,
    }
    return {
        name: int(db.scalar(conn, sql, (source,)))
        for name, sql in counts.items()
    }


def family_locale_totals(conn: psycopg.Connection) -> dict[str, int]:
    """Totals across every D6 source, for reporting after the last pass."""
    counts = {
        "rows": """
            SELECT count(*) FROM locale WHERE locale_source = 'createFamilyLocales'
        """,
        "sources_with_rows": """
            SELECT count(DISTINCT language_source) FROM locale
             WHERE locale_source = 'createFamilyLocales'
        """,
        # Part B reaches curated locales too, and raising a macrolanguage to
        # the sum of its children is the whole point of it. This is a total
        # rather than a per-source count because curated rows belong to no
        # source: only the ISO pass writes them, deliberately.
        "curated_raised": """
            SELECT count(*) FROM locale
             WHERE locale_source = 'StableDatabase'
               AND pop_speaking_source_derived = 'Aggregated from Languages'
        """,
        # The reason locale.language_source exists. If this is 0, every
        # source agreed about every family and the column bought nothing -
        # which would mean the tree scoping has stopped working.
        "same_family_differing_by_source": """
            SELECT count(*) FROM (
                  SELECT language_id, territory_id
                    FROM locale
                   WHERE locale_source = 'createFamilyLocales'
                   GROUP BY 1, 2
                  HAVING count(DISTINCT COALESCE(pop_speaking_unadjusted, -1)) > 1
                 ) x
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_writing_system_populations(
    conn: psycopg.Connection, run_id: str
) -> dict[str, int]:
    """D7, first half. Writing system upper bounds and descendant populations.

    Depends on no other derive step. Both inputs are loaded columns, so this
    could run immediately after the COPY; it sits after D5 only because that is
    where the documented chain puts D7 and it leaves room for D8.

    It does see CURATED locales only, which is not an optimisation:
    connectLocales runs at connectObjects.ts:36, before createFamilyLocales and
    createRegionalLocales on lines 41-42, so the generated rows do not exist
    when the frontend accumulates these figures.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_writing_system_populations(%s)", (run_id,))
    counts = {
        "upper_bound": "SELECT count(population_upper_bound) FROM writing_system",
        # The frontend initialises the field to 0 for any script that is some
        # language's primary one, so "set" and "non-zero" are different
        # statements and both are worth reporting.
        "upper_bound_positive": """
            SELECT count(*) FROM writing_system WHERE population_upper_bound > 0
        """,
        "descendants": """
            SELECT count(population_of_descendants) FROM writing_system
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_descendant_counts(conn: psycopg.Connection, run_id: str) -> dict[str, int]:
    """D7, second half. The Q1(a) replacement for the +0.01-per-node tiebreaker.

    Depends on D1 only: language_ancestry is the closure it counts. Note that
    the trick this column replaces is already dead in the frontend - the
    `|| [0.01, 0.01]` fallback at updatePopulations.ts:55 can never fire,
    because its left operand is an array on every path. So this restores an
    ordering the site has already lost rather than merely making it explicit.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_descendant_counts(%s)", (run_id,))
    counts = {
        # count(), not count(*) FILTER (WHERE > 0). The column was NOT NULL
        # DEFAULT 0 until 2026-08-06, when a plain count() reported it as fully
        # populated with D7 never having run. Now that it is nullable, a plain
        # count() is the honest audit again.
        "lsa_counted": """
            SELECT count(descendant_count) FROM language_source_attribute
        """,
        "lsa_with_descendants": """
            SELECT count(*) FROM language_source_attribute WHERE descendant_count > 0
        """,
        # NULL here means the languoid has no Combined row, so it is not in that
        # tree at all. 8,342 of 27,299 measured 2026-08-15, against 18,957 on
        # 2026-08-06. The drop has not been traced to a specific change; treat
        # the older figure as unreliable rather than as evidence of a loss.
        "language_mirrored": "SELECT count(descendant_count) FROM language",
        "language_with_descendants": """
            SELECT count(*) FROM language WHERE descendant_count > 0
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_language_populations(conn: psycopg.Connection, run_id: str) -> dict[str, int]:
    """D8. The language population precedence chain, per use.

    Runs in two parts, and the order between them is not optional. The World
    locale figures are written first and are source-independent; the tree walk
    then reads them as the highest-precedence branch on every source.

    Depends on D1 for the tree, and on D4 and D5 for the locale figures - a
    language's estimate is usually its World locale, so running this before D5
    would leave most languoids on the rough languages.tsv number instead.

    Only the Combined tree is walked today. The function takes a source so that
    widening it is a call-site change rather than a rewrite, exactly as D6 was
    sequenced, but the per-source estimates are not needed until something
    consumes them.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_language_population_from_locales(%s)", (run_id,))
        cur.execute("SELECT rebuild_language_populations(%s, 'Combined')", (run_id,))
    counts = {
        "from_locales": "SELECT count(pop_speaking_from_locales) FROM language",
        "speaking_estimate": "SELECT count(pop_speaking_estimate) FROM language",
        "writing_estimate": "SELECT count(pop_writing_estimate) FROM language",
        # Far smaller than the number of languoids WITH children, and that is
        # correct: the descendants branch is the last resort, so a family that
        # D5 gave a World row takes the territories branch instead. What is
        # left is the FP-014 gap.
        "speaking_descendants": """
            SELECT count(pop_speaking_of_descendants) FROM language
        """,
        "overall": "SELECT count(population_estimate) FROM language",
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_largest_descendants(conn: psycopg.Connection, run_id: str) -> dict[str, int]:
    """D9. The biggest languoid strictly beneath each node, per source.

    Depends on D1 for the closure and on D8 for the estimates it ranks by, so
    it can only answer for a source D8 has walked - Combined today. Runs after
    D8 and before D13 for that reason, not because the matview reads it.

    No tree walk. The frontend recursion telescopes into a plain max over the
    strict descendants, so one grouped scan of language_ancestry answers it;
    see the comment above the SQL function for why that is safe here and is
    NOT safe for D6 or D8.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_largest_descendants(%s, 'Combined')", (run_id,))
    counts = {
        # 232 of the 260 Combined languoids that have descendants. The gap is
        # ancestors whose whole subtree is families or has no population.
        "lsa_answered": """
            SELECT count(largest_descendant_id) FROM language_source_attribute
             WHERE source = 'Combined'
        """,
        "language_mirrored": "SELECT count(largest_descendant_id) FROM language",
        # The un-ported Q1 discount, made visible rather than left to be
        # rediscovered: a largest descendant bigger than the ancestor itself is
        # a source-data contradiction, and ReportLanguageDescendants renders it
        # as a percentage above 100. Reported, not raised.
        "exceeding_their_ancestor": """
            SELECT count(*) FROM language p
              JOIN language d ON d.id = p.largest_descendant_id
             WHERE d.population_estimate > COALESCE(p.population_estimate, 0)
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_language_depth(conn: psycopg.Connection, run_id: str) -> dict[str, int]:
    """D10, first half. Distance from the root, in every source's tree.

    Depends on D1 only, which is why this covers all six populated sources
    while the vitality and coordinate half covers Combined alone. One grouped
    scan of the closure: each source's parent graph is a tree, so a node's
    deepest closure entry is its root distance.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_language_depth(%s)", (run_id,))
    counts = {
        "filled": "SELECT count(depth) FROM language_source_attribute",
        # Roots and leaves both matter. If every row is 0 the closure has lost
        # its parent edges, and a table of zeroes is not an error anywhere.
        "roots": "SELECT count(*) FROM language_source_attribute WHERE depth = 0",
        "below_a_root": """
            SELECT count(*) FROM language_source_attribute WHERE depth > 0
        """,
        "deepest": """
            SELECT COALESCE(max(depth), 0) FROM language_source_attribute
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_recursive_language_data(
    conn: psycopg.Connection, run_id: str
) -> dict[str, int]:
    """D10, second half. The vitality rollup and the coordinate gap fill.

    Depends on D1 for the tree and on D8 for the population weights the
    coordinate average uses, so it runs after both. It does NOT depend on D9
    and D9 does not depend on it - the frontend happens to run this one first
    (updateObjectsBasedOnDataParams.ts:40-41), but D10 writes vitality, depth
    and coordinates while D9 reads none of them.

    Combined only, and the level loop is load-bearing: unlike D9's recursion
    this one does not telescope, because a languoid that declares its own
    vitality blocks the values beneath it from rising past it.
    """
    with conn.cursor() as cur:
        cur.execute(
            "SELECT rebuild_recursive_language_data(%s, 'Combined')", (run_id,)
        )
    counts = {
        "vitality_iso": "SELECT count(vitality_iso) FROM language",
        # The whole point of the tree walk. Everything else this function
        # writes on the ISO axis is a copy of a declared value, so if this is
        # 0 the loop has stopped rolling anything up and nothing else says so.
        "vitality_iso_inherited": """
            SELECT count(*) FROM language
             WHERE vitality_iso IS NOT NULL AND iso_status IS NULL
        """,
        # Expected 0 while sil/ethnologue2012.tsv and sil/ethnologue2025.tsv
        # are header-only. Counted anyway: the day they gain rows this is the
        # number that shows it, and a column nobody counts is a column nobody
        # notices staying empty.
        "vitality_eth_fine": "SELECT count(vitality_eth_fine) FROM language",
        "vitality_eth_coarse": "SELECT count(vitality_eth_coarse) FROM language",
        "vitality_meta": "SELECT count(vitality_meta) FROM language",
        # Split by provenance, because the failure that matters here is the
        # loaded figure going DOWN. An unscoped clear deletes 8,907 Glottolog
        # positions and a single total would hide it behind the derived gain.
        "coords_loaded": """
            SELECT count(*) FROM language WHERE coords_source = 'Glottolog'
        """,
        "coords_derived": """
            SELECT count(*) FROM language WHERE coords_source = 'Combined'
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def rebuild_language_modality(conn: psycopg.Connection, run_id: str) -> dict[str, int]:
    """D11, the last step in the derive chain.

    Gives a grouping node the modality its children imply, where it declares
    none of its own. Depends on D1 for the tree and on D8 for the weights, so
    it runs after both and before D13.

    Combined only, and for a reason none of the earlier steps had: the frontend
    function traverses the Combined child lists whatever source is selected, so
    there is no per-source answer to port. See the NOT_IMPLEMENTED entry.

    The level loop is load-bearing. 28 of the 82 derived answers read a child
    whose own modality was derived, and 12 have no declared-modality child at
    all, so a single bottom-up pass loses those 12 and moves 16 more.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT rebuild_language_modality(%s, 'Combined')", (run_id,))
    counts = {
        # The effective value: declared where languages.tsv gives one, derived
        # where it does not. 946 + 82.
        "effective": """
            SELECT count(modality) FROM language_source_attribute
             WHERE source = 'Combined'
        """,
        # The whole point of the step. Everything else this function writes is
        # a copy of a declared value, so if this is 0 the rollup has stopped
        # rolling anything up and no other count says so.
        "derived": """
            SELECT count(*) FROM language_source_attribute a
              JOIN language l ON l.id = a.language_id
             WHERE a.source = 'Combined'
               AND a.modality IS NOT NULL AND l.modality IS NULL
        """,
        # The loaded column, counted after the run rather than before. D11 must
        # not write here at all: language_modality_discount() reads it, and 946
        # values arrived from languages.tsv. A number other than 946 means the
        # derived value has leaked into the declared one.
        "declared_untouched": "SELECT count(modality) FROM language",
        # Must stay 0. Writing another source would not fail anything - it
        # would divide by populations D8 has never filled and derive
        # Spoken & Written for every mixed family in the tree.
        "written_to_other_sources": """
            SELECT count(modality) FROM language_source_attribute
             WHERE source <> 'Combined'
        """,
    }
    return {name: int(db.scalar(conn, sql)) for name, sql in counts.items()}


def update_census_language_counts(conn: psycopg.Connection) -> int:
    """Set census.language_count from what actually loaded.

    One UPDATE driven by a single grouped scan, rather than a statement per
    census. Computed after the load rather than during it so the count
    reflects the rows that survived foreign-key resolution.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE census c
               SET language_count = COALESCE(e.n, 0)
              FROM (
                    SELECT census_id, count(*) AS n
                      FROM census_language_estimate
                     GROUP BY census_id
                   ) e
             WHERE e.census_id = c.id
            """
        )
        return cur.rowcount


def refresh_materialized_views(conn: psycopg.Connection) -> int:
    """D13. Returns the row count of territory_stats."""
    with conn.cursor() as cur:
        cur.execute("REFRESH MATERIALIZED VIEW territory_stats")
    return int(db.scalar(conn, "SELECT count(*) FROM territory_stats"))


def analyze(conn: psycopg.Connection) -> None:
    """Refresh planner statistics after a bulk load.

    Without this the planner still believes the tables are empty and will
    choose sequential scans over the indexes that were just built.
    """
    with conn.cursor() as cur:
        cur.execute("ANALYZE")

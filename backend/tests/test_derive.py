"""Tests for the derive stage.

These run without a database, so they cannot check the numbers D3 produces -
that is what the golden checks in etl.run.verify() are for, and they run on
every load. What is pinned here is the part a future edit could change silently:
the bookkeeping of which steps are implemented, and the four different
assignment semantics inside the roll-up SQL.

The semantics matter more than they look. Population and land area are
OVERWRITTEN by the child sum; gdp and literacy are FILLED ONLY IF UNSET. The
design document's version of this SQL had that asymmetry, the frontend has it,
and a reviewer tidying the four lines into a consistent shape would produce
numbers that are wrong but entirely plausible.
"""

import re

import pytest

from etl import derive, registry
from etl.config import SCHEMA_DIR
from etl.loaders import authorities, vocab

DERIVE_SQL = (SCHEMA_DIR / "003_derive.sql").read_text(encoding="utf-8")
ALTER_SQL = (SCHEMA_DIR / "004_alter.sql").read_text(encoding="utf-8")
SCHEMA_SQL = (SCHEMA_DIR / "001_schema.sql").read_text(encoding="utf-8")


def code_only(sql: str) -> str:
    """Strip `--` comments. Absence assertions must run against executable SQL,
    not against prose that explains why something is deliberately absent."""
    return "\n".join(
        line.split("--", 1)[0] for line in sql.splitlines()
    )


def squeeze(sql: str) -> str:
    """Collapse runs of whitespace, so an assertion pins the SQL rather than the
    column alignment around it. Reindenting a WHERE clause must not fail a
    test that is about what the clause says."""
    return re.sub(r"\s+", " ", sql)


DERIVE_CODE = code_only(DERIVE_SQL)


# ── which steps exist ──────────────────────────────────────────────────────

def test_implemented_steps_are_no_longer_declared_unimplemented():
    assert "territory_rollup" not in derive.NOT_IMPLEMENTED
    assert "locale_population_from_censuses" not in derive.NOT_IMPLEMENTED
    assert "create_regional_locales" not in derive.NOT_IMPLEMENTED
    # D6 is done for every classification source. What remains declared is the
    # REGIONAL roll-up per source, which is a different piece of work.
    assert "create_family_locales" not in derive.NOT_IMPLEMENTED
    assert "family_locales_all_sources" not in derive.NOT_IMPLEMENTED
    # D7. Note it shipped NARROWER than it was declared - see the test below.
    assert "descendant_population" not in derive.NOT_IMPLEMENTED
    # D8 for the Combined tree. What remains declared is the per-source walk
    # and the parent/child contradiction findings, which are separate work.
    assert "language_population_precedence" not in derive.NOT_IMPLEMENTED
    # D9, also for the Combined tree. What remains declared is the per-source
    # pass, which is BLOCKED on D8 widening rather than merely deferred.
    assert "largest_descendant" not in derive.NOT_IMPLEMENTED
    # D10. Depth is done for every source; the vitality rollup and the
    # coordinate fill are done for Combined. What remains declared is the
    # per-source half and the digital support score, both separate work.
    assert "recursive_language_data" not in derive.NOT_IMPLEMENTED


def test_the_seven_remaining_steps_still_raise():
    """An unimplemented step must never look like a computed zero."""
    assert len(derive.NOT_IMPLEMENTED) == 7
    for name in derive.NOT_IMPLEMENTED:
        with pytest.raises(derive.DeriveStepNotImplemented):
            derive.run_step(name)


def test_the_dependency_chain_is_still_declared_in_order():
    """D8 must come before D9, and so on down the chain."""
    steps = list(derive.NOT_IMPLEMENTED)
    assert steps[0] == "regional_locales_per_source"
    assert steps.index("language_population_precedence_per_source") < steps.index(
        "largest_descendant_per_source")
    assert steps.index("largest_descendant_per_source") < steps.index(
        "recursive_language_data_per_source")
    # D11 shipped for the Combined tree on 2026-08-11, so what sits at the end
    # of the chain is now the per-source pass rather than the step itself.
    assert steps[-1] == "family_modality_per_source"


def test_d8_absorbed_the_language_descendant_populations():
    """D7 was declared as the descendant populations for writing systems AND
    languages. Only the writing-system half was separable, and D8 now owns the
    language half.

    getLanguagePopulationFollowingDescendants (updatePopulations.ts:47-70)
    returns the child's ESTIMATE, not its descendant sum, so a parent's
    population_of_descendants is built from its children's D8 output and both
    have to be computed in one bottom-up pass. A plain roll-up over
    language_ancestry, which is the obvious substitute, produces a plausible
    wrong number the same way it would have for D6. That reasoning now has to
    live beside the function, because the NOT_IMPLEMENTED entry that used to
    carry it is gone."""
    fn = DERIVE_SQL.split("FUNCTION rebuild_language_populations", 1)[0]
    preamble = fn.rsplit("-- ── D8", 1)[1]
    assert "ESTIMATE" in preamble
    assert "one pass" in preamble.lower()
    # D8 fills both columns the old D7 scope claimed.
    assert "pop_speaking_of_descendants" in DERIVE_CODE
    assert "population_of_descendants" in DERIVE_CODE


def test_the_parent_discount_deferral_records_the_q1_decision():
    """Not porting discountPopulationEstimatesIfSimilarToParent means our
    numbers differ from the live site wherever it fires. The other half of that
    decision - recording those languoids as findings - is still owed, and the
    entry has to say so rather than leaving the omission to be rediscovered."""
    reason = derive.NOT_IMPLEMENTED["parent_child_population_contradictions"]
    assert "data_quality_finding" in reason
    assert "Algorithmic" in reason


def test_the_deferred_regional_dimension_says_why_it_is_not_just_a_grouping():
    """D6 now covers every source, so it is easy to assume the roll-up does too.
    The entry has to carry the reason it does not, because the number behind it
    - 146 of 254 ISO family languoids also carrying curated locales, which have
    no source and would split into a second regional row - took a measurement to
    find and would otherwise be re-derived."""
    reason = derive.NOT_IMPLEMENTED["regional_locales_per_source"]
    assert "146" in reason
    assert "FP-013" in reason


def test_the_family_locale_sources_run_iso_first():
    """Part B updates CURATED locales, which belong to no source and are shared
    by every pass, and it does so on the ISO pass only. Running ISO first means
    the later passes read rows that have already settled, so the result does not
    depend on the order of those four. Reorder this and the numbers move without
    anything raising."""
    assert derive.FAMILY_LOCALE_SOURCES[0] == "ISO"
    # All seven, not the five with parent edges today. CLDR and Ethnologue
    # produce nothing by measurement rather than by omission.
    assert len(derive.FAMILY_LOCALE_SOURCES) == 7
    assert "Glottolog" in derive.FAMILY_LOCALE_SOURCES


def test_d12_is_not_listed_because_d4_already_did_it():
    """computeLocalesWritingPopulation no longer exists in the frontend; writing
    population is computed inside D4. A D12 entry would send someone hunting for
    work that is finished."""
    assert "locale_writing_population" not in derive.NOT_IMPLEMENTED


def test_derive_helpers_are_exposed():
    assert callable(derive.rebuild_territory_rollup)
    assert callable(derive.rebuild_locale_population_from_censuses)
    assert callable(derive.rebuild_regional_locales)
    assert callable(derive.rebuild_family_locales)
    assert callable(derive.rebuild_writing_system_populations)
    assert callable(derive.rebuild_descendant_counts)
    assert callable(derive.rebuild_language_depth)
    assert callable(derive.rebuild_recursive_language_data)


# ── the roll-up SQL ────────────────────────────────────────────────────────

def test_the_function_is_replaceable():
    """Re-applying the file to a live database must not need a drop."""
    assert "CREATE OR REPLACE FUNCTION rebuild_territory_rollup(p_run_id uuid)" in DERIVE_SQL
    assert "DROP FUNCTION" not in DERIVE_SQL


def test_population_seeds_from_the_raw_un_column():
    """The ETL never writes territory.population. Without this the roll-up
    sums NULLs and every group comes out empty."""
    assert re.search(
        r"UPDATE territory SET population = population_from_un", DERIVE_SQL
    )


def test_population_and_land_area_are_overwritten_by_the_child_sum():
    assert "population    = COALESCE(NULLIF(agg.pop, 0), p.population)" in DERIVE_SQL
    assert "land_area_km2 = COALESCE(NULLIF(agg.area, 0), p.land_area_km2)" in DERIVE_SQL


def test_gdp_and_literacy_are_filled_only_when_unset():
    """The opposite of the two above. COALESCE takes the existing value first."""
    assert "gdp              = COALESCE(p.gdp, agg.gdp)" in DERIVE_SQL
    assert re.search(r"literacy_percent = COALESCE\(\s*p\.literacy_percent", DERIVE_SQL)


def test_literacy_is_weighted_by_population_not_a_plain_mean():
    assert "SUM(c.literacy_percent * c.population)" in DERIVE_SQL


def test_only_groups_aggregate():
    """A country must never be handed the sum of anything. Scoped to D3's own
    body, so that adding a later step to this file cannot move the count."""
    d3 = DERIVE_SQL.split("CREATE OR REPLACE FUNCTION rebuild_territory_rollup", 1)[1]
    d3 = d3.split("CREATE OR REPLACE FUNCTION", 1)[0]
    assert d3.count("AND ts.is_group") == 3   # one per pass


def test_leaves_missing_a_figure_are_reported_not_zeroed():
    """The frontend writes 0 here. Storing a fabricated measurement is the
    mistake the +/-0.01 tie-breakers were removed for."""
    assert "INSERT INTO data_quality_finding" in DERIVE_SQL
    assert "WHERE NOT ts.is_group AND m.missing" in DERIVE_SQL


def test_coordinates_use_the_fourth_root_of_land_area():
    """A plain mean lets one large country drag a region's marker onto itself."""
    assert "POWER(c.land_area_km2::double precision, 0.25)" in DERIVE_SQL


def test_coordinates_skip_children_with_no_position_or_no_area():
    assert "AND c.latitude  IS NOT NULL" in DERIVE_SQL
    assert "AND c.land_area_km2 > 0" in DERIVE_SQL


def test_the_world_is_pinned_to_the_origin_not_averaged():
    assert "AND p.id <> '001'" in DERIVE_SQL
    assert "UPDATE territory SET latitude = 0, longitude = 0 WHERE id = '001'" in DERIVE_SQL


def test_the_rollup_uses_the_geographic_hierarchy_only():
    """Greenland's population belongs to Northern America, not to Denmark."""
    assert "hierarchy = 'geographic'" in DERIVE_SQL
    assert "'political'" not in DERIVE_SQL
    assert "sovereign_id" not in DERIVE_SQL


def test_levels_are_processed_deepest_first():
    """A parent must only be computed once its children are finished."""
    assert "ORDER BY ta.depth DESC" in DERIVE_SQL


def test_the_file_is_transactional():
    """The first statement, ignoring the header comment, must open the
    transaction; a half-applied derive file is worse than an unapplied one."""
    statements = [
        line for line in DERIVE_SQL.splitlines()
        if line.strip() and not line.lstrip().startswith("--")
    ]
    assert statements[0].strip() == "BEGIN;"
    assert statements[-1].strip() == "COMMIT;"


def test_no_em_dashes():
    """Project hard rule 4. chr(8212) rather than the literal character, since
    writing it here would itself break the rule."""
    assert DERIVE_SQL.count(chr(8212)) == 0


def test_no_local_paths_or_private_references():
    """Project hard rule 8. Nothing under backend/ may point at a file a
    teammate cloning the repo cannot open."""
    for sql in (DERIVE_SQL, ALTER_SQL):
        assert ".private" not in sql
        # A drive letter followed by a separator. Matching a bare "D:" catches
        # `END::numeric` and every other legitimate cast.
        assert not re.search(r"\b[A-Za-z]:[\\/]", sql)


# ── 004_alter.sql, and keeping it in step with 001 ─────────────────────────

# Every column 004 adds must also be declared in 001, so that file stays the
# single readable description of the schema. Without this the two drift and a
# fresh install quietly differs from a migrated one.
ALTERED_COLUMNS = [
    ("language", "vitality_iso"),
    ("locale", "pop_speaking_unadjusted_derived"),
    ("locale", "pop_writing_unadjusted_derived"),
    ("locale", "pop_writing_adjusted"),
    ("locale", "pop_writing_census_id"),
    ("locale", "pop_speaking_source_derived"),
    ("locale", "pop_writing_source_derived"),
    ("locale", "language_source"),
    ("territory", "population_writing"),
]


@pytest.mark.parametrize("table,column", ALTERED_COLUMNS)
def test_altered_columns_are_also_declared_in_the_base_schema(table, column):
    assert re.search(rf"ADD COLUMN IF NOT EXISTS {column}\b", ALTER_SQL), (
        f"{column} is missing from 004_alter.sql"
    )
    assert re.search(rf"^\s+{column}\s+\w", SCHEMA_SQL, re.MULTILINE), (
        f"{column} was added to 004_alter.sql but not to 001_schema.sql"
    )


def test_the_obsolete_d6_overload_is_dropped():
    """CREATE OR REPLACE does NOT replace a function whose argument list
    differs - it creates an OVERLOAD. D6 gained a p_source parameter, so a
    database that already had the one-argument version kept the old ISO-only
    body installed and callable beside the new one. Invisible in the live
    database; found only by comparing project function counts against a
    scratch-schema install, 14 against 13.

    The signature is named exactly so the drop can never reach the current
    two-argument function, and IF EXISTS makes it a no-op on a fresh install."""
    assert "DROP FUNCTION IF EXISTS rebuild_family_locales(uuid);" in ALTER_SQL
    # Never the current signature.
    assert "DROP FUNCTION IF EXISTS rebuild_family_locales(uuid, language_source)" \
        not in ALTER_SQL


def test_every_alter_is_idempotent():
    """004 is re-applied on every load, so a second run must be a no-op."""
    for statement in re.findall(r"ALTER TABLE \w+ ADD COLUMN[^;]*;", ALTER_SQL):
        assert "IF NOT EXISTS" in statement, statement
    # ADD CONSTRAINT has no IF NOT EXISTS before PG18, so it needs a guard.
    if "ADD CONSTRAINT" in ALTER_SQL:
        assert "FROM pg_constraint WHERE conname" in ALTER_SQL


def test_alter_file_is_transactional():
    statements = [
        line for line in ALTER_SQL.splitlines()
        if line.strip() and not line.lstrip().startswith("--")
    ]
    assert statements[0].strip() == "BEGIN;"
    assert statements[-1].strip() == "COMMIT;"


# ── D4, the census selection ───────────────────────────────────────────────

def test_the_factor_weights_match_the_frontend():
    """Ports computeCensusRecordPriority, which replaced getPopulationRecordRank
    upstream (PR #745). Each factor is now scored 0..1 and multiplied by an
    explicit weight, rather than every term being added at whatever magnitude it
    happened to have. DATA_WEIGHTS in the TypeScript is the authority."""
    assert "0.6 * CASE WHEN p_use = 'speaking'" in DERIVE_CODE      # LanguageUse
    assert "+ 0.2 * ((p_year_collected - 2000) / 25.0)" in DERIVE_CODE  # Year
    assert "+ 0.1 * CASE p_acquisition_order" in DERIVE_CODE        # AcquisitionOrder
    assert "+ 0.1 * CASE\n        WHEN p_population_estimate < 10" in DERIVE_CODE
    # The weights must sum to 1.0, which is what makes the scores comparable.
    assert 0.6 + 0.2 + 0.1 + 0.1 == pytest.approx(1.0)


def test_the_rank_weights_match_the_frontend():
    """These constants are the whole ranking; a typo in one silently changes
    which census a locale reports. Unchanged by PR #745 - only the surrounding
    weight moved - so a diff here means the language-use scores themselves
    drifted."""
    speaking, writing = DERIVE_SQL.split("WHEN 'Writes'", 1)
    # Speaking arm
    assert "WHEN 'Speaks'      THEN 1.0" in speaking
    assert "WHEN 'Uses'        THEN 0.5" in speaking
    assert "WHEN 'Understands' THEN 0.5" in speaking
    assert "WHEN 'Ethnicity'   THEN 0.05" in speaking
    # Writing arm. Ethnicity counts AGAINST writing, and that sign matters.
    assert "WHEN 'Uses'      THEN 0.75" in writing
    assert "WHEN 'Reads'     THEN 0.5" in writing
    assert "WHEN 'Ethnicity' THEN -0.05" in writing


def test_the_year_term_is_active_and_uses_the_current_divisor():
    """The design document says year ranking is feature-flagged off; that is
    stale, the frontend applies it unconditionally.

    This divisor has now moved TWICE: 20 -> 40 in PR #742 (2026-08-05), then to
    25-under-a-0.2-weight in PR #745 (2026-08-11). Effective recency has fallen
    each time - (year-2000)/20, then /40, now /125. Pinned because it changes
    which census wins without changing any row count, which is exactly the class
    of drift that survives a green test suite."""
    assert "(p_year_collected - 2000) / 25.0" in DERIVE_CODE
    # Both superseded divisors, so a revert cannot pass quietly.
    assert "/ 20.0" not in DERIVE_CODE
    assert "/ 40.0" not in DERIVE_CODE


def test_collector_type_is_not_scored_in_the_ranking():
    """Collector type is commented out of getPopulationRecordRank; including it
    would silently change which census wins. It IS used, legitimately, to derive
    the population source category - so scope this to the rank function only."""
    rank_fn = DERIVE_CODE.split("FUNCTION census_record_rank", 1)[1]
    rank_fn = rank_fn.split("$$ LANGUAGE sql IMMUTABLE;", 1)[0]
    assert "collector_type" not in rank_fn
    assert "census_collector_rank" not in rank_fn


def test_the_derived_source_never_overwrites_the_curated_one():
    """pop_speaking_source holds a contributor's attribution from locales.tsv.
    The frontend overwrites its in-memory equivalent; doing that here would lose
    it for the 3,100 census-backed locales."""
    d4 = DERIVE_SQL.split("rebuild_locale_population_from_censuses", 1)[1]
    assert "pop_speaking_source_derived = w.s_source" in d4
    assert "pop_writing_source_derived  = w.w_source" in d4
    # The curated column must appear nowhere as an assignment target. The
    # lookahead is what distinguishes it from the _derived columns above.
    assert not re.search(r"pop_speaking_source(?!_derived)\s*=", d4)


def test_population_source_category_mapping():
    """Ports getPopulationSourceCategoryForCensus. Government means Official,
    a study means Study, everything else is Other."""
    assert "WHEN p_collector_type = 'Government' THEN 'Official'" in DERIVE_SQL
    assert "WHEN p_collector_type = 'Study'      THEN 'Study'" in DERIVE_SQL
    assert "ELSE 'Other'" in DERIVE_SQL
    # Organisation ids carry an `org.` prefix here; the frontend compares a bare
    # name. Getting this wrong silently classifies every CLDR census as Other.
    assert "p_presenter_org_id = 'org.CLDR'" in DERIVE_SQL


def test_territory_writing_population_is_computed():
    """TerritoryData.pop gained a `writing` member upstream on 2026-08-05:
    how many people in a territory can read and write at all."""
    assert "population_writing =" in DERIVE_SQL
    assert "COALESCE(population, 0) * COALESCE(literacy_percent, 0) / 100.0" in DERIVE_SQL


def test_acquisition_order_weights():
    """Rescaled to 0..1 in PR #745; the 0.1 factor weight now supplies the
    magnitude the raw constants used to carry themselves."""
    assert "WHEN 'Any' THEN 1.0" in DERIVE_CODE
    assert "WHEN 'L1'  THEN 0.5" in DERIVE_CODE
    assert "WHEN 'L2'  THEN 0.25" in DERIVE_CODE
    # The pre-#745 absolute constants, which would now be applied on top of the
    # 0.1 weight and score an order of magnitude too low.
    assert "WHEN 'Any' THEN 0.12" not in DERIVE_CODE


def test_a_tiny_population_estimate_is_penalised_not_merely_unrewarded():
    """New factor in PR #745. A record of under ten people is read as a "this
    language is present" flag rather than a count, and scores -1 for the whole
    population factor - a 0.1 penalty, not a 0 contribution. Getting this wrong
    lets a placeholder record beat a real census on the recency term alone."""
    assert "WHEN p_population_estimate < 10 THEN -1.0" in DERIVE_CODE
    # It must be a penalty relative to the percentage branch, not a floor of 0.
    assert "ELSE COALESCE(p_population_percent, 0) / 100.0" in DERIVE_CODE


def test_the_rank_receives_the_population_estimate_at_both_call_sites():
    """The estimate is a new argument, and the ranking is silently wrong without
    it: every record would take the percentage branch and no placeholder would
    ever be penalised. Both the speaking and the writing ranking must pass it."""
    assert DERIVE_CODE.count("r.acquisition_order, r.pct, r.estimate") == 2


def test_the_obsolete_rank_overload_is_dropped():
    """Same trap as test_the_obsolete_d6_overload_is_dropped. census_record_rank
    gained a sixth parameter, so CREATE OR REPLACE leaves the old five-argument
    additive body installed and callable beside the new one."""
    assert "DROP FUNCTION IF EXISTS census_record_rank(" in ALTER_SQL
    assert "census_language_use, smallint, text, numeric, text)" in ALTER_SQL
    # Never the current signature.
    assert "numeric, bigint, text)" not in ALTER_SQL.split(
        "DROP FUNCTION IF EXISTS census_record_rank(", 1
    )[1].split(";", 1)[0]


def test_percentage_denominator_is_the_census_not_the_territory():
    """The single most consequential difference from the design document's SQL,
    which divides by territory.population and gets an entirely different number."""
    assert "NULLIF(c.population_with_positive_responses, 0)" in DERIVE_SQL
    assert re.search(
        r"NULLIF\(COALESCE\(NULLIF\(c\.population_with_positive_responses, 0\),\s*"
        r"c\.population\), 0\)",
        DERIVE_SQL,
    ), "the JS `||` falls through on 0 as well as null; both NULLIFs are required"


def test_speaking_and_writing_are_ranked_separately():
    assert DERIVE_SQL.count("ROW_NUMBER() OVER (") >= 2
    assert "AS rn_speaking" in DERIVE_SQL and "AS rn_writing" in DERIVE_SQL


def test_ties_are_broken_deterministically():
    """JS Array.sort is stable so ties keep file order. SQL cannot reproduce
    that, and an unstable tie-break would change numbers between reloads."""
    assert DERIVE_SQL.count("r.census_id\n           ) AS rn_") == 2


def test_discounts_apply_only_to_imprecise_records():
    """A 'Speaks' census needs no interpretation to count speakers, and a
    'Writes' or 'Reads' one needs none to count writers."""
    assert "COALESCE(w.s_precise, false) THEN 1" in DERIVE_SQL
    assert "COALESCE(w.w_precise, false) THEN 1" in DERIVE_SQL
    assert "bool_or(language_use = 'Speaks')" in DERIVE_SQL
    assert "bool_or(language_use IN ('Writes', 'Reads'))" in DERIVE_SQL


def test_speaking_never_takes_a_literacy_discount():
    """Only the writing arm multiplies by territory literacy."""
    speaking_arm = DERIVE_SQL.split("pop_speaking_adjusted  = ROUND(", 1)[1]
    speaking_arm = speaking_arm.split("pop_writing_census_id", 1)[0]
    assert "literacy_percent" not in speaking_arm


def test_modality_discount_table_matches_the_frontend():
    """getLanguageModalityDiscount. Sign and Spoken cannot be written; Written
    cannot be spoken. Getting a sign flipped here zeroes a real population."""
    assert "WHEN p_modality IS NULL THEN 1.0" in DERIVE_SQL
    speaking, writing = DERIVE_SQL.split("ELSE\n      CASE p_modality", 1)
    assert "WHEN -2 THEN 0.0    -- Written: not spoken at all" in speaking
    assert "WHEN -1 THEN 0.1" in speaking
    assert "WHEN  3 THEN 0.0    -- Sign: not directly written" in writing
    assert "WHEN  1 THEN 0.1" in writing
    assert "WHEN -2 THEN 1.0    -- Written" in writing


def test_the_no_census_branch_exists():
    """Most locales have no census at all: 9,040 carry a curated figure and
    only 3,100 match any census. Omitting this branch loses two thirds of them."""
    assert "lo2.pop_speaking_census_id IS NULL" in DERIVE_SQL
    assert "lo2.pop_speaking_unadjusted IS NOT NULL" in DERIVE_SQL


def test_the_no_census_branch_preserves_the_asymmetry():
    """Speaking scales the raw count; writing goes via the percentage and back
    out through territory population. That is what the TypeScript does."""
    assert "ROUND(lo.pop_speaking_unadjusted * pass2.s_discount)" in DERIVE_SQL
    assert "pass2.s_pct * pass2.w_discount * pass2.literacy_discount" in DERIVE_SQL


def test_unadjusted_columns_are_never_written():
    """Deliberate divergence: the frontend overwrites its in-memory unadjusted
    field with the census figure. Doing that here would destroy the curated
    value from locales.tsv, which the schema keeps separate on purpose."""
    d4 = DERIVE_SQL.split("rebuild_locale_population_from_censuses", 1)[1]
    assert "pop_speaking_unadjusted =" not in d4
    assert "pop_writing_unadjusted =" not in d4


def test_locale_literacy_is_a_ratio_not_a_copy():
    """It is the writers-to-speakers ratio for THIS locale, with the territory
    rate only as a fallback. Latin in Italy is not Italian in Italy."""
    assert "LEAST(lo.pop_writing_adjusted * 100.0 / lo.pop_speaking_adjusted, 100)" in DERIVE_SQL
    assert "ELSE t.literacy_percent" in DERIVE_SQL


def test_schema_files_are_applied_before_the_copy_phase():
    """Regression. ALTER TABLE cannot run once the transaction holds pending
    deferred trigger events, and the load phase issues SET CONSTRAINTS ALL
    DEFERRED. Applying 004 after the COPY aborts the load - and because --fresh
    has already committed its TRUNCATE, the rollback leaves an EMPTY database.
    That happened once; this pins the ordering."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    body = run_py.split("def _do_load(", 1)[1]
    alter_at = body.index('"004_alter.sql"')
    derive_at = body.index('"003_derive.sql"')
    commit_at = body.index("conn.commit()")
    load_at = body.index("written = load(conn")
    assert alter_at < derive_at < commit_at < load_at, (
        "schema DDL must be applied and committed before the COPY phase"
    )


def test_d4_resets_before_recomputing():
    """Without the reset a re-run keeps a stale winning census when the new
    ranking picks nothing."""
    d4 = DERIVE_SQL.split("rebuild_locale_population_from_censuses", 1)[1]
    for column in ("pop_speaking_census_id", "pop_writing_census_id",
                   "pop_writing_adjusted", "literacy_percent"):
        assert re.search(rf"{column}\s*= NULL", d4), column


# ── D5, regional locales ───────────────────────────────────────────────────
#
# D5 is the first derive step that CREATES ROWS rather than filling columns,
# so what is pinned here is mostly about which rows exist and what they may
# carry. The numbers themselves are golden checks in etl.run.verify().

D5_SQL = DERIVE_SQL.split("CREATE OR REPLACE FUNCTION rebuild_regional_locales", 1)[1]
# Bounded at D6, which is declared after it in the file. Unbounded, every "not
# in" assertion below would quietly start reading D6's body as well and would
# fail for reasons that have nothing to do with D5.
D5_SQL = D5_SQL.split("CREATE OR REPLACE FUNCTION rebuild_family_locales", 1)[0]
D5_CODE = code_only(D5_SQL)
INDEXES_SQL = (SCHEMA_DIR / "002_indexes.sql").read_text(encoding="utf-8")


def test_d5_function_is_replaceable():
    assert "CREATE OR REPLACE FUNCTION rebuild_regional_locales(p_run_id uuid)" in DERIVE_SQL


def test_d5_deletes_only_what_it_owns_before_rebuilding():
    """Idempotency. The predicate must be locale_source, which only this
    function writes - anything looser reaches a curated row."""
    assert "DELETE FROM entity e" in D5_CODE
    assert "l.locale_source = 'createRegionalLocales'" in D5_CODE
    # A delete keyed on the id prefix instead would be a string match against
    # user-facing data rather than against the column that means "generated".
    assert "left(e.id" not in D5_CODE


def test_d5_carries_two_separate_unadjusted_sums():
    """createRegionalLocales runs BEFORE censuses load, so its > 10 cutoff sees
    the curated figures; the stored population sums the census-overwritten
    ones. Collapsing them into one sum is wrong by 44% for Hindi and produces a
    perfectly plausible number."""
    assert "cutoff_unadjusted" in D5_CODE
    assert "pop_speaking_unadjusted_derived AS s_unadj" in D5_CODE
    assert "HAVING COALESCE(SUM(s.cutoff), 0) > 10" in D5_CODE


def test_d5_cutoff_is_never_persisted():
    """It is scaffolding. Storing it would put a curated-looking number on a
    generated row and make D4's pass 2 claim that row on the next run."""
    insert = D5_CODE.split("INSERT INTO locale (", 1)[1]
    assert "cutoff_unadjusted" not in insert


def test_d5_uses_the_geographic_hierarchy_only():
    """Greenland's speakers belong to Northern America, not to Denmark."""
    assert "hierarchy = 'geographic'" in D5_CODE
    assert "sovereign" not in D5_CODE


def test_d5_walks_levels_deepest_first():
    """A parent must see finished children, and the cutoff prunes at each level
    on the way up."""
    loop = D5_CODE.split("FOR d IN", 1)[1].split("LOOP", 1)[0]
    assert "ORDER BY ta.depth DESC" in loop


def test_d5_takes_only_generated_rows_from_a_group_child():
    """createRegionalLocales REPLACES territory.locales for a group, so the 30
    curated locales sitting on group territories are excluded from their
    parent's sum."""
    assert "WHERE cts.is_group" in D5_CODE
    assert "r.territory_id = c.id" in D5_CODE
    # A leaf contributes everything on it whatever its source, which is what
    # makes this pick up D6's family locales with no change here.
    assert "WHERE NOT cts.is_group" in D5_CODE
    assert "l.locale_source" not in D5_CODE.split("CROSS JOIN LATERAL", 1)[1].split(") s", 1)[0]


def test_d5_maps_a_zero_sum_to_null_not_to_zero():
    """sumBy() coalesces terms to 0 then maps a 0 total to undefined. A stored
    0 would be indistinguishable from "nobody here speaks this"."""
    for column in ("s_unadj", "w_unadj", "s_adj", "w_adj"):
        assert re.search(rf"NULLIF\(SUM\(s\.{column}\),\s*0\)", D5_CODE), column


def test_d5_generated_ids_are_prefixed():
    """locale.id is a single-row primary key, but the UNIQUE constraint admits
    a curated AND a generated row for the same tuple. Without the prefix the
    two cannot both be stored, and four collide today."""
    assert "'reg.' || r.code" in D5_CODE
    # code_display keeps the bare locale code, as org.StatCAN -> StatCAN does.
    assert "'reg.' || r.code, 'Locale', r.code" in D5_CODE


def test_d5_writes_no_curated_column():
    """A generated row carrying pop_speaking_unadjusted would be claimed by
    D4's pass 2 on the next run, which keys off exactly that column."""
    # The INSERT target list only: the SELECT beneath it reads columns of the
    # scaffolding table that happen to share these names.
    targets = D5_CODE.split("INSERT INTO locale (", 1)[1].split(")", 1)[0]
    for column in ("pop_speaking_unadjusted,", "pop_speaking_source,",
                   "official_status", "pop_speaking_census_id"):
        assert column not in targets, column


def test_d5_literacy_does_not_fall_back_to_the_territory():
    """D4 copies the territory rate when one side of the ratio is missing.
    computeAggregatedLocalesPopulation.ts:22-25 leaves it undefined instead."""
    body = D5_CODE.split("INSERT INTO locale (", 1)[1].split(";", 1)[0]
    assert "t.literacy_percent" not in body
    assert "pop_writing_adjusted * 100.0" in body


def test_d4_cannot_reach_a_generated_row_through_its_literacy_pass():
    """Pass 3 joins on territory_id alone, so it is the one D4 statement that
    would otherwise write a territory fallback onto a D5 or D6 row. Neither
    wants one: regional literacy is left undefined by
    computeAggregatedLocalesPopulation.ts:22-25, and a family locale's rate is
    D6's own writers-to-speakers ratio."""
    d4 = DERIVE_SQL.split("rebuild_locale_population_from_censuses", 1)[1]
    d4 = code_only(d4.split("CREATE OR REPLACE FUNCTION rebuild_regional_locales", 1)[0])
    assert "lo.locale_source NOT IN ('createRegionalLocales', 'createFamilyLocales')" in d4


def test_d4_cannot_claim_a_family_locale_through_its_no_census_pass():
    """D6 stores a family locale's pre-census sum in pop_speaking_unadjusted,
    which is exactly the predicate pass 2 selects on. D6 rebuilds its rows
    immediately after D4, so the write would be discarded today - but a step
    that is only correct because of what runs next is one reordering away from
    being wrong, and silently so."""
    d4 = DERIVE_SQL.split("rebuild_locale_population_from_censuses", 1)[1]
    d4 = code_only(d4.split("CREATE OR REPLACE FUNCTION rebuild_regional_locales", 1)[0])
    pass2 = d4.split("lo2.pop_speaking_unadjusted IS NOT NULL", 1)[1]
    assert "lo2.locale_source NOT IN ('createRegionalLocales', 'createFamilyLocales')" in pass2


def test_d4_records_the_census_head_count_without_destroying_the_curated_one():
    """applyPopRecord() overwrites pop.speaking.unadjusted with the winning
    census estimate. D5 sums that, so it has to be stored - but beside the
    curated column, not over it."""
    d4 = DERIVE_SQL.split("rebuild_locale_population_from_censuses", 1)[1]
    d4 = code_only(d4.split("CREATE OR REPLACE FUNCTION rebuild_regional_locales", 1)[0])
    assert "pop_speaking_unadjusted_derived = w.s_estimate" in d4
    assert "pop_writing_unadjusted_derived  = w.w_estimate" in d4
    # Still never over the curated columns. This is the D4 guarantee.
    assert not re.search(r"pop_speaking_unadjusted\s*=", d4)
    assert not re.search(r"pop_writing_unadjusted\s*=", d4)


def test_the_foreign_key_index_that_makes_the_rebuild_survivable_exists():
    """Regression, and an expensive one to rediscover. Every DELETE from entity
    proves that nothing references the row; with no index on this column that
    proof is a sequential scan of 60,173 rows PER DELETED ROW. D5 deletes
    21,555 on every run: measured at 221 seconds without it and 13 with."""
    assert "lsa_cldr_provider_idx" in INDEXES_SQL
    # 002 is applied on a fresh install and never again, so the index also has
    # to be in the file that IS re-applied, or an existing database never sees
    # it. Both, or the two drift.
    assert "lsa_cldr_provider_idx" in ALTER_SQL
    assert "CREATE INDEX IF NOT EXISTS lsa_cldr_provider_idx" in ALTER_SQL
    # And because both files declare it, 002's copy needs the guard too: on a
    # fresh install 004 runs first, so a plain CREATE INDEX here would fail on
    # a duplicate and take the install down with it.
    assert "CREATE INDEX IF NOT EXISTS lsa_cldr_provider_idx" in INDEXES_SQL


def test_d5_runs_after_d4_and_before_the_matview():
    """D5 sums pop_speaking_unadjusted_derived, which D4 writes, and
    territory_stats reads locales a territory group does not have until D5."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    d4_at = run_py.index("derive.rebuild_locale_population_from_censuses(conn")
    d5_at = run_py.index("derive.rebuild_regional_locales(conn")
    d13_at = run_py.index("derive.refresh_materialized_views(conn)")
    assert d4_at < d5_at < d13_at


# ── D6, family locales ─────────────────────────────────────────────────────
#
# Like D5, D6 creates rows and ports TWO frontend functions that sum different
# inputs. What is pinned here is the handful of semantics a reviewer would
# simplify into something plausible and wrong: the curated-shadowing rule, the
# two-column pre/post-census split that lets D5 stay untouched, and part A's
# use of the RAW territory population rather than the rolled-up one.

# Bounded at the end of the function body, not merely started at its head. It
# ran to the end of the file until D9 was added, so every function written after
# D6 was silently part of "the D6 code" - and the absence assertions below are
# exactly the kind that pass for the wrong reason when the haystack grows.
# test_d6_walks_one_source_tree_and_it_is_the_parameter caught it by failing,
# which is the lucky direction; the count assertion is what made it loud.
D6_SQL = (
    DERIVE_SQL.split("CREATE OR REPLACE FUNCTION rebuild_family_locales", 1)[1]
              .split("$$ LANGUAGE plpgsql;", 1)[0]
)
D6_CODE = code_only(D6_SQL)
# The two halves, split on a CODE landmark rather than on the "Part B"
# banner - code_only() strips comments, so the banner is not there to find.
_PART_B_STARTS = "DROP TABLE IF EXISTS _lang_parent_locale"
D6_PART_A = D6_CODE.split(_PART_B_STARTS, 1)[0]
D6_PART_B = D6_CODE.split(_PART_B_STARTS, 1)[1]


def test_d6_function_is_replaceable():
    assert "CREATE OR REPLACE FUNCTION rebuild_family_locales(p_run_id uuid," in DERIVE_SQL
    assert "p_source language_source)" in DERIVE_SQL


def test_d6_deletes_only_what_it_owns_before_rebuilding():
    """Idempotency, and the predicate must be locale_source - the column that
    means "generated" - rather than the id prefix, which is user-facing data."""
    assert "DELETE FROM entity e" in D6_CODE
    assert "l.locale_source = 'createFamilyLocales'" in D6_CODE
    assert "left(e.id" not in D6_CODE


def test_d6_walks_one_source_tree_and_it_is_the_parameter():
    """createFamilyLocales.ts:13 pins SOURCE to ISO, but
    searchLocalesForMissingLinks.ts:34 HARDCODES language.ISO.parentLanguage for
    the locale edges part B walks. Under one source that difference is
    invisible. Here p_source must drive BOTH, or a Glottolog pass walks the ISO
    tree and every non-ISO row is quietly wrong."""
    assert "a.source = p_source" in D6_CODE       # part A, the language tree
    assert "lsa.source = p_source" in D6_CODE     # part A and part B
    # No source may be named literally in the tree walk. The one permitted
    # literal is the p_source = 'ISO' guard that keeps shared curated rows to a
    # single pass; anything else means a hardcoded tree survived.
    assert D6_CODE.count("'ISO'") == 1
    assert "p_source = 'ISO'" in D6_CODE
    assert "'Glottolog'" not in D6_CODE


def test_d6_writes_shared_curated_rows_on_the_iso_pass_only():
    """A curated locale belongs to no classification. Letting five passes each
    propose a sum for the same shared row would make the answer depend on call
    order; ISO is the pass that reproduces the frontend, so ISO owns them."""
    assert "OR p.locale_source = 'createFamilyLocales'" in D6_PART_B


def test_d6_edges_never_cross_sources():
    """Both ends of a parent-child edge must be visible to the pass walking it:
    its own family locales, plus curated rows, which belong to no source.
    Without this a Glottolog pass would sum ISO's family locales."""
    assert "(p.language_source IS NULL OR p.language_source = p_source)" in D6_PART_B
    assert "(c.language_source IS NULL OR c.language_source = p_source)" in D6_PART_B


def test_d6_deletes_only_its_own_source_before_rebuilding():
    """Idempotency is now per source. A delete that ignored language_source
    would make each pass wipe the previous one's rows and leave only the last."""
    assert "AND l.language_source = p_source);" in D6_CODE


def test_d6_a_curated_locale_shadows_the_family_sum():
    """createLocalesForLanguageFamily creates nothing when a locale already
    exists at (family, territory), and returns language.locales - so the
    CURATED figure is what travels upward. Without this, zho_CN's measured
    1,274,436,000 would be replaced by the sum of cmn_CN + yue_CN + ...,
    which is a different number and looks just as reasonable."""
    loop = D6_CODE.split("FOR d IN REVERSE max_depth", 1)[1].split("END LOOP", 1)[0]
    assert "NOT EXISTS (" in loop
    assert "c.language_id  = lsa.parent_language_id" in loop
    assert "c.locale_source NOT IN ('createRegionalLocales'," in loop


def test_d6_skips_script_and_variant_locales():
    """createFamilyLocales.ts:41-42 drops them from the CHILD list, so they
    neither create a family locale nor contribute to one."""
    seed = D6_CODE.split("INSERT INTO _family_locale", 1)[1].split(";", 1)[0]
    assert "l.script_id IS NULL" in seed
    assert "l.variant_key = ''" in seed


def test_d6_part_a_uses_the_raw_un_population_not_the_rolled_up_one():
    """createFamilyLocales runs in CoreData; computeContainedTerritoryStats does
    not run until SupplementalData, and territory.pop.speaking is not set until
    then either. Identical for every leaf, different for the 32 groups."""
    part_a = D6_PART_A
    assert "t.population_from_un" in part_a
    assert "t.population " not in part_a


def test_d6_part_b_uses_the_rolled_up_population():
    """Part B runs inside updatePopulations, well after SupplementalData, so
    here territory.pop.overall IS the rolled-up figure."""
    part_b = D6_PART_B
    assert "population_from_un" not in part_b
    assert "t.population" in part_b


def test_d6_splits_the_pre_and_post_census_sums_across_two_columns():
    """This is what lets D5 stay completely untouched. D5 already reads
    pop_speaking_unadjusted for its > 10 cutoff and
    pop_speaking_unadjusted_derived for its sums, which is exactly the
    pre/post-census split. Collapsing them into one column would either break
    D5's cutoff or make it sum the pre-census figure."""
    part_a = D6_PART_A
    targets = part_a.split("INSERT INTO locale (", 1)[1].split(")", 1)[0]
    assert "pop_speaking_unadjusted," in targets
    assert "pop_speaking_unadjusted_derived" not in targets
    part_b = D6_PART_B
    assert "pop_speaking_unadjusted_derived = l.new_unadj" in part_b


def test_d6_part_a_writes_no_writing_column():
    """createFamilyLocales sets `writing: {}` - it does not touch writing at
    all. Part B is where a family locale first gets one."""
    part_a = D6_PART_A
    targets = part_a.split("INSERT INTO locale (", 1)[1].split(")", 1)[0]
    assert "pop_writing" not in targets


def test_d6_generated_ids_are_prefixed():
    """Required, not cosmetic: a family locale on a group territory and a
    regional locale for the same languoid carry the same bare code. Three
    collide today."""
    assert "'fam.' || p_source::text || '.' || f.code" in D6_CODE
    assert "'fam.' || p_source::text || '.' || f.code, 'Locale', f.code" in D6_CODE
    # The row must carry the source as a COLUMN too, or the uniqueness rule
    # cannot tell two classifications' copies apart.
    assert "'createFamilyLocales', p_source, ''" in D6_CODE


def test_d6_honours_the_census_guard_for_each_use_separately():
    """`if (pop.census) return`, and sumUpPopulationFromChildLanguages is called
    once per use - so a locale can take a new speaking figure and keep its old
    writing one."""
    part_b = D6_PART_B
    assert "p.pop_speaking_census_id IS NULL" in part_b
    assert "p.pop_writing_census_id IS NULL" in part_b


def test_d6_never_lowers_an_existing_estimate():
    """Line 111: `if (pop.adjusted && newPopulationEstimate <= pop.adjusted)
    return`. Both sides are tested for truthiness, so an existing 0 must NOT
    block the update - COALESCE(old, 0) <> 0 is the faithful spelling."""
    part_b = D6_PART_B
    assert part_b.count("COALESCE(old_adj, 0) <> 0 AND new_adj <= old_adj") == 2


def test_d6_maps_a_zero_sum_to_null_not_to_zero():
    """sumBy() coalesces each term to 0 then maps a 0 total to undefined. A
    stored 0 is indistinguishable from "nobody here speaks this"."""
    assert "NULLIF(LEAST(SUM(COALESCE(f.pop_unadjusted, 0))" in D6_CODE
    part_b = D6_PART_B
    assert part_b.count("NULLIF(LEAST(SUM(COALESCE(") == 2


def test_d6_does_nothing_at_all_when_the_sum_is_zero():
    """`if (!newPopulationEstimate) return` - not "write a zero"."""
    part_b = D6_PART_B
    assert part_b.count("HAVING SUM(c.pop_speaking_adjusted) > 0") == 1
    assert part_b.count("HAVING SUM(c.pop_writing_adjusted) > 0") == 1


def test_d6_caps_are_reported_rather_than_passing_silently():
    """A family whose children outnumber the territory's people is a
    contradiction in the source data. The cap is correct; hiding it is not."""
    assert D6_CODE.count("INSERT INTO data_quality_finding") == 3


def test_d6_writing_percent_divides_by_the_whole_population():
    """computeAggregatedLocalesPopulation.ts:122 uses pop.overall for BOTH
    uses, so a writing percentage is a share of everyone, not of the literate
    part. Dividing by population_writing would inflate every one of them."""
    part_b = D6_PART_B
    writing = part_b.split("pop_writing_adjusted           = l.new_adj", 1)[1]
    assert "pop_writing_percent            = LEAST(l.new_unadj * 100.0" in writing
    assert "l.terr_pop" in writing.split("pop_writing_percent", 1)[1][:200]


def test_d6_literacy_is_recomputed_for_every_locale_it_visits():
    """getLanguageFamilyLocalePopulation lines 79-82 assign it unconditionally,
    whether or not either sum was applied - so it can replace a rate D4
    computed with NULL. Faithful, and easy to 'fix' into something wrong."""
    assert "SET literacy_percent =" in D6_CODE
    tail = D6_CODE.split("SET literacy_percent =", 1)[1]
    assert "EXISTS (SELECT 1 FROM _lang_parent_locale e WHERE e.parent_id = p.id)" in tail


def test_d6_runs_after_d4_and_before_d5():
    """Not the numbering's order. connectObjects.ts:41 creates family locale
    rows before regional ones and updatePopulations.ts:24 sums the family
    populations first, so that D5 rolls up FINISHED family locales. Getting
    this backwards leaves the regional numbers short by whatever the family
    locales would have added, with nothing raising."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    d4_at = run_py.index("derive.rebuild_locale_population_from_censuses(conn")
    d6_at = run_py.index("derive.rebuild_family_locales(conn")
    d5_at = run_py.index("derive.rebuild_regional_locales(conn")
    assert d4_at < d6_at < d5_at


def test_d5_aggregates_iso_family_locales_only():
    """D5 groups leaf locales by (language, script, variant) with NO source
    dimension, so without this filter five classifications' copies of one family
    locale would land in the same bucket and be summed - a 5x regional
    overcount, and silent, because every individual number still looks
    reasonable. ISO is the source the frontend generates.

    Note what the filter does NOT do: it does not test locale_source. A leaf
    still contributes its curated rows and its ISO family rows alike, which is
    the branch D6 arrives through and the reason the pre/post-census column
    split was chosen."""
    assert "WHERE NOT cts.is_group" in D5_CODE
    leaf = D5_CODE.split("WHERE NOT cts.is_group", 1)[1].split("UNION ALL", 1)[0]
    assert "(l.language_source IS NULL OR l.language_source = 'ISO')" in leaf
    assert "l.locale_source" not in leaf


def test_the_d5_consistency_check_mirrors_the_d5_filter():
    """The golden check that sums a group's children has to apply the same
    source filter D5 does, or it reports D5 as broken for doing exactly what it
    is supposed to. Measured at 477 false failures without it."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    check = run_py.split("D5 groups whose speakers disagree", 1)[1].split("lambda", 1)[0]
    assert "c.language_source IS NULL" in check
    assert "c.language_source = 'ISO'" in check


# ── territory_stats and the scope-dependent locale source ───────────────

def test_territory_stats_picks_its_locale_source_by_scope():
    """A country is described by its CURATED locales; a territory group by the
    REGIONAL ones D5 generates, because createRegionalLocales replaces
    territory.locales for a group. An unconditional 'StableDatabase' made the
    view report the world's largest language as Volapuk, on 200 speakers."""
    view = SCHEMA_SQL.split("CREATE MATERIALIZED VIEW territory_stats", 1)[1]
    view = view.split(";", 1)[0]
    assert "ts.is_group" in view
    assert "'createRegionalLocales'" in view
    assert "'StableDatabase'" in view
    # The old unconditional predicate must not survive anywhere in the view.
    assert "AND lo.locale_source = 'StableDatabase'" not in view


def test_territory_stats_cannot_name_a_language_it_cannot_count():
    """Otherwise the id and the count disagree, and a plausible-looking id
    reads as an answer where a NULL would read as "not computed"."""
    view = SCHEMA_SQL.split("CREATE MATERIALIZED VIEW territory_stats", 1)[1]
    view = view.split(";", 1)[0]
    assert "CASE WHEN MAX(lo.pop_speaking_adjusted) IS NOT NULL" in view


def test_the_matview_migration_is_guarded_and_restores_its_index():
    """A materialized view cannot be CREATE OR REPLACE'd, so 004 has to DROP
    and recreate. 004 is re-applied on EVERY load, so without the guard that
    would rebuild the view each time and take its unique index with it. The
    index is dropped along with the view, so it must be recreated too."""
    assert "DROP MATERIALIZED VIEW IF EXISTS territory_stats" in ALTER_SQL
    guard = ALTER_SQL.split("DROP MATERIALIZED VIEW", 1)[0]
    assert "IF NOT EXISTS (" in guard
    assert "pg_matviews" in guard
    # strpos, not LIKE: a % in a SQL string is a psycopg placeholder.
    assert "strpos(definition, 'createRegionalLocales')" in guard
    # pg_matviews spans the whole database, and 001's header documents a
    # blue/green install into a separate schema. Unqualified, the guard would
    # see the other schema's copy and skip, leaving this one on the old
    # definition with no error raised.
    assert "schemaname  = current_schema()" in guard
    assert "LIKE" not in guard.split("pg_matviews", 1)[1]
    after = ALTER_SQL.split("DROP MATERIALIZED VIEW", 1)[1]
    assert "CREATE UNIQUE INDEX territory_stats_pk" in after


def test_the_two_matview_definitions_agree():
    """001 is the clean install and 004 is the migration path. They declare the
    same view, so they have to say the same thing or a migrated database
    quietly differs from a fresh one."""
    def body(sql):
        v = sql.split("CREATE MATERIALIZED VIEW territory_stats AS", 1)[1]
        return " ".join(v.split(";", 1)[0].split())
    assert body(SCHEMA_SQL) == body(ALTER_SQL)


# ── every foreign key is indexed, or explicitly is not ─────────────────────
#
# This rule is mechanical, so it is checked mechanically rather than
# remembered. It exists because language_source_attribute.cldr_data_provider_id
# had no index for the whole life of the schema and nobody noticed: the column
# is 100% NULL and nothing reads it, so it never made a query slow. The cost
# landed on DELETEs of a DIFFERENT table, and nothing deleted anything until D5.
# It made D5's rebuild take 216 seconds instead of 13.6.

# Parents that are seeded lookup tables, never deleted from, and never filtered
# on through this child. Full reasoning at the end of Tier 2b in 002_indexes.sql.
FK_INDEX_EXEMPT = {
    ("language_source_attribute", "scope"),
    ("language_source_attribute", "modality"),
    ("language_source_attribute", "eth_vitality_2012"),
    ("language_source_attribute", "eth_vitality_2025"),
}


def _split_top_level(body: str) -> list[str]:
    """Split a CREATE TABLE body on the commas that separate definitions.

    Not on every comma: `numeric(12,2)` and `PRIMARY KEY (a, b)` both contain
    commas that are inside parentheses and must not split.
    """
    parts, depth, current = [], 0, []
    for char in body:
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        if char == "," and depth == 0:
            parts.append("".join(current))
            current = []
        else:
            current.append(char)
    parts.append("".join(current))
    return parts


def _single_column_foreign_keys(sql: str) -> set[tuple[str, str]]:
    """Every (table, column) with a single-column REFERENCES, read from 001.

    Three spellings, and the schema uses all three:

        col text REFERENCES parent(id)              inline
        col text NOT NULL                           inline, wrapped onto the
          REFERENCES parent(id)                     next line
        ALTER TABLE t ADD CONSTRAINT c FOREIGN KEY (col) REFERENCES parent(id)

    The third exists because language and writing_system reference each other,
    so one of the two keys cannot be declared until both tables are created.
    Parsing line by line misses the second and third; an earlier version of
    this function did, and silently under-reported by three keys.
    """
    code = code_only(sql)
    found: set[tuple[str, str]] = set()

    for table, body in re.findall(
        r"CREATE TABLE (\w+)\s*\((.*?)\n\);", code, re.DOTALL
    ):
        for definition in _split_top_level(body):
            definition = " ".join(definition.split())
            if "REFERENCES" not in definition:
                continue
            explicit = re.search(r"FOREIGN KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES", definition)
            if explicit:
                found.add((table, explicit.group(1)))
                continue
            inline = re.match(r"(\w+)\s", definition)
            if inline and inline.group(1).upper() not in {
                "FOREIGN", "CONSTRAINT", "UNIQUE", "PRIMARY", "CHECK",
            }:
                found.add((table, inline.group(1)))

    for table, column in re.findall(
        r"ALTER TABLE (\w+)\s+ADD CONSTRAINT \w+\s+FOREIGN KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES",
        " ".join(code.split()).replace("; ", ";\n"),
    ):
        found.add((table, column))

    return found


def _explicit_index_leading_columns(sql: str) -> set[tuple[str, str]]:
    """Every (table, first indexed column) from a CREATE INDEX statement."""
    found: set[tuple[str, str]] = set()
    for match in re.finditer(
        r"CREATE (?:UNIQUE )?INDEX (?:IF NOT EXISTS )?\w+\s*\n?\s*ON (\w+)\s*(?:USING \w+\s*)?\(\s*(\w+)",
        sql,
    ):
        found.add((match.group(1), match.group(2)))
    return found


def _implicit_index_leading_columns(sql: str) -> set[tuple[str, str]]:
    """Postgres builds an index for every PRIMARY KEY and UNIQUE constraint.

    Those count. Missing them makes a naive version of this test demand indexes
    that already exist: locale_variant.locale_id leads its composite primary
    key, and census_language_estimate.census_id leads its own.
    """
    found: set[tuple[str, str]] = set()
    table: str | None = None
    for raw in sql.splitlines():
        line = raw.split("--", 1)[0]
        create = re.match(r"\s*CREATE TABLE (\w+)", line)
        if create:
            table = create.group(1)
            continue
        if re.match(r"\s*\)\s*;", line):
            table = None
            continue
        if table is None:
            continue
        inline = re.match(r"\s*(\w+)\s+[\w ()]+?(?:PRIMARY KEY|UNIQUE)\b", line)
        if inline:
            found.add((table, inline.group(1)))
        composite = re.search(
            r"(?:PRIMARY KEY|UNIQUE(?: NULLS NOT DISTINCT)?)\s*\(\s*(\w+)", line)
        if composite:
            found.add((table, composite.group(1)))
    return found


def _indexed_leading_columns(schema_sql: str, indexes_sql: str) -> set[tuple[str, str]]:
    return (_explicit_index_leading_columns(indexes_sql)
            | _explicit_index_leading_columns(schema_sql)
            | _implicit_index_leading_columns(schema_sql))


def test_the_foreign_key_parser_finds_the_keys_we_know_about():
    """A parser that quietly matches less than everything makes the test below
    pass for the wrong reason, which is the only failure mode that matters
    here. Checked against pg_constraint on a live database on 2026-08-05: the
    parser found exactly the same 74 keys, none missed and none invented.

    The three cases below are the ones an earlier, line-based version DID miss.
    Each represents a spelling in the schema, so they are kept as fixtures."""
    keys = _single_column_foreign_keys(SCHEMA_SQL)
    assert len(keys) > 50, len(keys)

    # Plain inline: `col text REFERENCES parent(id)`.
    for known in (("locale", "language_id"), ("locale", "territory_id"),
                  ("language_ancestry", "ancestor_id"),
                  ("language_source_attribute", "cldr_data_provider_id")):
        assert known in keys, known

    # Inline, with REFERENCES wrapped onto the following line.
    assert ("language_cldr_missing_feature", "language_id") in keys
    assert ("wikipedia_edition_script", "wikipedia_subdomain") in keys

    # Added by a later ALTER TABLE, because language and writing_system
    # reference each other and one key cannot be declared until both exist.
    assert ("writing_system", "primary_language_id") in keys


def test_every_single_column_foreign_key_is_indexed_or_exempt():
    """A parent DELETE with no index on the child column is a sequential scan
    of the whole child table, per deleted row. Adding a foreign key must
    therefore come with a decision: index it, or say here why not."""
    keys = _single_column_foreign_keys(SCHEMA_SQL)
    indexed = _indexed_leading_columns(SCHEMA_SQL, INDEXES_SQL)
    missing = sorted(keys - indexed - FK_INDEX_EXEMPT)
    assert not missing, (
        "single-column foreign keys with no index leading on that column:\n  "
        + "\n  ".join(f"{t}.{c}" for t, c in missing)
        + "\nAdd one to 002_indexes.sql, or add it to FK_INDEX_EXEMPT with a "
          "reason recorded in that file."
    )


def test_the_exemptions_are_documented_where_they_are_declared():
    """An exemption list nobody can find the reasoning for is an oversight
    wearing a decision's clothes."""
    for table, column in FK_INDEX_EXEMPT:
        assert column in INDEXES_SQL, f"{table}.{column} exempt but not mentioned"
    assert "deliberately left unindexed" in INDEXES_SQL


def test_the_index_file_is_rerunnable():
    """002 is the migration path for indexes, so every statement in it has to
    be idempotent. 004 is not used for indexes: it runs BEFORE the COPY, and
    building them there reimposes the per-row maintenance cost that applying
    this file after the load exists to avoid."""
    plain = re.findall(r"^CREATE (?:UNIQUE )?INDEX (?!IF NOT EXISTS)", INDEXES_SQL,
                       re.MULTILINE)
    assert not plain, f"{len(plain)} non-idempotent CREATE INDEX statement(s)"


# ── D7, writing system populations and descendant counts ───────────────────

def test_d7_functions_are_replaceable():
    """Re-applying the file to a live database must not need a drop."""
    assert ("CREATE OR REPLACE FUNCTION rebuild_writing_system_populations"
            "(p_run_id uuid)") in DERIVE_SQL
    assert ("CREATE OR REPLACE FUNCTION rebuild_descendant_counts"
            "(p_run_id uuid)") in DERIVE_SQL


def test_d7_sees_curated_locales_only():
    """connectLocales runs at connectObjects.ts:36, BEFORE createFamilyLocales
    and createRegionalLocales on lines 41-42, so the 43,585 generated rows do
    not exist when the frontend accumulates populationUpperBound. Summing every
    locale instead roughly quintuples Latn and nothing raises.

    Written as NOT IN the two generated sources rather than = 'StableDatabase',
    because the frontend's rule is "whatever had been loaded by then": an IANA
    or census locale would count the day one is loaded."""
    body = DERIVE_CODE.split("rebuild_writing_system_populations")[1]
    body = body.split("rebuild_descendant_counts")[0]
    assert "createRegionalLocales" in body
    assert "createFamilyLocales" in body
    assert "NOT IN" in body


def test_d7_counts_a_locale_only_on_a_non_primary_script():
    """Otherwise the same speakers arrive twice: once through population_rough
    on the primary-script branch and once through the locale.

    IS DISTINCT FROM rather than <>, because the TypeScript compares with loose
    != against `undefined` - a language with NO primary script DOES contribute
    its locales, and <> would drop all of them on a NULL comparison."""
    body = DERIVE_CODE.split("rebuild_writing_system_populations")[1]
    body = body.split("rebuild_descendant_counts")[0]
    assert "l.primary_script_id IS DISTINCT FROM lo.script_id" in body


def test_d7_maps_a_zero_descendant_population_to_null():
    """`descendantPopulation || undefined`. 13 writing systems are the parent of
    something whose descendants all sum to zero, and a stored 0 there is
    indistinguishable from a script with no children at all."""
    body = DERIVE_CODE.split("rebuild_writing_system_populations")[1]
    body = body.split("rebuild_descendant_counts")[0]
    assert "NULLIF(b.bound, 0)" in body


def test_d7_does_not_null_the_upper_bound_of_a_primary_script():
    """The opposite rule to the one above, in the same function, which is why it
    is worth pinning separately. The TypeScript initialises populationUpperBound
    to 0 before adding, so a script that IS some language's primary one reads 0
    even when no such language has a figure. 125 scripts are set and only 88
    exceed zero; wrapping this sum in NULLIF too would erase that distinction."""
    body = DERIVE_CODE.split("rebuild_writing_system_populations")[1]
    body = body.split("rebuild_descendant_counts")[0]
    assert "SET population_upper_bound = b.bound" in body
    # Anchored on the second pass's own SQL, not on a comment: DERIVE_CODE has
    # had its comments stripped, so a prose marker would split nothing and the
    # assertion would silently cover the whole function.
    assert "NULLIF" not in body.split("WITH RECURSIVE descent")[0]


def test_d7_clears_both_columns_before_rebuilding():
    """The upper bound is accumulated, so a re-run against stale values would be
    cumulative rather than idempotent."""
    body = DERIVE_CODE.split("rebuild_writing_system_populations")[1]
    body = body.split("rebuild_descendant_counts")[0]
    reset = body.split("Pass 1")[0]
    assert "population_upper_bound    = NULL" in reset
    assert "population_of_descendants = NULL" in reset


def test_d7_counts_strict_descendants_only():
    """A node must not count itself. Without the filter every languoid reads one
    higher than it should, which is a uniform off-by-one that looks entirely
    plausible in a table."""
    body = DERIVE_CODE.split("rebuild_descendant_counts")[1]
    assert "depth > 0" in body
    ws = DERIVE_CODE.split("rebuild_writing_system_populations")[1]
    ws = ws.split("rebuild_descendant_counts")[0]
    assert "d.descendant_id <> d.ancestor_id" in ws


def test_d7_mirrors_the_combined_source_onto_language():
    """language.descendant_count mirrors the Combined row only, like every other
    mirrored column on that table, and is NULL where there is no Combined row -
    18,957 of 27,299 languoids, almost all Glottolog dialects. Those are not in
    the Combined tree at all, which is a different statement from having no
    descendants in it."""
    body = DERIVE_CODE.split("rebuild_descendant_counts")[1]
    assert "UPDATE language SET descendant_count = NULL;" in body
    assert "a.source      = 'Combined'" in body


def test_d7_baselines_attribute_rows_at_zero_not_null():
    """The opposite choice to the mirror above, in the same function. Every
    attribute row IS in its own source's tree - it just may have nothing beneath
    it - so 0 is the true answer and NULL would claim it was never counted."""
    body = DERIVE_CODE.split("rebuild_descendant_counts")[1]
    assert "UPDATE language_source_attribute SET descendant_count = 0;" in body


def test_descendant_count_lost_its_default_in_both_files():
    """FP-010. Both columns shipped as `int NOT NULL DEFAULT 0`, so they read as
    100% populated - 27,299 / 27,299 and 60,173 / 60,173 - while D7 had never
    run and every value was 0. Nothing could tell "no descendants" from "nobody
    counted", which is the exact failure mode derive.py raises
    DeriveStepNotImplemented to avoid, reintroduced one layer down.

    001 and 004 must agree, or a fresh install differs from a migrated one."""
    for table in ("language", "language_source_attribute"):
        assert re.search(
            rf"ALTER TABLE {table}\s+ALTER COLUMN descendant_count DROP DEFAULT;",
            ALTER_SQL,
        ), f"{table}.descendant_count still has its default in 004_alter.sql"
        assert re.search(
            rf"ALTER TABLE {table}\s+ALTER COLUMN descendant_count DROP NOT NULL;",
            ALTER_SQL,
        ), f"{table}.descendant_count is still NOT NULL in 004_alter.sql"
    assert "descendant_count int NOT NULL DEFAULT 0" not in SCHEMA_SQL
    assert "descendant_count           int NOT NULL DEFAULT 0" not in SCHEMA_SQL


def test_the_schema_records_why_not_null_is_unreachable():
    """FP-010 asked for NOT NULL once D7 filled the column. It is not reachable:
    004_alter.sql is applied BEFORE the COPY phase and no loader supplies
    descendant_count, so the column is legitimately NULL between the COPY and D7
    on every run. Someone will try to add it back, so the reason has to live in
    the file rather than only in the future-plan log."""
    assert "NOT NULL IS NOT REACHABLE" in ALTER_SQL
    assert "COPY" in ALTER_SQL


def test_d7_runs_after_d5_and_before_the_matview():
    """Neither half depends on D3 through D6 - the writing-system figures come
    from loaded columns and the counts from the D1 closure - so this pins the
    documented chain rather than a data dependency. It still has to precede D13,
    because a future check on territory_stats would read what D7 writes."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    regional = run_py.index("derive.rebuild_regional_locales(conn, run_id)")
    ws_pop = run_py.index("derive.rebuild_writing_system_populations(conn, run_id)")
    counts = run_py.index("derive.rebuild_descendant_counts(conn, run_id)")
    matview = run_py.index("derive.refresh_materialized_views(conn)")
    assert regional < ws_pop < counts < matview


# ── D8, the language population precedence chain ───────────────────────────

def test_d8_computes_descendants_and_estimate_in_one_pass():
    """The recursion returns a child's ESTIMATE, not its descendant sum, so a
    parent's descendant total is built from its children's finished estimates.
    Two separate passes over the tree give a different, entirely believable
    number - the mistake caught for D6. Both updates must sit inside the level
    loop, not after it."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_populations", 1)[1]
    body = fn.split("$$ LANGUAGE plpgsql;", 1)[0]
    loop = body.split("FOR d IN REVERSE", 1)[1].split("END LOOP", 1)[0]
    # Both the descendant sum and the estimate are computed per level.
    assert "s_desc = c.s" in loop
    assert "s_est = CASE" in loop


def test_d8_precedence_order_matches_the_frontend():
    """computeLanguagePopulationEstimate tries the World locale, then the rough
    languages.tsv figure, then the descendant sum. Reordering these silently
    changes which number a language reports."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_populations", 1)[1]
    body = fn.split("$$ LANGUAGE plpgsql;", 1)[0]
    locales = body.index("l.pop_speaking_from_locales > 0")
    rough = body.index("COALESCE(l.population_rough, 0) <> 0")
    desc = body.index("p.s_desc IS NOT NULL")
    assert locales < rough < desc


def test_d8_zero_falls_through_rather_than_being_selected():
    """Both guards are truthiness tests in the TypeScript: `fromLocales != null
    && > 0`, and `if (lang.pop.rough)`. A zero must fall THROUGH to the next
    branch. `IS NOT NULL` on either would stop the chain on a 0 and report it as
    a real population."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_populations", 1)[1]
    body = fn.split("$$ LANGUAGE plpgsql;", 1)[0]
    assert "l.pop_speaking_from_locales > 0" in body
    assert "l.pop_writing_from_locales > 0" in body
    assert "COALESCE(l.population_rough, 0) <> 0" in body
    # The descendant sums are NULLIF'd to 0 so that branch can use IS NOT NULL.
    assert "NULLIF(sum(COALESCE(cp.s_est, 0)), 0)" in body


def test_d8_speaking_and_writing_recurse_independently():
    """They cannot be derived from one another: fromLocales reads a different
    column and the rough figure takes a per-use modality discount. Collapsing
    them into one number and halving it would look plausible and be wrong."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_populations", 1)[1]
    body = fn.split("$$ LANGUAGE plpgsql;", 1)[0]
    assert "language_modality_discount(l.modality, 'speaking')" in body
    assert "language_modality_discount(l.modality, 'writing')" in body


def test_d8_overall_is_a_max_not_a_sum():
    """pop.overall is max(speaking, writing) - a person who both speaks and
    writes a language must not be counted twice. Same for the descendant
    total, per getObjectPopulationOfDescendants."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_populations", 1)[1]
    body = fn.split("$$ LANGUAGE plpgsql;", 1)[0]
    assert body.count("GREATEST(COALESCE(p.s_est, 0)") >= 1
    assert body.count("GREATEST(COALESCE(p.s_desc, 0)") >= 1
    assert "s_est + " not in body and "s_desc + " not in body


def test_d8_does_not_port_the_parent_discount():
    """Q1: a child larger than its parent is a source-data defect, not something
    to silently adjust. The frontend rewrites it to parent - 0.01 and restamps
    the source Algorithmic; we must do neither."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_populations", 1)[1]
    body = fn.split("$$ LANGUAGE plpgsql;", 1)[0]
    assert "0.01" not in body
    assert "Algorithmic" not in body


def test_d8_mirrors_combined_only():
    """`language` follows the Combined tree and nothing else, exactly as
    descendant_count does. Mirroring any source that happened to run last would
    make the column depend on call order."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_populations", 1)[1]
    body = fn.split("$$ LANGUAGE plpgsql;", 1)[0]
    assert "IF p_source = 'Combined' THEN" in body


def test_d8_runs_after_d5_and_the_locale_step_runs_first():
    """A language's estimate is usually its World locale, and those rows do not
    exist until D5 has run. Reversing this leaves most languoids on the rough
    languages.tsv figure - plausible, and wrong. Within D8, the World locale
    figures must be written before the tree is walked."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    regional = run_py.index("derive.rebuild_regional_locales(conn, run_id)")
    lang_pop = run_py.index("derive.rebuild_language_populations(conn, run_id)")
    matview = run_py.index("derive.refresh_materialized_views(conn)")
    assert regional < lang_pop < matview

    derive_py = (SCHEMA_DIR.parent / "etl" / "derive.py").read_text(encoding="utf-8")
    step = derive_py.split("def rebuild_language_populations", 1)[1]
    from_locales = step.index("rebuild_language_population_from_locales")
    walk = step.index("rebuild_language_populations(%s, 'Combined')")
    assert from_locales < walk


# ── D9, the largest descendant ─────────────────────────────────────────────

def d9_body() -> str:
    """The executable body of rebuild_largest_descendants, comments stripped."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_largest_descendants", 1)[1]
    return squeeze(fn.split("$$ LANGUAGE plpgsql;", 1)[0])


def test_d9_is_one_closure_scan_and_not_a_tree_walk():
    """The frontend recursion telescopes: getLargestDescendant(N) is argmax over
    N's strict descendants and nothing is clamped on the way up, so
    language_ancestry answers it in one grouped scan. D6 and D8 genuinely need
    their level loops because their sums ARE clamped per level, and someone
    generalising from those two would add a loop here that buys nothing.
    Recognising which case you are in is the whole finding."""
    body = d9_body()
    assert "language_ancestry" in body
    assert "FOR d IN REVERSE" not in body
    assert "LOOP" not in body


def test_d9_takes_strict_descendants_only():
    """language_ancestry carries depth-0 self rows so that "descendants of X"
    includes X. Without the depth filter every populated languoid would be its
    own largest descendant, which is not an error and reads as plausible."""
    assert "an.depth > 0" in d9_body()


def test_d9_falls_back_to_the_iso_then_glottolog_scope():
    """The frontend tests `specific.scope ?? lang.scope`, where the base is ISO's
    scope with Glottolog filling gaps. There is no language.scope column and
    language_source_attribute.scope is NULL for 8,227 of 8,342 Combined rows -
    only the 115 ISO 639-5 families carry one - so reading the raw column alone
    classifies 48 real families as candidates. Measured: 3 languoids change side
    and 2 ancestors (itd, ncq) stop naming a family. ISO must come first,
    because Glottolog only ever filled the gaps ISO left."""
    body = d9_body()
    coalesce = body.split("COALESCE(a.scope,", 1)[1].split(")", 1)[0]
    assert coalesce.index("iso.scope") < coalesce.index("glot.scope")
    assert "iso.source = 'ISO'" in body
    assert "glot.source = 'Glottolog'" in body


def test_d9_treats_an_unknown_scope_as_non_family():
    """`child.scope !== LanguageScope.Family` is true for undefined, so the 101
    Combined languoids with no scope under any source are legitimate candidates.
    `<> 5` evaluates to NULL against a NULL scope and drops every one of them
    silently - the same trap as D7's primary-script test."""
    body = d9_body()
    assert "e.scope IS DISTINCT FROM 5" in body
    assert "e.scope <> 5" not in body
    assert "e.scope != 5" not in body


def test_d9_requires_a_positive_population():
    """`(child.pop.overall || 0) > 0` rejects a zero and an absent value alike.
    IS NOT NULL here would admit languoids D8 gave an explicit 0."""
    assert "e.population_estimate > 0" in d9_body()


def test_d9_clears_the_column_before_writing():
    """computeLargestDescendant.ts:10-12 clears every answer first, and the
    UPDATE below only touches ancestors that HAVE one. Without the clear, a
    languoid that stops qualifying keeps a stale answer across runs and the
    step is no longer idempotent."""
    body = d9_body()
    clear = body.index("SET largest_descendant_id = NULL WHERE source = p_source")
    write = body.index("SET largest_descendant_id = r.language_id")
    assert clear < write


def test_d9_tie_break_is_deterministic():
    """12 of the 232 answered ancestors have descendants tied at the maximum -
    zap has seven at 10,000. The TypeScript resolves those by childLanguages
    array order, which is TSV load order and cannot be reproduced here. Any
    non-deterministic ordering would make the step fail its own idempotency
    check on those 12 rows rather than merely differ from the site."""
    order = d9_body().split("ORDER BY e.population_estimate DESC,", 1)[1]
    order = order.split(")", 1)[0]
    assert order.index("an.depth") < order.index("e.language_id")


def test_d9_mirrors_combined_only():
    """`language` follows the Combined tree and nothing else, exactly as
    descendant_count and the D8 estimates do."""
    assert "IF p_source = 'Combined' THEN" in d9_body()


def test_d9_records_why_the_recursion_limit_needs_no_port():
    """RECURSION_LIMIT = 30 has no analogue here, and "we left it out" is not a
    reason anyone can check. The measured depths are what make it unreachable,
    and they belong beside the function - a later reader who finds a deeper tree
    needs to know the limit was considered and why it did not matter."""
    preamble = DERIVE_SQL.split("FUNCTION rebuild_largest_descendants", 1)[0]
    preamble = preamble.rsplit("-- ── D9", 1)[1]
    assert "RECURSION_LIMIT" in preamble
    assert "26" in preamble


def test_d9_runs_after_d8_and_before_the_matview():
    """D9 ranks descendants by the estimates D8 writes. Running it earlier gives
    every ancestor a NULL answer, which is indistinguishable from the step never
    having run - the exact failure DeriveStepNotImplemented exists to prevent,
    reintroduced by call order."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    lang_pop = run_py.index("derive.rebuild_language_populations(conn, run_id)")
    largest = run_py.index("derive.rebuild_largest_descendants(conn, run_id)")
    matview = run_py.index("derive.refresh_materialized_views(conn)")
    assert lang_pop < largest < matview


def test_the_deferred_d9_source_pass_says_it_is_blocked_not_just_deferred():
    """Every other deferral in this dict is a choice. This one is not: D9 ranks
    by language_source_attribute.population_estimate, and D8 has only filled it
    for Combined, so widening the call site alone would write NULL everywhere
    and look exactly like a step that had never run."""
    reason = derive.NOT_IMPLEMENTED["largest_descendant_per_source"]
    assert "BLOCKED" in reason
    assert "population_estimate" in reason
    assert "Widen D8 first" in reason


# ── D10, depth ─────────────────────────────────────────────────────────────

def d10_depth_body() -> str:
    """The executable body of rebuild_language_depth, comments stripped."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_depth", 1)[1]
    return squeeze(fn.split("$$ LANGUAGE plpgsql;", 1)[0])


def test_d10_depth_is_one_grouped_scan_and_not_a_walk():
    """Every source's parent graph is a tree, so a node's deepest entry in the
    D1 closure IS its distance to the root. A level loop would recompute what
    the closure already holds. This is the third distinct reason a derive step
    has avoided a walk - D7 because its inputs were flat, D9 because its
    recursion telescoped, this one because the answer is materialised - and
    they are not interchangeable, which is why each is asserted separately."""
    body = d10_depth_body()
    assert "language_ancestry" in body
    assert "max(depth)" in body
    assert "LOOP" not in body


def test_d10_depth_clears_before_writing():
    """A row the closure can no longer answer for must lose its depth rather
    than keep a stale one. Today the second statement refills every row, so
    without the clear this would still look right - which is exactly why it is
    pinned rather than left to be noticed."""
    body = d10_depth_body()
    clear = body.index("SET depth = NULL")
    write = body.index("SET depth = d.depth")
    assert clear < write


def test_d10_depth_covers_every_source():
    """Unlike D8 and D9 this is not restricted to Combined. Depth depends on D1
    alone, so a source filter here would be a limitation invented rather than
    inherited - and it would leave 51,831 rows NULL, indistinguishable from a
    step that never ran."""
    body = d10_depth_body()
    assert "GROUP BY source, descendant_id" in body
    assert "'Combined'" not in body


def test_d10_depth_records_why_the_tree_assumption_holds():
    """max() over the closure equals root distance only because each source is
    a tree. That is a measurement, not a property of the schema - the closure
    table is built to tolerate a DAG and takes MIN(depth) when it finds one.
    A later reader who adds a second parent edge needs to find the reasoning
    here rather than re-derive it from a wrong number."""
    preamble = DERIVE_SQL.split("FUNCTION rebuild_language_depth", 1)[0]
    preamble = preamble.rsplit("-- ── D10  Depth", 1)[1]
    assert "TREE" in preamble
    assert "MIN(depth)" in preamble


# ── D10, the vitality rollup and coordinates ───────────────────────────────

def d10_body() -> str:
    """The executable body of rebuild_recursive_language_data."""
    fn = DERIVE_CODE.split("FUNCTION rebuild_recursive_language_data", 1)[1]
    return squeeze(fn.split("$$ LANGUAGE plpgsql;", 1)[0])


def test_d10_walks_levels_deepest_first():
    """maxBy is taken over a child's ALREADY COMPUTED vitality, so every child
    must be final before its parent reads it. Ascending order gives each
    ancestor the values from the level below only, which is a plausible answer
    on a shallow tree and wrong on a deep one."""
    assert "FOR d IN REVERSE max_depth..0 LOOP" in d10_body()


def test_d10_does_not_telescope_into_a_closure_scan():
    """The distinction that decides the algorithm, and the fourth step where it
    has mattered. D9 could drop its loop because nothing blocked a value on the
    way up. Here a declared vitality STOPS the values beneath it, so an
    ancestor's answer is the maximum over the NEAREST declared descendants, not
    over all of them. A closure scan would let a vigorous dialect outvote the
    extinct language it sits under."""
    body = d10_body()
    assert "LOOP" in body
    # The closure is read to establish depth, never to aggregate vitality.
    vitality = body.split("SET vitality_iso = COALESCE", 1)[1].split("END LOOP", 1)[0]
    assert "language_ancestry" not in vitality


def test_d10_declared_vitality_is_never_overwritten():
    """`if (lang.ISO.status != null) vitality.iso = lang.ISO.status; else
    maxBy(...)`. COALESCE(existing, inherited) is that branch. Reversing the
    arguments raises every extinct language to the vitality of its living
    dialects, with no error and a completely believable result."""
    body = d10_body()
    for column in ("vitality_iso", "vitality_eth_fine", "vitality_eth_coarse"):
        assert f"{column} = COALESCE(l.{column}," in body


def test_d10_seeds_the_declared_iso_status_before_the_loop():
    """The COALESCE above only protects a value that is already there. The seed
    is what puts it there, and it has to happen before the first level."""
    body = d10_body()
    seed = body.index("SET vitality_iso = iso_status")
    loop = body.index("FOR d IN REVERSE")
    assert seed < loop


def test_d10_never_writes_back_over_the_declared_iso_status():
    """language.iso_status is what iso-639-3.tab declares; vitality_iso is what
    the recursion computes. VitalityExplanation.tsx:30 reads the declared one to
    decide whether to label the figure on screen "Derived", so writing the
    rollup back over it makes every inherited value claim to be declared."""
    body = d10_body()
    assert "SET vitality_iso" in body
    assert "SET iso_status" not in body
    assert "iso_status =" not in body.replace("SET vitality_iso = iso_status", "")


def test_d10_inherits_with_max_not_greatest():
    """maxBy (setUtils.ts:60-67) skips NULL children and returns undefined when
    every child is NULL. SQL max() has exactly that contract. GREATEST takes a
    fixed argument list and cannot aggregate over a variable child count."""
    body = d10_body()
    assert "max(cl.vitality_iso)" in body
    assert "GREATEST" not in body


def test_d10_metascore_matches_the_frontend_precedence():
    """getVitalityMetascore: both Ethnologue scales means their average, then
    fine, then coarse, then ISO. Any other order changes the score for the
    languoids where the scales disagree, which is the only case that matters."""
    meta = d10_body().split("SET vitality_meta = CASE", 1)[1].split(" END", 1)[0]
    both = meta.index("vitality_eth_fine IS NOT NULL AND vitality_eth_coarse")
    fine = meta.index("WHEN vitality_eth_fine IS NOT NULL THEN")
    coarse = meta.index("WHEN vitality_eth_coarse IS NOT NULL THEN")
    iso = meta.index("ELSE vitality_iso")
    assert both < fine < coarse < iso


def test_d10_metascore_average_is_not_integer_division():
    """(ethFine + ethCoarse) / 2 produces 5.5, which the frontend's own test
    asserts and VitalityStrings.ts:19 renders with toFixed(1). `/ 2` on two
    smallints is integer division and would round it away without an error -
    the reason the column is numeric rather than smallint."""
    meta = d10_body().split("SET vitality_meta = CASE", 1)[1].split(" END", 1)[0]
    assert "/ 2.0" in meta
    assert "/ 2 " not in meta


def test_d10_metascore_column_can_hold_a_half_and_a_special_code():
    """Two independent bounds, both of which the shipped column violated.
    numeric because the average is fractional; -1 because
    LanguageISOStatus.SpecialCode is -1 and the metascore falls through to the
    ISO scale whenever neither Ethnologue value exists, which is currently
    every languoid."""
    declaration = re.search(
        r"vitality_meta\s+(\S+)\s+CHECK \(vitality_meta BETWEEN (-?\d+) AND 9\)",
        SCHEMA_SQL)
    assert declaration is not None, "vitality_meta declaration not found in 001"
    assert declaration.group(1) == "numeric(3,1)"
    assert declaration.group(2) == "-1"


def test_d10_metascore_type_change_is_guarded_against_a_rewrite():
    """004 is applied on every load and ALTER COLUMN TYPE rewrites the whole
    table. The guard is what makes re-applying it free rather than merely
    harmless."""
    block = ALTER_SQL.split("vitality_meta shipped as", 1)[1]
    assert "data_type <> 'numeric'" in block
    assert "ALTER COLUMN vitality_meta TYPE numeric(3,1)" in block


# ── D10, the coordinate fill ───────────────────────────────────────────────

def test_d10_clears_coordinates_only_where_it_wrote_them():
    """THE ONE THAT DESTROYS DATA. D7, D8 and D9 all clear their whole target
    column before rebuilding, which is right for a purely derived column.
    latitude is not one: Glottolog loads 8,907 positions and 1,137 of those
    languoids have no Combined row, so an unqualified reset deletes them and
    the run still reports success, because nothing counts a column going down.
    coords_source is the discriminator and it exists for this."""
    body = d10_body()
    clear = body.split("SET latitude = NULL, longitude = NULL", 1)[1]
    clear = clear.split(";", 1)[0]
    assert "WHERE coords_source = p_source" in clear


def test_d10_stamps_the_provenance_of_a_derived_position():
    """Without the stamp the next run cannot tell its own output from
    Glottolog's input, and the clear above has nothing to key on."""
    fill = d10_body().split("SET latitude = ROUND", 1)[1]
    assert "coords_source = p_source" in fill.split("FROM (", 1)[0]


def test_d10_coordinates_use_the_fourth_root_of_population():
    """averageCoordinates weights by population ** 0.25. A linear weight puts
    the centre of a family on top of its largest member, which is a plausible
    position and the wrong one."""
    assert "0.25)" in d10_body()


def test_d10_coordinates_are_averaged_in_three_dimensions():
    """Positions are converted to Cartesian, averaged, and converted back with
    atan2. A mean of the degrees puts the centre of a family spanning the date
    line in the middle of Asia."""
    body = d10_body()
    for fn in ("cos(radians(", "sin(radians(", "atan2(", "sqrt("):
        assert fn in body


def test_d10_coordinates_skip_children_with_no_position_or_no_weight():
    """averageCoordinates.ts:18-21 filters to children that have a position AND
    a weight above zero. Including a child at NULL latitude makes the whole sum
    NULL and silently removes the parent from the result entirely."""
    fill = d10_body().split("SET latitude = ROUND", 1)[1]
    assert "cl.latitude IS NOT NULL" in fill
    assert "cl.longitude IS NOT NULL" in fill
    assert "cs.population_estimate > 0" in fill


def test_d10_fills_a_position_only_where_one_is_missing():
    """`if (lat != null && long != null) return;` - so the write happens when
    EITHER is missing. AND here would leave a half-populated position broken
    forever, and half a position is worse than none: it plots."""
    fill = d10_body().split("SET latitude = ROUND", 1)[1]
    guard = fill.split("AND n.depth = d", 1)[1].split(";", 1)[0]
    assert "l.latitude IS NULL OR l.longitude IS NULL" in guard


def test_d10_writes_every_languoid_not_only_the_combined_ones():
    """The opposite of the D7/D8/D9 mirror rule, and deliberate.
    computeRecursiveLanguageData iterates the whole language dictionary, so a
    languoid outside the Combined tree is a root with no children that keeps
    its own declared vitality. Restricting the write would differ from the
    frontend on the one languoid holding an iso_status and no Combined row."""
    assert "IF p_source = 'Combined' THEN" not in d10_body()


def test_d10_recomputes_depth_rather_than_reading_the_column():
    """The two halves of D10 are separate functions, and this one must not
    depend on the other having run. A NULL depth would COALESCE to 0, collapse
    the loop to a single level and produce a complete-looking result with no
    rollup in it - the failure DeriveStepNotImplemented exists to prevent,
    reintroduced through call order."""
    node_table = d10_body().split("CREATE TEMP TABLE _rl_node", 1)[1]
    node_table = node_table.split(";", 1)[0]
    assert "max(a.depth) FROM language_ancestry a" in node_table


def test_d10_runs_after_d8_and_before_the_matview():
    """The coordinate average weights each child by its D8 population, so
    running this earlier drops every child from its parent's average and leaves
    the grouping nodes where Glottolog put them - fewer positions, no error."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    lang_pop = run_py.index("derive.rebuild_language_populations(conn, run_id)")
    depth = run_py.index("derive.rebuild_language_depth(conn, run_id)")
    recursive = run_py.index("derive.rebuild_recursive_language_data(conn, run_id)")
    matview = run_py.index("derive.refresh_materialized_views(conn)")
    assert lang_pop < depth < recursive < matview


def test_the_deferred_digital_support_says_it_is_a_load_gap():
    """The third output of computeRecursiveLanguageData, and the reason it is
    not here is not that it is hard. Three of its five dimensions read files
    with no destination table, so a partial implementation would average two
    real scores against three permanent zeroes and publish a number that is
    wrong by construction for every language."""
    reason = derive.NOT_IMPLEMENTED["language_digital_support_scores"]
    assert "gtranslate.tsv" in reason
    assert "note_unmapped" in reason


def test_the_deferred_d10_source_pass_needs_columns_not_a_call_site():
    """Unlike D8's and D9's deferrals this one is not a call-site change: the
    vitality columns live on `language`, which mirrors Combined by design, so
    language_source_attribute needs its own set first. Someone reading the
    other two entries would reasonably assume otherwise."""
    reason = derive.NOT_IMPLEMENTED["recursive_language_data_per_source"]
    assert "language_source_attribute" in reason
    assert "Depth is already done for every source" in reason


# ── D10, the Ethnologue vitality mapping ───────────────────────────────────

def test_ethnologue_2012_scale_is_inverted_from_the_file():
    """EGIDS numbers a HEALTHIER language LOWER, and vitality_eth_fine is 0-9
    with 9 healthiest. Reading the file's numbers straight through inverts
    every vitality in the dataset and produces a complete, plausible, exactly
    backwards answer - which D10 then propagates up the family tree."""
    assert vocab.ETHNOLOGUE_VITALITY_2012["1"] == 9
    assert vocab.ETHNOLOGUE_VITALITY_2012["10"] == 0
    assert vocab.ETHNOLOGUE_VITALITY_2012["national"] == 9
    assert vocab.ETHNOLOGUE_VITALITY_2012["extinct"] == 0


def test_ethnologue_2012_merged_buckets_match_the_frontend():
    """parseVitalityEthnologue2012 merges Vigorous with Threatened and Moribund
    with Nearly Extinct, and the fractional keys are how the Digital Language
    Death republication spells those. Dropping them loses real rows silently."""
    for spelling, value in (("vigorous", 4), ("threatened", 4), ("6.5", 4),
                            ("moribund", 2), ("nearly extinct", 2), ("8.5", 2)):
        assert vocab.ETHNOLOGUE_VITALITY_2012[spelling] == value


def test_ethnologue_2025_scale_matches_the_coarse_lookup_table():
    """vitality_eth_coarse is a foreign key, so an unlisted id fails the load
    rather than storing a wrong vitality. These four are the whole domain."""
    assert vocab.ETHNOLOGUE_VITALITY_2025 == {
        "institutional": 9, "stable": 6, "endangered": 3, "extinct": 0,
    }


def test_the_not_in_dataset_marker_maps_to_nothing_without_warning():
    """'7.7' marks rows that are not in the Ethnologue dataset at all.
    VitalityParsing.ts:56-57 returns undefined for it WITHOUT logging, unlike
    every other unrecognised value, so warning here would turn a documented
    marker into thousands of findings the day the file arrives."""
    assert authorities.ETH_2012_NOT_IN_DATASET == "7.7"
    assert "7.7" not in vocab.ETHNOLOGUE_VITALITY_2012


def test_an_unrecognised_vitality_is_warned_about_and_dropped():
    """The scales are ordinal and D10 takes a maximum over them, so a guessed
    value does not stay local: it propagates up the family tree and raises
    every ancestor with it."""
    ds = registry.Dataset()
    assert authorities._eth_vitality(ds, "xyz", "Flourishing",
                                     vocab.ETHNOLOGUE_VITALITY_2025) is None
    assert len(ds.findings) == 1
    assert ds.findings[0].severity == "warning"
    # The documented marker and an empty cell are both silent.
    assert authorities._eth_vitality(ds, "xyz", "7.7",
                                     vocab.ETHNOLOGUE_VITALITY_2012) is None
    assert authorities._eth_vitality(ds, "xyz", "",
                                     vocab.ETHNOLOGUE_VITALITY_2012) is None
    assert authorities._eth_vitality(ds, "xyz", None,
                                     vocab.ETHNOLOGUE_VITALITY_2012) is None
    assert len(ds.findings) == 1


def test_the_ethnologue_vitality_columns_are_actually_assigned():
    """Both columns existed in the schema with no assignment anywhere in the
    ETL, so they would have stayed empty even once the header-only files gained
    rows - and D10 would have looked like the broken step. A gap in the loader
    and a gap in the data are indistinguishable once both are zero."""
    source = (SCHEMA_DIR.parent / "etl" / "loaders" / "authorities.py").read_text(
        encoding="utf-8")
    assert "eth_vitality_2012=_eth_vitality" in source
    assert "eth_vitality_2025=_eth_vitality" in source


# ── D11, family modality ───────────────────────────────────────────────────

def d11_body() -> str:
    """The executable body of rebuild_language_modality, comments stripped.

    Bounded at BOTH ends. D6's extraction ran to the end of the file and
    quietly counted every function written after it as its own (§9.11 #8);
    this one is the last function in the file today, which is exactly the
    position where an unbounded split keeps working until it does not.
    """
    fn = DERIVE_CODE.split("FUNCTION rebuild_language_modality", 1)[1]
    return squeeze(fn.split("$$ LANGUAGE plpgsql;", 1)[0])


def d11_preamble() -> str:
    """The comment block above the function, which is where the measurements
    that justify its shape are recorded."""
    preamble = DERIVE_SQL.split("FUNCTION rebuild_language_modality", 1)[0]
    return preamble.rsplit("D11  computeLanguageFamiliesModality", 1)[1]


def test_d11_is_no_longer_declared_unimplemented():
    """D11 for the Combined tree. What remains declared is the per-source pass,
    which is a different and much weaker claim - see the last test below."""
    assert "family_modality" not in derive.NOT_IMPLEMENTED
    assert "family_modality_per_source" in derive.NOT_IMPLEMENTED


def test_d11_walks_levels_deepest_first():
    """determineCombinedModality averages the children's ALREADY COMPUTED
    modality, so every child must be final before its parent reads it. 28 of
    the 82 derived answers read a child that was itself derived, and 12 have no
    declared-modality child at all - so a single pass loses those 12 and moves
    16 more, with no error anywhere."""
    assert "FOR d IN REVERSE max_depth..0 LOOP" in d11_body()


def test_d11_does_not_telescope_into_a_closure_scan():
    """Fifth step to need this question asked from scratch, and the answer has
    gone both ways often enough that the previous step's is worth nothing as a
    prior. This one lands with D6, D8 and D10's vitality: the average is over a
    child's computed value, so the level loop is the algorithm rather than a
    slower way to write one statement."""
    body = d11_body()
    assert "LOOP" in body
    # The closure is read to establish depth, never to aggregate modality.
    rollup = body.split("FOR d IN REVERSE", 1)[1]
    assert "language_ancestry" not in rollup


def test_d11_seeds_the_declared_modality_and_never_overwrites_it():
    """`if (lang.modality != null) return lang.modality`. The seed copies the
    declared value in, and the loop's `a.modality IS NULL` is the branch that
    respects it. Without the guard a family of loud children would rewrite the
    value languages.tsv states outright."""
    body = d11_body()
    seed = body.index("SET modality = l.modality")
    loop = body.index("FOR d IN REVERSE")
    assert seed < loop
    assert "AND a.modality IS NULL" in body


def test_d11_never_writes_the_declared_column():
    """Two independent reasons, either sufficient. language.modality holds the
    946 values loaded from languages.tsv, so an unqualified rebuild there
    destroys loaded data (§9.12 #1). And language_modality_discount() reads
    that column when D8 estimates from a rough population, so writing derived
    values back into it closes a cycle between two derive steps."""
    body = d11_body()
    assert "UPDATE language " not in body
    assert "UPDATE language_source_attribute a SET modality" in body


def test_d11_falls_back_to_the_iso_then_glottolog_scope():
    """FP-016 again. lsa.scope is NULL for every Combined row that is not one
    of the 115 ISO 639-5 families, so the raw column finds 0 dialects where the
    frontend sees 40. Same reconstruction as D9, same order: the load-time base
    is ISO's scope with Glottolog filling the gaps."""
    body = d11_body()
    assert "COALESCE(a.scope, iso.scope, glot.scope)" in body
    assert "iso.source = 'ISO'" in body
    assert "glot.source = 'Glottolog'" in body


def test_d11_treats_an_unknown_scope_as_non_dialect():
    """`lang.scope === LanguageScope.Dialect` is FALSE for undefined, so the
    101 Combined languoids with no scope under any source are ordinary nodes.
    `<>` evaluates to NULL against them and drops every one silently. Third
    occurrence of this after §9.10 #7 and §9.11 #7."""
    body = d11_body()
    assert "n.scope IS DISTINCT FROM 2" in body
    assert "n.scope <> 2" not in body


def test_d11_records_that_the_dialect_guard_is_node_level():
    """The TypeScript returns before recursing, so it skips the dialect AND its
    whole subtree; the SQL guard skips the node alone. Equivalent only while no
    dialect has children, which is measured and asserted in verify() rather
    than assumed here. A reader needs to find that condition next to the guard,
    not discover it from a wrong number."""
    preamble = d11_preamble()
    assert "no-op today" in preamble
    assert "WHOLE SUBTREE" in preamble


def test_d11_all_children_agreeing_never_consults_population():
    """`langs.every(l => l.modality === langs[0].modality)` returns that value
    before any arithmetic happens, so a family of unpopulated sign languages
    still derives to Sign. Routing it through the weighted average instead
    would divide by zero and give Spoken & Written for all of them."""
    body = d11_body()
    agree = body.index("WHEN c.with_modality = c.kids AND c.lo = c.hi THEN c.lo")
    weighted = body.index("WHEN c.weighted / c.total_pop >= 2.5")
    assert agree < weighted


def test_d11_every_child_undefined_stays_undefined():
    """The same `every(...)` branch, where the shared value is undefined. NULL,
    not 0: SpokenAndWritten is a real modality and writing it here would claim
    knowledge nobody has, on a column the UI filters by."""
    assert "WHEN c.with_modality = 0 THEN NULL" in d11_body()


def test_d11_excludes_children_with_no_modality_from_the_average():
    """totalPop sums only the children that HAVE a modality, and the numerator
    multiplies the others by `lang.modality ?? 0` - the same thing said less
    directly. Including them in the denominator would drag every mixed family
    toward Spoken & Written in proportion to how little is known about it."""
    assert (
        "sum(CASE WHEN ca.modality IS NOT NULL "
        "THEN COALESCE(cn.population_estimate, 0) ELSE 0 END)::numeric AS total_pop"
    ) in d11_body()


def test_d11_zero_total_population_gives_spoken_and_written():
    """The frontend divides by zero exactly once, on sio Siouan, whose only
    modality-bearing child has no population. `pop / 0` is NaN, NaN fails all
    five threshold comparisons in turn, and the function falls out of the
    bottom and returns SpokenAndWritten. Postgres raises instead, so this is
    the one branch that has to be written down rather than inherited."""
    assert "WHEN c.total_pop = 0 THEN 0" in d11_body()
    preamble = d11_preamble()
    assert "NaN" in preamble
    assert "sio" in preamble


def test_d11_thresholds_match_the_frontend_exactly():
    """Five comparisons, asymmetric on purpose: >= on the spoken side, <= on
    the written side, and SpokenAndWritten as the fall-through rather than as a
    band of its own. Tidying that into evenly spaced bands moves every family
    scoring between -0.5 and 0.5."""
    body = d11_body()
    for threshold, result in (("2.5", "3"), ("1.5", "2"), ("0.5", "1")):
        assert f"WHEN c.weighted / c.total_pop >= {threshold} THEN {result}" in body
    for threshold, result in (("-1.5", "-2"), ("-0.5", "-1")):
        assert f"WHEN c.weighted / c.total_pop <= {threshold} THEN {result}" in body
    assert "ELSE 0 END END" in body


def test_d11_arithmetic_is_numeric_not_floating_point():
    """The scores are compared against fixed thresholds and the tightest call
    in the dataset - tbq, 0.027 below the 0.5 boundary - is far too wide for
    float error to flip. numeric is used anyway because the idempotency check
    is an md5 over the written column, and floating-point summation order makes
    that fail intermittently rather than never (§9.11 #5)."""
    body = d11_body()
    assert "::numeric AS weighted" in body
    assert "::numeric AS total_pop" in body
    assert "double precision" not in body


def test_d11_writes_one_source_and_the_call_site_passes_combined():
    """Both halves matter. The function must not write outside p_source, and
    the caller must ask for Combined - the only tree the frontend can produce
    an answer for."""
    body = d11_body()
    assert "a.source = p_source" in body
    assert "'Combined'" not in body
    derive_py = (SCHEMA_DIR.parent / "etl" / "derive.py").read_text(encoding="utf-8")
    assert "rebuild_language_modality(%s, 'Combined')" in derive_py


def test_d11_records_why_the_recursion_limit_needs_no_port():
    """`depth > 30` warns and returns undefined WITHOUT assigning, so a tree
    that reached it would leave the node and everything above it uncomputed.
    Measured maximum depth in the Combined tree is 5. The level loop has no
    such bound, and a reader needs to find that measurement here rather than
    wonder what happened to the guard."""
    preamble = d11_preamble()
    assert "depth > 30" in preamble
    assert "depth in the Combined tree is 5" in preamble


def test_d11_runs_after_d10_and_before_the_matview():
    """The weights are D8's population estimates, so anything earlier than D8
    leaves every mixed family with a zero denominator and derives Spoken &
    Written for all of them - a plausible answer, and a wrong one. Its position
    relative to D9 and D10 is documentation: nothing reads what it writes."""
    run_py = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")
    lang_pop = run_py.index("derive.rebuild_language_populations(conn, run_id)")
    recursive = run_py.index("derive.rebuild_recursive_language_data(conn, run_id)")
    modality = run_py.index("derive.rebuild_language_modality(conn, run_id)")
    matview = run_py.index("derive.refresh_materialized_views(conn)")
    assert lang_pop < recursive < modality < matview


def test_the_deferred_d11_source_pass_says_there_is_nothing_to_port():
    """A weaker claim than D9's block or D10's deferral, and the difference is
    the point. computeLanguageFamiliesModality traverses
    lang.Combined.childLanguages unconditionally even though it is handed
    languagesInSelectedSource, so the live site has no per-source answer. This
    one needs a decision from the maintainers before it needs code."""
    reason = derive.NOT_IMPLEMENTED["family_modality_per_source"]
    assert "NO FRONTEND SEMANTICS TO PORT" in reason
    assert "lang.Combined.childLanguages" in reason

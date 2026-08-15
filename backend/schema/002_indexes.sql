-- ===========================================================================
--  PART 2 of 2 - indexes.
--
--  Apply AFTER the bulk COPY has finished. Building indexes on populated
--  tables is far faster than maintaining them during the load, and the
--  planner statistics gathered by the trailing ANALYZE are then accurate.
--
--  Apply with:  psql -d langnav -f backend/schema/002_indexes.sql
--          or:  python -m etl.run --indexes
--
--  EVERY STATEMENT HERE IS `IF NOT EXISTS`, so this file is re-runnable and is
--  therefore the migration path for indexes: an index added here reaches an
--  existing database by re-running --indexes, without touching 004_alter.sql.
--  004 is not used for indexes, because it runs BEFORE the COPY and building
--  them there would reimpose exactly the per-row maintenance cost this file
--  exists to avoid. The single exception is documented at lsa_cldr_provider_idx.
--
--  CAVEAT of IF NOT EXISTS: it matches on NAME only. Changing an existing
--  index's DEFINITION requires a new name, or an explicit DROP first. A silent
--  no-op is the failure mode to watch for.
-- ===========================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
--  §11  INDEXES
-- ═══════════════════════════════════════════════════════════════════════════
--  Every index below traces to a specific query pattern in the application.
--  For bulk loading, run everything above this line, COPY the data, THEN run
--  this section.
--
--  NULLS LAST WARNING: `ORDER BY x DESC NULLS LAST` will NOT use an index
--  declared plain DESC (which defaults to NULLS FIRST). The frontend sorts
--  nulls last unconditionally, so the indexes must match. Verify with EXPLAIN.

-- ── Tier 1: required for the app to be usable ──────────────────────────────

-- P1 autocomplete - the hottest query in the system.
CREATE INDEX IF NOT EXISTS entity_name_type_tsv_gin
  ON entity_name USING gin (entity_type, name_tsv);

-- P1 per-source name search (SearchableField.NameISO / NameCLDR / …).
CREATE INDEX IF NOT EXISTS lsa_name_tsv_gin
  ON language_source_attribute USING gin (source, name_tsv);

-- P1 code lookup: "what is 'tam'?"
CREATE INDEX IF NOT EXISTS lsa_source_code_idx
  ON language_source_attribute (source, code);

-- P2 main list query: the mandatory source join plus its commonest filter.
CREATE INDEX IF NOT EXISTS lsa_source_scope_idx
  ON language_source_attribute (source, scope, language_id);

-- P2 the dominant sort.
CREATE INDEX IF NOT EXISTS language_population_idx
  ON language (population_estimate DESC NULLS LAST);

-- ⭐ P4 - the two most valuable indexes in the schema. These answer the
-- product's headline question in both directions. INCLUDE makes them covering,
-- so the common LIMIT 20 case never touches the heap.
CREATE INDEX IF NOT EXISTS locale_by_territory_pop_idx
  ON locale (territory_id, pop_speaking_adjusted DESC NULLS LAST)
  INCLUDE (language_id, pop_speaking_percent, official_status);

CREATE INDEX IF NOT EXISTS locale_by_language_pop_idx
  ON locale (language_id, pop_speaking_adjusted DESC NULLS LAST)
  INCLUDE (territory_id, pop_speaking_percent, official_status);

-- P2/P5 hierarchy. Both directions: descendants for filtering, ancestors for
-- breadcrumbs (src/widgets/pathnav/).
CREATE INDEX IF NOT EXISTS language_ancestry_desc_idx
  ON language_ancestry (source, ancestor_id, depth);
CREATE INDEX IF NOT EXISTS language_ancestry_anc_idx
  ON language_ancestry (source, descendant_id, depth);
CREATE INDEX IF NOT EXISTS territory_ancestry_desc_idx
  ON territory_ancestry (hierarchy, ancestor_id, depth);
CREATE INDEX IF NOT EXISTS territory_ancestry_anc_idx
  ON territory_ancestry (hierarchy, descendant_id, depth);

-- ── Tier 2: foreign keys ───────────────────────────────────────────────────
-- Postgres indexes PRIMARY KEY and UNIQUE automatically, but NOT foreign keys.
-- Every JOIN and every ON DELETE CASCADE scans these.

CREATE INDEX IF NOT EXISTS locale_language_id_idx      ON locale (language_id);
CREATE INDEX IF NOT EXISTS locale_territory_id_idx     ON locale (territory_id);
CREATE INDEX IF NOT EXISTS locale_script_id_idx        ON locale (script_id);
CREATE INDEX IF NOT EXISTS locale_census_id_idx        ON locale (pop_speaking_census_id);
CREATE INDEX IF NOT EXISTS lsa_parent_idx              ON language_source_attribute (parent_language_id);
CREATE INDEX IF NOT EXISTS language_primary_script_idx ON language (primary_script_id);
CREATE INDEX IF NOT EXISTS language_largest_desc_idx   ON language (largest_descendant_id);
CREATE INDEX IF NOT EXISTS territory_contained_idx     ON territory (contained_un_region_id);
CREATE INDEX IF NOT EXISTS territory_sovereign_idx     ON territory (sovereign_id);
CREATE INDEX IF NOT EXISTS census_territory_idx        ON census (territory_id);
CREATE INDEX IF NOT EXISTS census_collector_idx        ON census (collector_org_id);
CREATE INDEX IF NOT EXISTS cle_language_idx            ON census_language_estimate (language_id);
CREATE INDEX IF NOT EXISTS keyboard_language_lang_idx  ON keyboard_language (language_id);
CREATE INDEX IF NOT EXISTS kb_input_script_idx         ON keyboard (input_script_id);
CREATE INDEX IF NOT EXISTS kb_output_script_idx        ON keyboard (output_script_id);
CREATE INDEX IF NOT EXISTS ws_parent_idx               ON writing_system (parent_writing_system_id);
CREATE INDEX IF NOT EXISTS org_parent_idx              ON organization (parent_id);
CREATE INDEX IF NOT EXISTS lca_language_idx            ON language_code_alias (language_id);
CREATE INDEX IF NOT EXISTS udhr_language_idx           ON language_udhr (language_id);
CREATE INDEX IF NOT EXISTS wikipedia_language_idx      ON wikipedia_edition (language_id);
CREATE INDEX IF NOT EXISTS wikipedia_locale_idx        ON wikipedia_edition (locale_id);
CREATE INDEX IF NOT EXISTS dqf_entity_idx              ON data_quality_finding (entity_id);
CREATE INDEX IF NOT EXISTS dqf_run_idx                 ON data_quality_finding (run_id, severity);

-- Added 2026-08-05 for D5, and it is worth more than its size suggests.
--
-- Deleting a row from `entity` makes Postgres prove that nothing references
-- it, once per referencing constraint. Without an index here that proof is a
-- SEQUENTIAL SCAN of language_source_attribute, all 60,173 rows, FOR EVERY
-- DELETED ROW. D5 rebuilds its 21,555 generated locales on each run, so the
-- delete became 21,555 x 60,173 comparisons: MEASURED AT 221 SECONDS against
-- 4 seconds for the entire rest of the step.
--
-- The column is 100% NULL today, which is exactly why it was missed: nothing
-- reads it, so nothing was ever slow because of it. The cost lands on deletes
-- of the PARENT table instead, which is a different table entirely.
--
-- PARTIAL, so the index is empty until the column is ever populated. The
-- referential-integrity check looks up `cldr_data_provider_id = $1` with a
-- non-null parameter, and the planner recognises that as implying the
-- predicate, so a partial index still serves it.
-- 004_alter.sql also declares this one, because it must exist BEFORE D5's first
-- delete and 004 is applied before the load rather than after it. Declared in
-- both files, which is safe now that every statement here is IF NOT EXISTS.
CREATE INDEX IF NOT EXISTS lsa_cldr_provider_idx
    ON language_source_attribute (cldr_data_provider_id)
 WHERE cldr_data_provider_id IS NOT NULL;

-- ── Tier 2b: the rest of the foreign keys ──────────────────────────────────
-- Added 2026-08-05, after lsa_cldr_provider_idx above proved what the omission
-- costs. An audit of pg_constraint found 25 single-column foreign keys whose
-- child column had no index leading with it. This closes 21 of them; the other
-- four are deliberate and listed at the end of this section.
--
-- These are cheap to hold and expensive to lack. A parent DELETE without one is
-- a sequential scan of the whole child table, PER DELETED ROW - the shape that
-- made D5's rebuild take 216 seconds instead of 13.6. D6 is also a
-- delete-and-rebuild step, against a larger table.
--
-- test_every_single_column_foreign_key_is_indexed_or_exempt() in
-- backend/tests/test_derive.py enforces this mechanically, so a new foreign key
-- cannot be added without a decision being made about it.

-- The closure tables. Their composite indexes lead with `source` and
-- `hierarchy` respectively, so NEITHER of them can serve `WHERE ancestor_id =
-- $1`. At 280,835 rows this is the most expensive omission in the schema after
-- the one above: every language DELETE scans the lot, twice.
CREATE INDEX IF NOT EXISTS language_ancestry_ancestor_fk_idx
  ON language_ancestry (ancestor_id);
CREATE INDEX IF NOT EXISTS language_ancestry_descendant_fk_idx
  ON language_ancestry (descendant_id);
CREATE INDEX IF NOT EXISTS territory_ancestry_ancestor_fk_idx
  ON territory_ancestry (ancestor_id);
CREATE INDEX IF NOT EXISTS territory_ancestry_descendant_fk_idx
  ON territory_ancestry (descendant_id);

-- Written by D9, and read by any "what is the biggest thing under this node"
-- query. NULL until then, so partial keeps it empty until D9 lands.
CREATE INDEX IF NOT EXISTS lsa_largest_descendant_idx
  ON language_source_attribute (largest_descendant_id)
  WHERE largest_descendant_id IS NOT NULL;

-- The writing side of D4's pair. locale_census_id_idx already covers the
-- speaking one; this is its twin, and it was simply missed.
CREATE INDEX IF NOT EXISTS locale_writing_census_id_idx
  ON locale (pop_writing_census_id);

CREATE INDEX IF NOT EXISTS keyboard_territory_idx    ON keyboard (territory_id);
CREATE INDEX IF NOT EXISTS keyboard_variant_idx      ON keyboard (variant_id);
CREATE INDEX IF NOT EXISTS census_presenter_idx      ON census (presenter_org_id);
CREATE INDEX IF NOT EXISTS lang_retirement_to_idx
  ON language_retirement (change_to_language_id);
CREATE INDEX IF NOT EXISTS wikipedia_script_idx
  ON wikipedia_edition_script (script_id);
CREATE INDEX IF NOT EXISTS ws_primary_language_idx
  ON writing_system (primary_language_id);
CREATE INDEX IF NOT EXISTS ws_territory_origin_idx
  ON writing_system (territory_of_origin_id);
CREATE INDEX IF NOT EXISTS cldr_explicit_script_idx
  ON language_cldr_coverage (explicit_script_id);
CREATE INDEX IF NOT EXISTS cldr_default_script_idx
  ON language_cldr_coverage (script_default_id);
CREATE INDEX IF NOT EXISTS cldr_default_territory_idx
  ON language_cldr_coverage (territory_default_id);
CREATE INDEX IF NOT EXISTS variant_equivalent_lang_idx
  ON variant (equivalent_language_id);
CREATE INDEX IF NOT EXISTS language_variant_variant_idx
  ON language_variant (variant_id);
CREATE INDEX IF NOT EXISTS org_hq_territory_idx      ON organization (hq_territory_id);
CREATE INDEX IF NOT EXISTS locale_variant_variant_idx
  ON locale_variant (variant_id);
CREATE INDEX IF NOT EXISTS ws_contains_child_idx
  ON writing_system_contains (child_id);

-- ── Four foreign keys deliberately left unindexed ──────────────────────────
--
--   language_source_attribute.scope             -> language_scope        (5 rows)
--   language_source_attribute.modality          -> language_modality     (6 rows)
--   language_source_attribute.eth_vitality_2012 -> vitality_eth_fine    (10 rows)
--   language_source_attribute.eth_vitality_2025 -> vitality_eth_coarse   (4 rows)
--
-- These four parents are LOOKUP tables seeded by 001_schema.sql and never
-- written to again: they are enums that wanted a name and a sort order. The
-- cost an index would avoid is a parent DELETE, and deleting a row from
-- language_scope would be a schema change, not a data change.
--
-- They are also not useful for filtering. The frontend filters by scope,
-- modality and vitality through `language`, which already carries partial
-- indexes on all four columns (Tier 3). language_source_attribute holds the
-- per-source variants, which are read via language_id, already indexed.
--
-- This is a decision, not an oversight, and the test above holds the same list
-- so that it stays one. If a query ever filters lsa by these columns directly,
-- index them then and delete this paragraph.

-- ── Tier 3: filter and sort helpers ────────────────────────────────────────

-- The highest-leverage partial index in the schema. locale holds ~10,800
-- curated rows plus ~20,000 generated ones; most list views want only the
-- curated ones, so this index is ~3x smaller and stays in cache.
CREATE INDEX IF NOT EXISTS locale_stable_pop_idx
  ON locale (pop_speaking_adjusted DESC NULLS LAST)
  WHERE locale_source = 'StableDatabase';

CREATE INDEX IF NOT EXISTS locale_source_idx      ON locale (locale_source);
CREATE INDEX IF NOT EXISTS locale_pop_percent_idx ON locale (pop_speaking_percent DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS language_modality_idx   ON language (modality)
  WHERE modality IS NOT NULL;
CREATE INDEX IF NOT EXISTS language_vit_fine_idx   ON language (vitality_eth_fine)
  WHERE vitality_eth_fine IS NOT NULL;
CREATE INDEX IF NOT EXISTS language_vit_coarse_idx ON language (vitality_eth_coarse)
  WHERE vitality_eth_coarse IS NOT NULL;
CREATE INDEX IF NOT EXISTS language_iso_status_idx ON language (iso_status)
  WHERE iso_status IS NOT NULL;
-- The DERIVED ISO status, filled by D10. This is the one the UI filters and
-- sorts on - filterByEnum.tsx:49 and the vitality sort both read
-- lang.vitality.iso, never lang.ISO.status - so it earns an index on the same
-- grounds as its three siblings above, and more directly than iso_status does.
-- Partial for the same reason as the others: 19,260 of the 27,299 rows are
-- languoids no authority gives a status to.
CREATE INDEX IF NOT EXISTS language_vit_iso_idx ON language (vitality_iso)
  WHERE vitality_iso IS NOT NULL;

CREATE INDEX IF NOT EXISTS territory_scope_idx ON territory (scope);

CREATE INDEX IF NOT EXISTS census_territory_year_idx
  ON census (territory_id, year_collected DESC);
CREATE INDEX IF NOT EXISTS census_collector_type_year_idx
  ON census (collector_type, year_collected DESC);
CREATE INDEX IF NOT EXISTS cle_language_pop_idx
  ON census_language_estimate (language_id, population_estimate DESC);

-- ── Tier 4: reports ────────────────────────────────────────────────────────
-- Partial indexes on IS NULL are unusually effective for gap-analysis reports:
-- the index contains only the rows the report wants.

-- ReportLanguagesWithAmbiguousNames
CREATE INDEX IF NOT EXISTS entity_name_name_idx
  ON entity_name (name) WHERE entity_type = 'Language';

-- ReportWritingSystemsLanguagesWithout
CREATE INDEX IF NOT EXISTS language_missing_script_idx
  ON language (population_estimate DESC NULLS LAST)
  WHERE primary_script_id IS NULL;

-- ReportLocaleCitationCompleteness
CREATE INDEX IF NOT EXISTS locale_uncited_idx
  ON locale (territory_id)
  WHERE pop_speaking_census_id IS NULL AND locale_source = 'StableDatabase';

-- ReportLocaleIndigeneity
CREATE INDEX IF NOT EXISTS locale_missing_indigeneity_idx
  ON locale (territory_id)
  WHERE historic_presence IS NULL AND locale_source = 'StableDatabase';

-- ReportVariantsAnnotationTool
CREATE INDEX IF NOT EXISTS variant_unannotated_idx
  ON variant (id) WHERE variant_type IS NULL;

-- ── Tier 5: optional, fuzzy search ─────────────────────────────────────────
-- NOT needed to match today's behaviour. Add it if you want typo tolerance
-- (`WHERE similarity(name, $q) > 0.3`), which would be a genuine product
-- improvement for a site whose job is "I half-remember this language's name".
CREATE INDEX IF NOT EXISTS entity_name_trgm
  ON entity_name USING gin (name gin_trgm_ops);


ANALYZE;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
--  POST-INSTALL CHECKLIST
-- ═══════════════════════════════════════════════════════════════════════════
--
--   1. Load data:  python -m etl.run --all   (from backend/)
--
--   2. Build the derived structures, IN THIS ORDER:
--        SELECT rebuild_language_ancestry();     -- includes the cycle assert
--        SELECT rebuild_territory_ancestry();
--        -- …then the remaining derive steps (populations, locales)
--        REFRESH MATERIALIZED VIEW territory_stats;
--        ANALYZE;
--
--   3. Verify the golden values. Easiest via:  python -m etl.run --verify
--
--        -- `language` is the UNION of every authority's languoids, NOT just
--        -- the curated file. A language_source_attribute row cannot exist
--        -- without a matching language row, and Glottolog alone contributes
--        -- ~19,000 languoids that appear in no other source. Do NOT expect
--        -- this to equal the 8,208 rows in languages.tsv.
--        SELECT COUNT(*) FROM language;         -- expect ~27,300
--        SELECT COUNT(*) FROM language
--          WHERE source_ref = 'languages.tsv';  -- expect 8,208 (curated only)
--
--        SELECT COUNT(*) FROM territory;        -- expect 289
--        SELECT COUNT(*) FROM writing_system;   -- expect 225
--        SELECT COUNT(*) FROM language_ancestry; -- expect ~250k; much more
--                                                -- than that means a cycle
--        SELECT * FROM locale_population_anomaly LIMIT 20;
--
--        -- NULL until derive steps D3-D12 are implemented. That is expected,
--        -- not a load failure. See etl/derive.py.
--        SELECT population_estimate FROM language WHERE id = 'eng';
--
--   4. Confirm the hot indexes are actually used:
--        EXPLAIN (ANALYZE, BUFFERS)
--        SELECT * FROM locale WHERE territory_id = 'IN'
--        ORDER BY pop_speaking_adjusted DESC NULLS LAST LIMIT 20;
--        -- want: Index Only Scan using locale_by_territory_pop_idx
--        --       ^^^^ "Only" confirms the INCLUDE columns are working
--
--   5. After a few weeks of real traffic, prune unused indexes:
--        SELECT relname, indexrelname, idx_scan,
--               pg_size_pretty(pg_relation_size(indexrelid))
--          FROM pg_stat_user_indexes
--         WHERE idx_scan = 0
--         ORDER BY pg_relation_size(indexrelid) DESC;
--        -- …except the Tier 4 report indexes, which are rare BY DESIGN.
-- ═══════════════════════════════════════════════════════════════════════════

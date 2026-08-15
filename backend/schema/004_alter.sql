-- ═══════════════════════════════════════════════════════════════════════════
--  004_alter.sql - structural changes made after 001_schema.sql first shipped
--
--  Why this file exists. 001_schema.sql has no IF NOT EXISTS on its tables, by
--  design: it is the clean-install file and it should fail loudly rather than
--  half-apply to a database that already has objects. That means a column added
--  to it cannot reach an existing database. This file is how it gets there.
--
--  Every statement here is idempotent, so applying it to a fresh install (where
--  001 already created the column) and to a long-running database produce the
--  same result. run.py applies it on every load.
--
--  RULE: every COLUMN added here MUST also be added to 001_schema.sql, and
--  every INDEX added here MUST also be added to 002_indexes.sql, so those two
--  files stay the single readable description of the schema. A test asserts
--  they agree; see backend/tests/test_derive.py.
--
--  Apply after 001_schema.sql. Order against 002 and 003 does not matter.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;


-- ── 2026-08-05, for D4 ─────────────────────────────────────────────────────
-- Writing is scored against the census records separately from speaking and
-- picks its own winner, so it needs its own result and its own provenance.
-- Without these two, D4 can compute the writing population but has nowhere to
-- put it. See §5.8 of 001_schema.sql for the full reasoning.
ALTER TABLE locale ADD COLUMN IF NOT EXISTS pop_writing_adjusted  bigint;
ALTER TABLE locale ADD COLUMN IF NOT EXISTS pop_writing_census_id text;


-- ── 2026-08-05, catching up with master ────────────────────────────────────
-- Merged PRs #742 and #744 changed the frontend model under us:
--
--   * TerritoryData.pop gained a `writing` member, computed as
--     population * literacy_percent / 100. D3 now fills it.
--   * applyPopRecord() now derives a population source category from the
--     winning census, for BOTH speaking and writing. These are kept separate
--     from the curated pop_speaking_source rather than overwriting it, so a
--     contributor's attribution and the census's implied one stay comparable.
ALTER TABLE territory ADD COLUMN IF NOT EXISTS population_writing bigint;
ALTER TABLE locale
  ADD COLUMN IF NOT EXISTS pop_speaking_source_derived population_source_category;
ALTER TABLE locale
  ADD COLUMN IF NOT EXISTS pop_writing_source_derived  population_source_category;

-- ADD CONSTRAINT has no IF NOT EXISTS before PostgreSQL 18, and adding the same
-- named constraint twice is an error, so the existence check is explicit.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locale_pop_writing_census_id_fkey'
  ) THEN
    ALTER TABLE locale
      ADD CONSTRAINT locale_pop_writing_census_id_fkey
      FOREIGN KEY (pop_writing_census_id) REFERENCES census(id)
      DEFERRABLE INITIALLY IMMEDIATE;   -- matches every other FK in this schema
  END IF;
END $$;


-- ── 2026-08-05, for D5 ─────────────────────────────────────────────────────
-- D5 rolls country locales up into regional ones by summing the head-count the
-- frontend holds in pop.speaking.unadjusted. For the 3,100 census-backed
-- locales that is NOT the curated figure: applyPopRecord() overwrites it with
-- the winning census's estimate, and sets the writing side from the winning
-- WRITING census. D4 refuses to overwrite the curated columns, correctly, so
-- the census head-counts had nowhere to live and D5 would have summed the
-- wrong number - Hindi worldwide 1,250,398,350 instead of 695,657,316.
--
-- Same raw-vs-derived split as pop_speaking_source_derived above.
ALTER TABLE locale ADD COLUMN IF NOT EXISTS pop_speaking_unadjusted_derived bigint;
ALTER TABLE locale ADD COLUMN IF NOT EXISTS pop_writing_unadjusted_derived  bigint;

-- D8, per use, on both language tables. PR #742 split language populations into
-- speaking and writing; Field.PopulationSpeaking and Field.PopulationWriting
-- read the two directly as independently sortable columns, and pop.overall is
-- the max of them, so one column cannot serve all three. The full reasoning is
-- on the columns in 001_schema.sql.
--
-- Nullable with no default, deliberately, for the reason FP-010 records: a
-- populated-looking zero cannot be told apart from "D8 has not run".
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_speaking_estimate        bigint;
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_writing_estimate         bigint;
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_speaking_estimate_source population_source_category;
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_writing_estimate_source  population_source_category;
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_speaking_from_locales    bigint;
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_writing_from_locales     bigint;
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_speaking_of_descendants  bigint;
ALTER TABLE language ADD COLUMN IF NOT EXISTS pop_writing_of_descendants   bigint;

ALTER TABLE language_source_attribute ADD COLUMN IF NOT EXISTS pop_speaking_estimate        bigint;
ALTER TABLE language_source_attribute ADD COLUMN IF NOT EXISTS pop_writing_estimate         bigint;
ALTER TABLE language_source_attribute ADD COLUMN IF NOT EXISTS pop_speaking_estimate_source population_source_category;
ALTER TABLE language_source_attribute ADD COLUMN IF NOT EXISTS pop_writing_estimate_source  population_source_category;
ALTER TABLE language_source_attribute ADD COLUMN IF NOT EXISTS pop_speaking_of_descendants  bigint;
ALTER TABLE language_source_attribute ADD COLUMN IF NOT EXISTS pop_writing_of_descendants   bigint;

-- The first INDEX in this file, and the reason it has to be here rather than
-- only in 002_indexes.sql: 002 is applied on a fresh install and never again,
-- so an index added to it cannot reach a database that already exists. This
-- file is re-applied on every load, which is what makes it the migration path.
-- The canonical declaration, with the full reasoning, is in 002_indexes.sql.
--
-- Short version: without it, every DELETE from `entity` sequentially scans
-- 60,173 rows of language_source_attribute to prove nothing references the
-- deleted row. D5 deletes 21,555 rows on every run. Measured: 221 seconds
-- before, against 4 seconds for everything else the step does.
CREATE INDEX IF NOT EXISTS lsa_cldr_provider_idx
    ON language_source_attribute (cldr_data_provider_id)
 WHERE cldr_data_provider_id IS NOT NULL;


-- ── 2026-08-05, territory_stats and territory groups ─────────────────────────
-- territory_stats picked its locales with an unconditional
-- `locale_source = 'StableDatabase'`, so it could not see one of the 21,555
-- regional locales D5 creates. Territory GROUPS have almost no curated locales
-- - 30 across all 32 - so the view reported the world's largest language as
-- `vol` (Volapuk, 200 speakers), which was simply the only curated locale on
-- '001' with a number. Canonical definition and full reasoning: 001 §10.6.
--
-- A materialized view cannot be CREATE OR REPLACE'd with a new definition, so
-- this is a DROP and recreate. It is GUARDED, for two reasons: the drop must
-- not happen on a fresh install where 001 already built the right thing, and
-- this file is re-applied on EVERY load, so an unguarded drop would rebuild the
-- view each time and take its unique index with it.
--
-- strpos() rather than LIKE: a % in a SQL string is a psycopg placeholder.
--
-- schemaname = current_schema() is not decoration. 001's own header documents a
-- blue/green install into a separate schema, and pg_matviews spans the whole
-- database: without the qualification this guard would see the OTHER schema's
-- copy of territory_stats and skip, leaving whichever schema is actually being
-- installed with the old definition and no error.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_matviews
     WHERE matviewname = 'territory_stats'
       AND schemaname  = current_schema()
       AND strpos(definition, 'createRegionalLocales') > 0
  ) THEN
    DROP MATERIALIZED VIEW IF EXISTS territory_stats;

    CREATE MATERIALIZED VIEW territory_stats AS
    SELECT
      t.id                                  AS territory_id,
      t.population,
      COUNT(DISTINCT lo.language_id)        AS count_of_languages,
      COUNT(DISTINCT lo.script_id)          AS count_of_writing_systems,
      COUNT(DISTINCT c.id)                  AS count_of_censuses,
      CASE WHEN MAX(lo.pop_speaking_adjusted) IS NOT NULL
           THEN (ARRAY_AGG(lo.language_id ORDER BY lo.pop_speaking_adjusted DESC NULLS LAST)
                   FILTER (WHERE lo.language_id IS NOT NULL))[1]
      END                                   AS largest_language_id,
      MAX(lo.pop_speaking_adjusted)         AS largest_language_speakers
    FROM territory t
    JOIN territory_scope ts ON ts.id = t.scope
    LEFT JOIN locale lo ON lo.territory_id = t.id
                       AND lo.locale_source = (CASE WHEN ts.is_group
                                                    THEN 'createRegionalLocales'
                                                    ELSE 'StableDatabase'
                                               END)::locale_source
    LEFT JOIN census c  ON c.territory_id  = t.id
    GROUP BY t.id, t.population;

    -- Dropped with the view, so it has to come back with it. Required for
    -- REFRESH MATERIALIZED VIEW CONCURRENTLY.
    CREATE UNIQUE INDEX territory_stats_pk ON territory_stats (territory_id);
  END IF;
END $$;


-- ── 2026-08-05, for D6 across all classification sources (FP-013) ──────────
-- A family locale is only meaningful under a stated classification. 257
-- languoids are a family in more than one source and for 80 of them the CHILD
-- SET differs, so the same (language, territory) has a genuinely different
-- population per source. Without this column those 80 collide on the table's
-- uniqueness rule and whichever source ran last would silently win.
--
-- NULL means "not specific to a classification source", which is what every
-- curated and every regional locale is. Only synthesised family locales carry
-- a value.
ALTER TABLE locale ADD COLUMN IF NOT EXISTS language_source language_source;

-- Widening the uniqueness rule to include it. This is a DROP and re-ADD rather
-- than an ALTER, because a UNIQUE constraint's column list cannot be changed in
-- place, and it is GUARDED for the usual two reasons: on a fresh install 001
-- has already created the widened constraint, and this file is re-applied on
-- EVERY load, so an unguarded drop would rebuild the underlying index each time.
--
-- The old constraint has the name Postgres generated for it in 001 before it
-- was given one, which is why it is looked up rather than named literally. The
-- new one is named explicitly so that 001 and 004 declare the same object.
--
-- strpos() rather than LIKE: a % in a SQL string is a psycopg placeholder.
--
-- 'locale'::regclass resolves through search_path, so this guard is already
-- schema-local and needs no current_schema() qualification the way the
-- pg_matviews guard above does.
-- D6 gained a p_source parameter in the same change. CREATE OR REPLACE does NOT
-- replace a function whose argument list differs - it creates an OVERLOAD - so
-- applying 003_derive.sql to a database that already had the one-argument
-- version leaves the old ISO-only body installed and callable beside the new
-- one. Found by comparing project function counts against a scratch-schema
-- install: 14 against 13.
--
-- The signature is named exactly, so this can only reach the obsolete overload
-- and never the current two-argument function. IF EXISTS makes it idempotent
-- and a no-op on a fresh install, where the old version never existed.
DROP FUNCTION IF EXISTS rebuild_family_locales(uuid);

-- Same trap, same fix, different function. census_record_rank gained a
-- p_population_estimate parameter when it was re-ported to upstream's weighted
-- model (PR #745, 2026-08-11), because the new population factor penalises a
-- record of fewer than ten people and the old signature only ever received a
-- percentage. Without this drop, a database that already had the five-argument
-- version keeps the OLD ADDITIVE BODY installed beside the new one - and it
-- stays reachable, because the D4 call sites are the only callers and any
-- future five-argument call would silently resolve to the stale ranking.
--
-- The signature is named exactly, so this can only reach the obsolete overload
-- and never the current six-argument function. IF EXISTS makes it idempotent
-- and a no-op on a fresh install, where the old version never existed.
DROP FUNCTION IF EXISTS census_record_rank(
  census_language_use, smallint, text, numeric, text);

DO $$
DECLARE
  old_name text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'locale'::regclass
       AND contype  = 'u'
       AND strpos(pg_get_constraintdef(oid), 'language_source') > 0
  ) THEN
    SELECT conname INTO old_name
      FROM pg_constraint
     WHERE conrelid = 'locale'::regclass
       AND contype  = 'u'
       AND strpos(pg_get_constraintdef(oid), 'variant_key') > 0
     LIMIT 1;

    IF old_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE locale DROP CONSTRAINT %I', old_name);
    END IF;

    ALTER TABLE locale ADD CONSTRAINT locale_identity_key
      UNIQUE NULLS NOT DISTINCT
      (language_id, script_id, territory_id, locale_source, variant_key,
       language_source);
  END IF;
END $$;


-- ── 2026-08-06, for D7 (FP-010) ────────────────────────────────────────────
-- Both descendant_count columns shipped as `int NOT NULL DEFAULT 0`. That made
-- them read as 100% populated - 27,299 / 27,299 and 60,173 / 60,173 - while D7
-- had never run and every single value was 0. Nothing could distinguish "this
-- languoid has no descendants", which is true of most of them, from "nobody has
-- counted yet".
--
-- That is precisely the failure mode this project guards against elsewhere:
-- derive.py raises DeriveStepNotImplemented rather than let an unimplemented
-- step leave a column looking like a computed zero. A DEFAULT 0 reintroduced it
-- one layer down. It also defeated the sort the column exists for - ORDER BY
-- population_estimate DESC NULLS LAST, descendant_count DESC was ordering every
-- row by 0, silently doing nothing rather than being visibly unavailable.
--
-- NOT NULL IS NOT REACHABLE, and FP-010 has been amended to say so. This file
-- is applied BEFORE the COPY phase - test_schema_files_are_applied_before_the_
-- copy_phase pins that, and it has to be that way because the load issues SET
-- CONSTRAINTS ALL DEFERRED and Postgres then refuses to ALTER a table with
-- pending trigger events. No loader supplies descendant_count, so a NOT NULL
-- column with no default makes the COPY fail outright, and even if it did not,
-- the column is legitimately NULL between the COPY and D7 on every run. The
-- honest end state is nullable, with NULL meaning uncounted.
--
-- Both statements are no-ops when already applied, which is what makes them
-- safe to re-run on every load.
ALTER TABLE language                  ALTER COLUMN descendant_count DROP DEFAULT;
ALTER TABLE language                  ALTER COLUMN descendant_count DROP NOT NULL;
ALTER TABLE language_source_attribute ALTER COLUMN descendant_count DROP DEFAULT;
ALTER TABLE language_source_attribute ALTER COLUMN descendant_count DROP NOT NULL;


-- ── 2026-08-11, for D10 ────────────────────────────────────────────────────
-- The DERIVED ISO status. language.iso_status already exists and holds the
-- value iso-639-3.tab declares; this holds the value computeRecursiveLanguage
-- Data computes, which is the declared one where there is one and the maximum
-- over the children where there is not. Everything user-facing reads the
-- derived value - getField.ts:181, filterByEnum.tsx:49, the vitality sort -
-- while VitalityExplanation.tsx:30 reads the declared one to decide whether to
-- print "Derived". One column cannot answer both questions.
ALTER TABLE language ADD COLUMN IF NOT EXISTS vitality_iso smallint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'language'::regclass
       AND conname  = 'language_vitality_iso_fkey'
  ) THEN
    ALTER TABLE language ADD CONSTRAINT language_vitality_iso_fkey
      FOREIGN KEY (vitality_iso) REFERENCES language_iso_status(id);
  END IF;
END $$;

-- vitality_meta shipped as `smallint CHECK (BETWEEN 0 AND 9)` and both halves
-- of that are wrong, in ways that fail in opposite directions.
--
-- The TYPE rounds. getVitalityMetascore returns (ethFine + ethCoarse) / 2 when
-- both Ethnologue scales are present, so 5.5 is a legitimate score - the
-- frontend's own test asserts exactly that value, and VitalityStrings.ts:19
-- renders the field with toFixed(1). An integer column would have absorbed the
-- half silently on a column that is sorted on. It does not bite today only
-- because both Ethnologue files are header-only in this repository, which
-- means it would have bitten on the day that data arrived instead.
--
-- The CHECK rejects. LanguageISOStatus.SpecialCode is -1, and the metascore
-- falls through to the ISO scale whenever neither Ethnologue value exists -
-- which is currently every languoid. 4 rows carry -1, so D10 would abort the
-- transaction rather than write a wrong number. Loud, but still a stop.
--
-- Guarded on the current type rather than run unconditionally: ALTER COLUMN
-- TYPE rewrites the whole table, and this file is applied on every load.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'language'
       AND column_name = 'vitality_meta' AND data_type <> 'numeric'
  ) THEN
    ALTER TABLE language DROP CONSTRAINT IF EXISTS language_vitality_meta_check;
    ALTER TABLE language ALTER COLUMN vitality_meta TYPE numeric(3,1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'language'::regclass
       AND conname  = 'language_vitality_meta_check'
  ) THEN
    ALTER TABLE language ADD CONSTRAINT language_vitality_meta_check
      CHECK (vitality_meta BETWEEN -1 AND 9);
  END IF;
END $$;


-- ── 2026-08-11, for D11 ────────────────────────────────────────────────────
-- No column to add: language_source_attribute.modality has existed since
-- 001_schema.sql shipped and D11 is simply its first writer. What it lacked
-- was a statement of what it now means, and a comment in 001 alone never
-- reaches a running database, because --fresh truncates rather than reinstalls.
-- COMMENT ON is idempotent, so it belongs here on the same grounds every other
-- statement in this file does. Kept verbatim in step with 001_schema.sql.
COMMENT ON COLUMN language_source_attribute.modality IS
  'D11. The modality the languoid EFFECTIVELY has under this authority: the '
  'value languages.tsv declares where there is one, otherwise the '
  'population-weighted average of its children''s. Read this column, not '
  'language.modality, for anything user-facing - the frontend exposes one '
  'field and it is this one. language.modality is the DECLARED value alone, '
  'and it stays the discriminator: a row where it is NULL and this is not was '
  'derived. Combined only today, 1,028 of 8,342, because the frontend '
  'traverses the Combined child lists whatever source is selected. D11 is also '
  'the only writer here - nothing loads this column, which is what makes its '
  'clear-then-rebuild safe where language.latitude''s was not.';


COMMIT;

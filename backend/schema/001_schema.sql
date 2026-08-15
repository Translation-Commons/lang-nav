-- ═══════════════════════════════════════════════════════════════════════════
--  lang-nav - PostgreSQL schema
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Every table and every non-obvious column carries a COMMENT ON explaining
--  why it is shaped the way it is. Read those before changing anything.
--
--  Target: PostgreSQL 16+
--
--  ---------------------------------------------------------------------------
--  STATUS: IN USE. Applied against a live PostgreSQL 18 server with the full
--  dataset loaded; see backend/README.md. Of the three questions in §0.2, Q1 is
--  resolved and Q3 is adopted. Q2 alone is still open.
--  ---------------------------------------------------------------------------
--
--  USAGE
--    Fresh install into the current database's public schema:
--        python -m etl.run --schema
--    which applies this file and then 004_alter.sql, 003_derive.sql,
--    005_roles.sql and 006_rls.sql, in that order. To apply this file alone:
--        psql -d langnav -f backend/schema/001_schema.sql
--
--    Blue/green deploy (the publish stage of the ingest pipeline):
--        CREATE SCHEMA staging;
--        SET search_path TO staging;
--        \i backend/schema/001_schema.sql
--        -- …load data, verify, then swap:
--        ALTER SCHEMA public  RENAME TO old_20260726;
--        ALTER SCHEMA staging RENAME TO public;
--
--    Bulk loading: indexes are not in this file. They live in 002_indexes.sql
--    and are applied AFTER the initial COPY, because indexes make COPY
--    dramatically slower.
--
--  CONTENTS
--    §0   Notes and open questions
--    §1   Extensions
--    §2   Enum types
--    §3   Lookup tables (ordinal enums + seed data)
--    §4   Foundations: entity, entity_name
--    §5   Core entities
--    §6   Junction tables
--    §7   Satellite tables
--    §8   Derived structures (closure tables, materialized views)
--    §9   Operational tables
--    §10  Functions, triggers and views
-- ═══════════════════════════════════════════════════════════════════════════

-- ===========================================================================
--  PART 1 of 2 - structure only (extensions, enums, tables, constraints,
--  functions, triggers, views).
--
--  Indexes live in 002_indexes.sql and are applied AFTER the bulk COPY,
--  because indexes make COPY dramatically slower.
--
--  Apply with:  psql -d langnav -f backend/schema/001_schema.sql
-- ===========================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
--  §0  NOTES AND OPEN QUESTIONS
-- ═══════════════════════════════════════════════════════════════════════════
--
--  §0.1  DESIGN PRINCIPLES
--
--    P1  Never make the schema pick a winner between classification sources.
--        Hence `language_source_attribute` - the central decision (§5.2).
--    P2  Natural keys, not surrogates. id = 'eng', not id = 47.
--    P3  Separate raw input from derived value.
--        (population_from_un vs population; pop_*_unadjusted vs pop_*_adjusted)
--    P4  Provenance is a column, not a comment.
--    P5  3NF by default; denormalise deliberately and document it.
--    P6  Ordinal enums stay numeric so `parent.scope <= child.scope` works.
--    P7  Nothing the ETL can compute should be computed at request time.
--
--  §0.2  OPEN QUESTIONS - decide these before this schema is final
--
--    Q1  RESOLVED 2026-08-02. The 0.01 tie-breakers are NOT carried over.
--
--        The original code did two things with 0.01, both of them clever and
--        both of them invisible:
--
--          a) computeDescendantPopulation() started its sum at 0.01 and added
--             0.01 per node, so the FRACTIONAL PART of a family's population
--             was really a count of its members. Its own comment said
--             "Tiebreaker = number of child nodes". A family of 300 languages
--             with no speaker data stored as 3.00; a family of 5 stored as
--             0.05. Sorting by population therefore ranked the larger family
--             first.
--
--          b) discountPopulationEstimatesIfSimilarToParent() set a child to
--             parent - 0.01 whenever the child looked larger than its parent,
--             which is logically impossible and means the source data is wrong.
--
--        Both are now handled explicitly instead:
--
--          a) becomes `descendant_count`, a real column that says what it
--             means. Sort by (population_estimate DESC, descendant_count DESC)
--             and the ordering is identical, but the rule is visible and the
--             number is not a lie.
--
--          b) becomes a data_quality_finding. A child larger than its parent
--             is a defect to surface and fix upstream, not something to hide
--             behind a 0.01 subtraction where nobody will ever find it.
--
--        Consequence: every population column is bigint. Populations are counts
--        of people; they were never fractional.
--
--    Q2  languages.tsv columns 9-10 (`Recommendation`, `Recommendation Reason`)
--        are never read by the parser, which instead reads out-of-range
--        parts[13]/[14] into viabilityConfidence/viabilityExplanation.
--        Both column pairs are provided below; drop whichever is wrong.
--        Search for "Q2".
--
--    Q3  The `entity` supertype: adopt it (polymorphic lookup + enforced ID
--        uniqueness, at the cost of one join) or keep the prefix convention?
--        ADOPTED HERE. To remove it, drop table `entity`, remove the
--        `REFERENCES entity(id)` clauses, and repoint entity_name at
--        individual tables. Search for "Q3".
--
--  §0.3  CONVENTIONS
--
--    tables       singular snake_case
--    junctions    <a>_<b>
--    PK           natural code ('eng', 'US', 'Latn')
--    FK           <referenced_table>_id
--    derived      marked "DERIVED" - written by the ETL, never by hand
--    every table  created_at / updated_at / source_ref where meaningful


-- ═══════════════════════════════════════════════════════════════════════════
--  §1  EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- btree_gin: lets a GIN index combine a scalar column with a tsvector,
--            e.g. (entity_type, name_tsv) - the hottest index in the schema.
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- pg_trgm: optional, for fuzzy/typo-tolerant search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ═══════════════════════════════════════════════════════════════════════════
--  §2  ENUM TYPES
-- ═══════════════════════════════════════════════════════════════════════════
--  Native ENUMs are used for closed, small, stable, NON-ORDINAL sets.
--  Ordinal sets (scope, vitality, modality) use SMALLINT + a lookup table
--  instead - see §3 and principle P6.

CREATE TYPE entity_type AS ENUM (
  'Language', 'Locale', 'Territory', 'WritingSystem',
  'Variant', 'Census', 'Keyboard', 'Organization'
);

-- The seven classification authorities. Adding an eighth is an ALTER TYPE,
-- not a schema migration - that is the whole point of §5.2.
CREATE TYPE language_source AS ENUM (
  'Combined',    -- lang-nav's own merged best-guess
  'ISO',         -- ISO 639-3 / 639-5
  'BCP',         -- ISO but preferring 2-letter 639-1 codes
  'UNESCO',      -- limited to languages in UNESCO's World Atlas
  'Glottolog',
  'CLDR',        -- ISO with CLDR-specific aliasing
  'Ethnologue'   -- limited to languages present in Ethnologue
);

-- Only 'StableDatabase' comes from input data (locales.tsv). The other four
-- are synthesised by the pipeline.
CREATE TYPE locale_source AS ENUM (
  'StableDatabase',
  'IANA',
  'census',
  'createRegionalLocales',
  'createFamilyLocales'
);

-- The TypeScript enum has `NoSource = ''`. An empty-string enum label is
-- legal in Postgres but a trap (it reads as "missing" in every tool), so the
-- ETL must map '' -> 'NoSource'. NULL is reserved for "not yet determined";
-- 'NoSource' means "we looked, and there is no cited source".
CREATE TYPE population_source_category AS ENUM (
  'Official', 'Unverified Official', 'Study', 'Ethnologue', 'EDL', 'CLDR',
  'Other', 'NoSource',
  'Aggregated from Territories', 'Aggregated from Languages', 'Algorithmic'
);

CREATE TYPE official_status AS ENUM (
  'official', 'de_facto_official', 'recognized',
  'official_regional', 'recognized_regional'
);

CREATE TYPE census_collector_type AS ENUM (
  'Government', 'Study', 'NGO', 'Media', 'Secondary', 'Unknown'
);

CREATE TYPE census_language_use AS ENUM (
  'Understands', 'Speaks', 'Writes', 'Reads', 'Uses', 'Ethnicity'
);

CREATE TYPE writing_system_scope AS ENUM (
  'Group', 'Individual script', 'Variation', 'Special Code'
);

CREATE TYPE variant_type       AS ENUM ('o', 'd');  -- Orthographic, Dialect
CREATE TYPE keyboard_platform  AS ENUM ('GBoard', 'Keyman');
CREATE TYPE wikipedia_status   AS ENUM ('Active', 'Closed', 'Incubator');
CREATE TYPE cldr_coverage_level AS ENUM ('core', 'basic', 'moderate', 'modern');
CREATE TYPE territory_hierarchy AS ENUM ('geographic', 'political');

CREATE TYPE name_kind AS ENUM (
  'display',      -- the primary English name
  'endonym',      -- in the language's own language
  'alias',        -- alternate / other names
  'source_name',  -- the name a specific authority uses
  'translation'   -- e.g. the French name
);


-- ═══════════════════════════════════════════════════════════════════════════
--  §3  LOOKUP TABLES (ordinal enums)
-- ═══════════════════════════════════════════════════════════════════════════
--  These are SMALLINT rather than native ENUMs because their ORDER is
--  meaningful and compared in queries. ReportLanguageScopeIssues does
--  `parent.scope <= child.scope` - trivial with integers, painful with enums.
--  The lookup tables give the numbers names and provide referential integrity.
--  User-facing display strings stay in the frontend (@strings/), not here.

CREATE TABLE language_scope (
  id   smallint PRIMARY KEY,
  name text NOT NULL UNIQUE
);
COMMENT ON TABLE language_scope IS
  'Ordinal: larger = broader. 0 is deliberately unused - the TypeScript enum '
  'notes "0 is intentionally not included to avoid problems using truthy comparisons".';
INSERT INTO language_scope (id, name) VALUES
  (5, 'Family'),
  (4, 'Macrolanguage'),
  (3, 'Language'),
  (2, 'Dialect'),
  (1, 'SpecialCode');

CREATE TABLE territory_scope (
  id       smallint PRIMARY KEY,
  name     text    NOT NULL UNIQUE,
  is_group boolean NOT NULL   -- mirrors isTerritoryGroup(): aggregates rather
                              -- than holding direct data
);
INSERT INTO territory_scope (id, name, is_group) VALUES
  (6, 'World',        true),
  (5, 'Continent',    true),
  (4, 'Region',       true),
  (3, 'Subcontinent', true),
  (2, 'Country',      false),
  (1, 'Dependency',   false);

CREATE TABLE language_modality (
  id   smallint PRIMARY KEY,
  name text NOT NULL UNIQUE
);
COMMENT ON TABLE language_modality IS
  'Note the NEGATIVE values - this axis runs written(-2) .. spoken(2), with sign(3) apart.';
INSERT INTO language_modality (id, name) VALUES
  (-2, 'Written'),
  (-1, 'Mostly Written'),
  ( 0, 'Spoken & Written'),
  ( 1, 'Mostly Spoken'),
  ( 2, 'Spoken'),
  ( 3, 'Sign');

CREATE TABLE vitality_eth_coarse (
  id   smallint PRIMARY KEY,
  name text NOT NULL UNIQUE
);
INSERT INTO vitality_eth_coarse (id, name) VALUES
  (9, 'Institutional'),
  (6, 'Stable'),
  (3, 'Endangered'),
  (0, 'Extinct');

CREATE TABLE vitality_eth_fine (
  id   smallint PRIMARY KEY,
  name text NOT NULL UNIQUE
);
COMMENT ON TABLE vitality_eth_fine IS
  'EGIDS (Expanded Graded Intergenerational Disruption Scale), remapped to 0-9. '
  'The critical threshold is 4 -> 3: once children stop learning a language at '
  'home it has roughly one generation left.';
INSERT INTO vitality_eth_fine (id, name) VALUES
  (9, 'National'),
  (8, 'Regional'),
  (7, 'Trade'),
  (6, 'Educational'),
  (5, 'Developing'),
  (4, 'Threatened'),
  (3, 'Shifting'),
  (2, 'Moribund'),
  (1, 'Dormant'),
  (0, 'Extinct');

CREATE TABLE language_iso_status (
  id   smallint PRIMARY KEY,
  code char(1),
  name text NOT NULL
);
INSERT INTO language_iso_status (id, code, name) VALUES
  ( 9, 'L', 'Living'),
  ( 3, 'C', 'Constructed'),
  ( 1, 'H', 'Historical'),
  ( 0, 'E', 'Extinct'),
  (-1, 'S', 'Special Code');


-- ═══════════════════════════════════════════════════════════════════════════
--  §4  FOUNDATIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- ── §4.1  entity - the ID namespace registry ───────────────────────────────
-- Q3. CoreData.tsx merges all eight entity types into one map with the comment
-- "the ID formats are unique so its OK". This table turns that convention into
-- an enforced constraint, and makes `GET /object/:id` a single lookup.
CREATE TABLE entity (
  id           text        PRIMARY KEY,
  type         entity_type NOT NULL,
  code_display text        NOT NULL,  -- may differ from id (org.StatCAN -> StatCAN)
  name_display text        NOT NULL,
  name_endonym text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE entity IS
  'Supertype registry for all eight entity types. Answers "does this ID exist, '
  'and what kind of thing is it?" without knowing the type in advance.';

-- ── §4.2  entity_name - the search corpus ──────────────────────────────────
-- ObjectBase.names: string[] made relational. This is what autocomplete hits.
-- A table rather than a text[] column because we need: indexable prefix search,
-- knowing WHICH alias matched, provenance per name, and the
-- LanguagesWithAmbiguousNames report as a plain GROUP BY.
CREATE TABLE entity_name (
  id           bigserial   PRIMARY KEY,
  entity_id    text        NOT NULL REFERENCES entity(id) ON DELETE CASCADE,
  entity_type  entity_type NOT NULL,   -- DENORMALISED from entity.type, see below
  name         text        NOT NULL,
  kind         name_kind   NOT NULL,
  language_tag text,                   -- 'en', 'fr', or NULL
  source       text,                   -- 'ISO' | 'Glottolog' | 'census:ca2021' | 'wiki'

  -- 'simple', NOT 'english': these are proper nouns in ~200 languages.
  -- English stemming would mangle them and is meaningless for endonyms.
  -- 'simple' gives word-boundary tokenisation with no stemming, which exactly
  -- matches the frontend's anyWordStartsWith() semantics.
  name_tsv     tsvector GENERATED ALWAYS AS (to_tsvector('simple', name)) STORED
  -- Uniqueness is enforced by entity_name_uniq below. It must be a UNIQUE INDEX
  -- rather than a UNIQUE table constraint, because a table constraint cannot
  -- contain expressions and language_tag / source are nullable.
);

CREATE UNIQUE INDEX entity_name_uniq ON entity_name
  (entity_id, name, kind, COALESCE(language_tag, ''), COALESCE(source, ''));
COMMENT ON COLUMN entity_name.entity_type IS
  'DELIBERATE DENORMALISATION: duplicates entity.type so the '
  'composite GIN index (entity_type, name_tsv) is possible. Without it every '
  'autocomplete would join to entity before filtering. Kept in sync by the ETL.';


-- ═══════════════════════════════════════════════════════════════════════════
--  §5  CORE ENTITIES
-- ═══════════════════════════════════════════════════════════════════════════
--  Creation order resolves forward references. The one true circular
--  dependency (language.primary_script_id <-> writing_system.primary_language_id)
--  is broken by adding the second FK via ALTER at §5.3.

-- ── §5.1  territory ────────────────────────────────────────────────────────
CREATE TABLE territory (
  id            text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,
  code_alpha3   text,          -- ISO 3166-1 alpha-3: USA, CAN
  code_numeric  text,          -- ISO 3166-1 numeric:  840, 124
  scope         smallint NOT NULL REFERENCES territory_scope(id),
  name_endonym  text,
  -- other endonyms / exonyms live in entity_name

  -- TWO INDEPENDENT HIERARCHIES.
  -- Greenland is geographically in Northern America (021) but governed by
  -- Denmark. Both facts are true; both must be traversable.
  contained_un_region_id text REFERENCES territory(id),  -- geographic
  sovereign_id           text REFERENCES territory(id),  -- political

  population_from_un bigint,   -- raw input from territories.tsv        (P3)
  population         bigint,   -- DERIVED: recomputed by roll-up        (P3)
  -- DERIVED by D3: population * literacy_percent / 100. How many people here
  -- can read and write at all, in any language. Added 2026-08-05 to follow the
  -- frontend, where TerritoryData.pop gained a `writing` member.
  population_writing bigint,

  literacy_percent numeric(5,2),
  gdp              bigint,
  land_area_km2    numeric(12,2),
  latitude         numeric(9,6),
  longitude        numeric(9,6),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text,

  CONSTRAINT territory_not_own_parent    CHECK (id <> contained_un_region_id),
  CONSTRAINT territory_not_own_sovereign CHECK (id <> sovereign_id),
  CONSTRAINT territory_literacy_range
    CHECK (literacy_percent IS NULL OR literacy_percent BETWEEN 0 AND 100)
);
COMMENT ON COLUMN territory.id IS
  'ISO 3166-1 alpha-2 (US, IN) OR UN M.49 (001 = World, 150 = Europe). '
  'Heterogeneous by design. 001 is the root and is hard-coded in the pipeline.';

-- ── §5.2  writing_system ───────────────────────────────────────────────────
-- Created before `language` so that language.primary_script_id resolves.
-- Its own primary_language_id FK is added at §5.3.
CREATE TABLE writing_system (
  id                    text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,
  scope                 writing_system_scope NOT NULL,
  name_full             text,
  name_endonym          text,
  name_display_original text,
  unicode_version       numeric(4,1),
  sample                text,     -- a sample glyph
  right_to_left         boolean,

  primary_language_id      text,  -- FK added at §5.3 (circular dependency)
  territory_of_origin_id   text REFERENCES territory(id),
  parent_writing_system_id text REFERENCES writing_system(id),  -- derivation lineage

  -- DERIVED
  population_upper_bound    bigint,
  population_of_descendants bigint,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text,

  CONSTRAINT ws_not_own_parent CHECK (id <> parent_writing_system_id)
);
COMMENT ON COLUMN writing_system.parent_writing_system_id IS
  'DERIVATION lineage (Cyrl descends from Grek). This is a DIFFERENT relation '
  'from grouping - see writing_system_contains. Do not collapse them.';

-- ── §5.3  language ─────────────────────────────────────────────────────────
-- Only SOURCE-INDEPENDENT facts live here. If a value changes when the user
-- switches languageSource, it belongs in language_source_attribute (§5.4).
CREATE TABLE language (
  id text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,

  -- Identity - stable across all sources
  name_canonical text NOT NULL,
  name_subtitle  text,          -- from the "Name (subtitle)" split
  name_endonym   text,
  name_french    text,          -- see the warning below

  -- Intrinsic attributes
  modality          smallint REFERENCES language_modality(id),
  primary_script_id text     REFERENCES writing_system(id),
  -- MIXED loaded and derived, and coords_source is what tells them apart.
  -- Glottolog supplies 8,907 positions directly; D10 fills gaps on grouping
  -- nodes from the weighted average of their children and stamps the tree it
  -- walked. That makes coords_source the ONLY safe predicate for clearing
  -- these before a rebuild: an unqualified reset destroys the 1,137 loaded
  -- positions on languoids outside the Combined tree, and the run still
  -- reports success. P4: even coordinates carry provenance.
  latitude          numeric(9,6),
  longitude         numeric(9,6),
  coords_source     language_source,

  -- Vitality. iso_status is the DECLARED value, loaded from iso-639-3.tab.
  -- The other four are DERIVED by D10 and are what the UI actually reads:
  -- getField, the filters and the sorts all go through lang.vitality.*, never
  -- through lang.ISO.status. The two must stay separate columns because
  -- VitalityExplanation.tsx:30 tests `lang.ISO.status == null` to decide
  -- whether to label the displayed figure "Derived" - collapsing them makes
  -- every inherited value look declared.
  --
  -- numeric, NOT smallint. getVitalityMetascore averages the two Ethnologue
  -- scales when both are present, so 5.5 is a legitimate value and
  -- VitalityStrings.ts:19 renders it with toFixed(1). smallint shipped here
  -- first and would have rounded a user-visible sortable field silently.
  --
  -- The lower bound is -1, not 0: LanguageISOStatus.SpecialCode is -1 and the
  -- metascore falls through to the ISO scale whenever neither Ethnologue value
  -- exists, which is currently every languoid. 4 rows carry it.
  vitality_meta       numeric(3,1) CHECK (vitality_meta BETWEEN -1 AND 9),
  vitality_iso        smallint REFERENCES language_iso_status(id),
  vitality_eth_fine   smallint REFERENCES vitality_eth_fine(id),
  vitality_eth_coarse smallint REFERENCES vitality_eth_coarse(id),
  iso_status          smallint REFERENCES language_iso_status(id),

  -- Q2: the parser reads these from out-of-range columns and they are always
  -- NULL at runtime. Keep or drop depending on the maintainers' answer.
  viability_confidence  text,
  viability_explanation text,
  recommendation        text,   -- languages.tsv col 9, currently never read
  recommendation_reason text,   -- languages.tsv col 10, currently never read

  -- Population: raw input (P3)
  population_rough bigint CHECK (population_rough IS NULL OR population_rough >= 0),

  -- Population: DERIVED. Materialised because the main list query sorts on it
  -- constantly. These mirror the 'Combined' source row so the common case
  -- needs no join. DELIBERATE DENORMALISATION - the authoritative per-source
  -- values live on language_source_attribute.
  --
  -- population_estimate is pop.overall: max(speaking, writing), which is what
  -- Field.Population sorts on. population_estimate_source is the provenance of
  -- whichever use produced that maximum.
  population_estimate        bigint,
  population_estimate_source population_source_category,
  -- max(speaking.descendants, writing.descendants), per
  -- getObjectPopulationOfDescendants(). NOT the sum of the two.
  population_of_descendants  bigint,
  -- SUPERSEDED by pop_speaking_from_locales / pop_writing_from_locales below,
  -- and left unfilled by D8. It predates PR #742's split and has no single-value
  -- meaning any more: the two uses read different columns off the World locale.
  -- Kept rather than dropped so the change is additive; see FP-015.
  population_from_locales    bigint,
  largest_descendant_id      text REFERENCES language(id),

  -- D8, PER USE. PR #742 split language populations into speaking and writing,
  -- and the two are not derivable from one another: `fromLocales` reads a
  -- different column off the World locale for each, the rough figure carries a
  -- per-use modality discount, and the descendant sums recurse independently.
  --
  -- Both are user-visible and independently sortable - Field.PopulationSpeaking
  -- and Field.PopulationWriting read language.pop.speaking.estimate and
  -- .writing.estimate directly (getObjectPopulation.ts:141-183) - so a single
  -- column cannot serve them plus pop.overall.
  --
  -- Named for `locale`.pop_speaking_* / pop_writing_*, which is where D8 reads
  -- its inputs from, at the cost of two naming conventions on this table.
  pop_speaking_estimate        bigint,
  pop_writing_estimate         bigint,
  pop_speaking_estimate_source population_source_category,
  pop_writing_estimate_source  population_source_category,
  pop_speaking_from_locales    bigint,
  pop_writing_from_locales     bigint,
  pop_speaking_of_descendants  bigint,
  pop_writing_of_descendants   bigint,

  -- Q1(a): the replacement for the 0.01-per-node tiebreaker. How many
  -- languoids sit beneath this one in the Combined tree. Sorting a list by
  -- (population_estimate DESC NULLS LAST, descendant_count DESC) reproduces
  -- the old ordering exactly, with the rule written down instead of hidden in
  -- the decimal places of a population figure.
  --
  -- NULLABLE AND NO DEFAULT, deliberately. It shipped as NOT NULL DEFAULT 0
  -- and read as 100% populated while D7 had never run and every value was 0,
  -- so nothing could tell "no descendants" from "nobody has counted" - the
  -- exact failure mode derive.py raises DeriveStepNotImplemented to avoid,
  -- reintroduced one layer down. NULL now means D7 has not run. See FP-010.
  descendant_count int,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text
);
-- Read this before writing any query that counts rows in this table.
COMMENT ON TABLE language IS
  'Holds LANGUOIDS, not just languages: languages, dialects and family '
  'groupings all live here. A language_source_attribute row cannot exist '
  'without a matching row in this table, so it is necessarily the UNION of '
  'every authority''s nodes. Measured 2026-08-02: 27,299 rows, of which 18,379 '
  'are not classified as a language by ANY source (13,553 Glottolog dialects, '
  '4,794 families). '
  'COUNT(*) ON THIS TABLE IS NOT A LANGUAGE COUNT. '
  'For a language count you must name an authority, because the seven of them '
  'disagree - that disagreement is the entire reason '
  'language_source_attribute exists: '
  'SELECT count(*) FROM language_source_attribute WHERE source = ''ISO'' AND scope = 3; '
  'Gives ISO 7,856 / Glottolog 8,605 / at least one source 8,920. '
  'The curated catalogue is a further, different thing: '
  'SELECT count(*) FROM language WHERE source_ref = ''languages.tsv''; -> 8,208, '
  'of which 7,659 are languages, 257 dialects and 50 families. '
  'The site''s public "~8,200 languages" is therefore a CURATION CHOICE, not a '
  'fact about the world.';

COMMENT ON COLUMN language.source_ref IS
  'Which file first created this row. The only way to separate the curated '
  'catalogue from the languoids contributed by external authorities, so do not '
  'repurpose it. WHERE source_ref = ''languages.tsv'' gives the curated 8,208.';

COMMENT ON COLUMN language.name_french IS
  'DELIBERATE DENORMALISATION - duplicates an entity_name row. '
  'WATCH THIS ONE: if a SECOND translation language is ever added, DELETE this '
  'column and use entity_name exclusively. Do NOT add name_spanish.';
COMMENT ON COLUMN language.population_estimate IS
  'A count of people, so bigint. The original code kept this fractional to carry '
  'two hidden behaviours; both are now explicit instead. (1) It added 0.01 per '
  'node so the decimal part encoded the number of descendants: that is now the '
  'descendant_count column, and lists sort by '
  '(population_estimate DESC NULLS LAST, descendant_count DESC). (2) It set a '
  'child to parent - 0.01 when the child looked larger than its parent: that is '
  'a source-data defect and is now written to data_quality_finding so it gets '
  'fixed rather than hidden. Resolved 2026-08-02.';

COMMENT ON COLUMN language.descendant_count IS
  'How many languoids sit beneath this one in the Combined tree. DERIVED, by '
  'D7. Exists so that ordering ties between families can be broken by a rule '
  'anyone can read, instead of by fractions smuggled into a population figure. '
  'The authoritative per-source values live on language_source_attribute, '
  'because each authority gives the tree a different shape. '
  'NULL MEANS UNCOUNTED, NOT ZERO. Two ways to get one: D7 has not run, or the '
  'languoid has no Combined row at all and so is not in that tree - 18,957 of '
  '27,299 measured 2026-08-06, almost all Glottolog dialects. A leaf that IS '
  'in the tree reads 0. The column was NOT NULL DEFAULT 0 until 2026-08-06, '
  'which made every audit report it as fully populated while D7 had never run; '
  'see FP-010. NOT NULL is not reachable: 004_alter.sql is applied before the '
  'COPY phase and no loader supplies this column, so it is legitimately NULL '
  'between the COPY and D7 on every single run.';

-- Resolve the circular dependency now that both tables exist.
ALTER TABLE writing_system
  ADD CONSTRAINT writing_system_primary_language_fkey
  FOREIGN KEY (primary_language_id) REFERENCES language(id);

-- ── §5.4  language_source_attribute ────────────────────────────────────────
--
--  ⭐ THE CENTRAL DESIGN DECISION. Read the whole comment block below
--     before changing anything here.
--
--  Seven authorities disagree about what a language is - including WHO ITS
--  PARENT IS. Spanish has a different parent under ISO than under Glottolog,
--  so the family TREE ITSELF changes shape per source. That is why
--  parent_language_id cannot live on the `language` table.
--
--  ROW ABSENCE IS MEANINGFUL: no row for (lang, source) means that authority
--  does not recognise this languoid. Only codes <= 3 chars get ISO/BCP/UNESCO
--  rows; Glottolog has ~27,000 nodes; Ethnologue is a subset of ISO.
--
CREATE TABLE language_source_attribute (
  language_id text            NOT NULL REFERENCES language(id) ON DELETE CASCADE,
  source      language_source NOT NULL,

  code   text,      -- 'spa' | 'es' | 'stan1288' - differs per source
  name   text,      -- the name THIS source uses
  scope  smallint REFERENCES language_scope(id),
  notes  text,

  -- ⭐ The per-source hierarchy. THE most-traversed edge in the schema.
  parent_language_id text REFERENCES language(id),

  -- ISO-specific
  code_6391         text,      -- the 2-letter ISO 639-1 code
  retirement_reason char(1),   -- C|D|N|S|M

  -- Ethnologue-specific
  eth_population      bigint,
  eth_vitality_2012   smallint REFERENCES vitality_eth_fine(id),
  eth_vitality_2025   smallint REFERENCES vitality_eth_coarse(id),
  eth_digital_support smallint CHECK (eth_digital_support BETWEEN 1 AND 5),

  -- CLDR-specific. Polymorphic: dataProvider may be a Language OR a Locale,
  -- hence it references entity(id). A concrete payoff of the §4.1 supertype.
  cldr_data_provider_id text REFERENCES entity(id),

  -- DERIVED, PER SOURCE. These are the authoritative
  -- values; the copies on `language` mirror the 'Combined' row only.
  depth                      smallint,       -- depth in THIS source's tree
  population_of_descendants  bigint,
  population_estimate        bigint,
  population_estimate_source population_source_category,
  -- D8, per use, for the same reason as on `language`. The tree has a different
  -- shape under each authority, so these recurse independently per source and
  -- the `language` copies mirror the 'Combined' row only.
  pop_speaking_estimate        bigint,
  pop_writing_estimate         bigint,
  pop_speaking_estimate_source population_source_category,
  pop_writing_estimate_source  population_source_category,
  pop_speaking_of_descendants  bigint,
  pop_writing_of_descendants   bigint,
  largest_descendant_id      text REFERENCES language(id),
  modality                   smallint REFERENCES language_modality(id),

  -- Q1(a). Per source, because the tree has a different shape under each
  -- authority: the same languoid has 300 descendants under Glottolog and 5
  -- under ISO. The copy on `language` mirrors the 'Combined' row only.
  -- Nullable and no default, for the reason given on language.descendant_count.
  descendant_count           int,

  -- Set true for rows written by languageFamilyCombinedOverrides.tsv so the
  -- ETL knows not to clobber a manual decision.
  is_manual_override boolean NOT NULL DEFAULT false,

  name_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(name, ''))) STORED,

  PRIMARY KEY (language_id, source),
  CONSTRAINT lsa_not_own_parent CHECK (language_id <> parent_language_id)
);

COMMENT ON COLUMN language_source_attribute.scope IS
  'What THIS authority calls the languoid: 5 Family, 4 Macrolanguage, '
  '3 Language, 2 Dialect, 1 SpecialCode. This column, not the row count of '
  'the language table, is what a language count is built from. Filtering '
  'scope = 3 for a chosen source is the ONLY correct way to answer '
  '"how many languages are there". Measured 2026-08-02: Glottolog 8,605 '
  'languages / 13,553 dialects / 4,794 families; ISO and BCP 7,856 languages. '
  'The spread between authorities is real disagreement, not a data error.';

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

-- ── §5.5  variant ──────────────────────────────────────────────────────────
CREATE TABLE variant (
  id           text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,
  description  text,          -- from the IANA "Comments" field
  date_added   date,          -- from the IANA "Added" field
  variant_type variant_type,  -- from tc/variant_annotations.tsv

  -- A cross-entity equivalence: the variant 'valencia' names the same thing
  -- as the languoid 'vale1252'.
  equivalent_language_id text REFERENCES language(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text
);

-- ── §5.6  organization ─────────────────────────────────────────────────────
CREATE TABLE organization (
  id              text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,
  url             text,
  collector_type  census_collector_type,
  parent_id       text REFERENCES organization(id),  -- UN -> UNESCO, Unicode -> CLDR
  hq_territory_id text REFERENCES territory(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text,

  -- The 'org.' prefix convention becomes an enforced constraint rather than
  -- a comment. It exists to avoid ID collisions in the flat namespace.
  CONSTRAINT org_id_prefixed    CHECK (id LIKE 'org.%'),
  CONSTRAINT org_not_own_parent CHECK (id <> parent_id)
);

-- ── §5.7  census ───────────────────────────────────────────────────────────
-- A provenance record as much as a survey. One TSV file yields SEVERAL rows
-- here - each data COLUMN in the file is a separate census with its own
-- methodology. Hence ids like 'ca2021.2'.
CREATE TABLE census (
  id             text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,
  territory_id   text NOT NULL REFERENCES territory(id),
  year_collected smallint NOT NULL,

  -- What was asked
  language_use      census_language_use,
  proficiency       text,   -- open vocabulary: 'Conversant or Learning', 'Fluent'…
  acquisition_order text,   -- 'Any' | 'L1' | 'L2' | 'L3'
  domain            text,   -- 'Any' | 'Home' | 'School' | 'Work' | 'Community'

  -- Who was counted
  population                         bigint,
  population_source                  text,
  population_surveyed                bigint,
  population_with_positive_responses bigint,
  sample_rate                        numeric(6,4),
  sample_rate_note                   text,  -- CensusData.sampleRate is `number | string`;
                                            -- non-numeric values land here rather than being lost
  responses_per_individual text,   -- '1' | '1+' | '2+'
  age                      text,   -- '0+' | '4+'
  gender                   text,
  nationality              text,
  residence_basis          text,   -- 'de jure' | 'de facto'

  -- Scope
  languages_included text,   -- 'All' | 'Indigenous' | 'Official'
  geographic_scope   text,
  quantity           text NOT NULL DEFAULT 'count'
                       CHECK (quantity IN ('count', 'percent')),
  notes              text,

  -- Who produced it
  collector_type       census_collector_type NOT NULL DEFAULT 'Unknown',
  collector_org_id     text REFERENCES organization(id),
  presenter_org_id     text REFERENCES organization(id),
  collector_name       text,   -- fallback when no organization row exists yet
  collector_name_short text,
  author               text,

  -- Where it was published
  url            text,
  date_published date,
  date_accessed  date,
  document_name  text,
  section_name   text,
  table_name     text,
  column_name    text,
  citation       text,

  -- DERIVED
  language_count int NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text,   -- the TSV file plus the column index it came from

  CONSTRAINT census_year_sane CHECK (year_collected BETWEEN 1800 AND 2100)
);
COMMENT ON COLUMN census.proficiency IS
  'Deliberately text, not an enum. These are OPEN vocabularies - real values '
  'include "Conversant or Learning". Enumerating them prematurely would reject '
  'valid new census data. Revisit once the distribution is known: '
  'SELECT DISTINCT proficiency, COUNT(*) FROM census GROUP BY 1;';

-- ── §5.8  locale ───────────────────────────────────────────────────────────
-- Simultaneously a JUNCTION (language x territory x script x variants) and an
-- ENTITY with its own attributes. That dual nature is why it cannot be a pure
-- link table.
CREATE TABLE locale (
  id text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,  -- 'zho_Hant_TW_tailo'

  -- The composite id decomposed into real FKs so joins are indexable.
  language_id  text NOT NULL REFERENCES language(id),
  script_id    text          REFERENCES writing_system(id),
  territory_id text          REFERENCES territory(id),
  -- variants -> locale_variant (0..n, and ORDER matters)

  locale_source locale_source NOT NULL DEFAULT 'StableDatabase',
  name_endonym  text,

  -- WHICH classification source this row belongs to, or NULL for a row that is
  -- not specific to one. Added for D6.
  --
  -- Curated locales are NULL: a figure recorded for Hindi in India is a fact
  -- about Hindi in India, not about ISO. Regional locales are NULL for the same
  -- reason. Only the synthesised FAMILY locales carry a value, because a family
  -- exists only inside a classification - `inc` (Indo-Aryan) is an ISO family
  -- and `indo1319` is a Glottolog one, and where the two systems both recognise
  -- a languoid they frequently disagree about its children.
  --
  -- Part of the uniqueness rule; see the CONSTRAINT at the bottom of this table
  -- for why that is load-bearing rather than tidy.
  language_source language_source,

  -- The ordered variant subtags, joined with '.', or '' when there are none.
  -- DELIBERATE DENORMALISATION of locale_variant, and it exists for exactly
  -- one reason: the uniqueness rule below is wrong without it.
  --
  -- Romansh has seven variant-distinguished locales in Switzerland
  -- (roh_CH_SURSILV, roh_CH_VALLADER, roh_CH_PUTER, roh_CH_SURMIRAN,
  -- roh_CH_SUTSILV, roh_CH_JAUER, roh_CH_RUMGR) plus the plain roh_CH. All
  -- eight share the same (language, script, territory, source) tuple, so a
  -- constraint over those four columns alone rejects seven legitimate locales.
  -- Variants cannot be referenced directly in a table constraint because they
  -- live in locale_variant, hence this column.
  variant_key text NOT NULL DEFAULT '',

  -- Legal / political status
  official_status  official_status,
  ecrml_protection smallint CHECK (ecrml_protection BETWEEN 1 AND 4),

  -- Indigeneity (tc/indigeneity.tsv)
  lang_formed_here  boolean,  -- formed here, vs arrived by migration/expansion
  historic_presence boolean,  -- established before 1500 CE

  -- Population, SPEAKING - raw vs derived kept apart (P3)
  pop_speaking_unadjusted bigint,
  pop_speaking_adjusted   bigint,        -- DERIVED
  pop_speaking_percent    numeric(7,4),  -- DERIVED
  -- CURATED, from locales.tsv. D4 never overwrites this.
  pop_speaking_source     population_source_category,
  pop_speaking_census_id  text REFERENCES census(id),  -- WHICH census won (P4)

  -- DERIVED by D4 from the winning census, kept apart from the curated column
  -- above so neither destroys the other. The frontend overwrites its in-memory
  -- `pop.source`; doing that here would lose the curated attribution for the
  -- 3,100 census-backed locales. Holding both makes a disagreement between what
  -- a contributor recorded and what the census implies visible instead of silent.
  pop_speaking_source_derived population_source_category,
  pop_writing_source_derived  population_source_category,

  -- Population, WRITING
  -- Writing gets its own winning census, not the speaking one. The frontend
  -- scores the same records twice with different weights, so a locale can take
  -- its speaker count from a 2020 "Speaks" census and its writer count from a
  -- 2011 "Writes" one. Storing a single census id would lose that.
  pop_writing_unadjusted bigint,
  pop_writing_percent    numeric(7,4),   -- DERIVED
  pop_writing_adjusted   bigint,         -- DERIVED
  pop_writing_census_id  text REFERENCES census(id),  -- WHICH census won, for writing

  -- DERIVED head-counts, the same raw-vs-derived split as the *_source columns
  -- above. applyPopRecord() overwrites the frontend's in-memory
  -- pop.speaking.unadjusted with the winning census's estimate, and sets
  -- pop.writing.unadjusted from the winning WRITING census. D4 refuses to do
  -- that to the curated columns, so the census-reported head-counts land here
  -- instead of being lost.
  --
  -- These are not a nicety. D5 rolls locales up into regional ones by summing
  -- exactly this field, and the two differ enough to matter: Hindi worldwide is
  -- 695,657,316 from the censuses against 1,250,398,350 from locales.tsv.
  -- Summing the curated column would be 44% wrong.
  pop_speaking_unadjusted_derived bigint,
  pop_writing_unadjusted_derived  bigint,

  literacy_percent numeric(5,2),         -- DERIVED, recomputed by D4

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text,

  -- The same (lang, script, territory) triple can legitimately exist both as
  -- a curated locale and as a generated regional/family one.
  --
  -- NULLS NOT DISTINCT is essential here (PG 15+). script_id and territory_id
  -- are nullable, and under the default NULLS DISTINCT rule two rows of
  -- ('eng', NULL, 'US', 'StableDatabase') would BOTH be allowed - the
  -- constraint would silently not apply to exactly the locales that need it.
  -- variant_key is part of the key: see the column comment above. Without it
  -- the seven Romansh idiom locales collide with each other and with roh_CH.
  --
  -- language_source is part of the key for the same class of reason, and it was
  -- added for D6. A family locale is only meaningful under a stated
  -- classification: 257 languoids are a family in more than one source, and for
  -- 80 of them the CHILD SET differs between sources, so "Indo-Aryan in India"
  -- genuinely has a different population under ISO than under Glottolog. Both
  -- are correct and both have to be storable. Without this column those 80
  -- collide, and whichever source loaded last would silently win.
  CONSTRAINT locale_identity_key UNIQUE NULLS NOT DISTINCT
    (language_id, script_id, territory_id, locale_source, variant_key,
     language_source),

  CONSTRAINT locale_speaking_pct_range
    CHECK (pop_speaking_percent IS NULL OR pop_speaking_percent BETWEEN 0 AND 100),
  CONSTRAINT locale_writing_pct_range
    CHECK (pop_writing_percent IS NULL OR pop_writing_percent BETWEEN 0 AND 100)
);
COMMENT ON COLUMN locale.id IS
  'DELIBERATE DENORMALISATION: duplicates the component FKs. '
  'Kept because this string is the user-facing, URL-shareable, citable '
  'identifier used throughout the app and in exports.';
COMMENT ON COLUMN locale.pop_speaking_census_id IS
  'Records WHICH census produced the number. Without it provenance is lost the '
  'moment the pipeline runs. This is what ReportLocaleCitationCompleteness reads.';
COMMENT ON COLUMN locale.pop_writing_census_id IS
  'The winning census for WRITING, which is scored separately from speaking and '
  'is frequently a different census. Also the only place the census-reported '
  'writing figure can be recovered from: the *_unadjusted columns deliberately '
  'keep the curated source value rather than being overwritten by the census.';
COMMENT ON COLUMN locale.literacy_percent IS
  'DERIVED by D4 as LEAST(pop_writing_adjusted * 100 / pop_speaking_adjusted, '
  '100), falling back to a copy of territory.literacy_percent when either side '
  'is missing or zero. It is a locale-specific literacy rate, NOT simply the '
  'territory value: Latin in Italy and Italian in Italy differ. Never edited '
  'independently. Regional locales are the exception: D5 recomputes them from '
  'the same ratio but leaves NULL rather than falling back, because the '
  'frontend does (computeAggregatedLocalesPopulation.ts:22-25).';
COMMENT ON COLUMN locale.pop_speaking_unadjusted_derived IS
  'The head-count the WINNING CENSUS reported, or a copy of the curated figure '
  'when the locale has no census. This is what the frontend actually holds in '
  'pop.speaking.unadjusted after applyPopRecord() overwrites it, and what D5 '
  'sums when rolling locales up into regional ones. pop_speaking_unadjusted '
  'beside it is the untouched value from locales.tsv.';
COMMENT ON COLUMN locale.pop_writing_unadjusted_derived IS
  'As pop_speaking_unadjusted_derived, but from the winning WRITING census, '
  'which is usually a different one. Falls back to the curated SPEAKING figure '
  'for a locale with no census, which is what computePopulationWithoutCensus'
  'Records() does. The only writing head-count the schema holds: nothing '
  'populates pop_writing_unadjusted.';

-- ── §5.9  keyboard ─────────────────────────────────────────────────────────
CREATE TABLE keyboard (
  id               text PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE,
  platform         keyboard_platform NOT NULL,
  territory_id     text REFERENCES territory(id),       -- GBoard only
  input_script_id  text REFERENCES writing_system(id),
  output_script_id text REFERENCES writing_system(id),
  variant_id       text REFERENCES variant(id),         -- GBoard only
  downloads        int,                                 -- Keyman only
  total_downloads  int,                                 -- Keyman only

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_ref text,

  -- One table for two platforms, but platform-specific columns must only be
  -- set for their own platform. Without this, nonsense (a GBoard keyboard with
  -- a download count) accumulates silently.
  CONSTRAINT keyboard_platform_fields CHECK (
    (platform = 'Keyman' AND territory_id IS NULL AND variant_id IS NULL)
    OR
    (platform = 'GBoard' AND downloads IS NULL AND total_downloads IS NULL)
  )
);


-- ═══════════════════════════════════════════════════════════════════════════
--  §6  JUNCTION TABLES
-- ═══════════════════════════════════════════════════════════════════════════
--  Each of these exists because the source data packs several values into one
--  cell - a 1NF violation.

-- Variant ORDER matters: slv_Latn_SI_bohoric_nedis is a different string from
-- slv_Latn_SI_nedis_bohoric even if semantically equivalent.
CREATE TABLE locale_variant (
  locale_id  text     NOT NULL REFERENCES locale(id)  ON DELETE CASCADE,
  variant_id text     NOT NULL REFERENCES variant(id) ON DELETE CASCADE,
  position   smallint NOT NULL,
  PRIMARY KEY (locale_id, variant_id)
);

CREATE TABLE language_variant (
  language_id text NOT NULL REFERENCES language(id) ON DELETE CASCADE,
  variant_id  text NOT NULL REFERENCES variant(id)  ON DELETE CASCADE,
  PRIMARY KEY (language_id, variant_id)
);

-- IANA "Prefix:" repeats, and values may be composite ('zh-Latn', 'oc-lengadoc'),
-- not just plain language codes. Stored as text - do not over-constrain.
CREATE TABLE variant_prefix (
  variant_id text NOT NULL REFERENCES variant(id) ON DELETE CASCADE,
  prefix     text NOT NULL,
  PRIMARY KEY (variant_id, prefix)
);

-- GROUPING, a separate M:N relation from the derivation lineage on
-- writing_system.parent_writing_system_id. E.g. Hani contains Hans + Hant.
CREATE TABLE writing_system_contains (
  parent_id text NOT NULL REFERENCES writing_system(id) ON DELETE CASCADE,
  child_id  text NOT NULL REFERENCES writing_system(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, child_id),
  CONSTRAINT ws_contains_not_self CHECK (parent_id <> child_id)
);

-- GBoard: exactly 1 row per keyboard. Keyman: 1 or more.
CREATE TABLE keyboard_language (
  keyboard_id text NOT NULL REFERENCES keyboard(id) ON DELETE CASCADE,
  language_id text NOT NULL REFERENCES language(id),
  PRIMARY KEY (keyboard_id, language_id)
);

-- 'windows,macos,ios' unpivoted.
CREATE TABLE keyboard_platform_support (
  keyboard_id text NOT NULL REFERENCES keyboard(id) ON DELETE CASCADE,
  os          text NOT NULL,
  PRIMARY KEY (keyboard_id, os)
);

-- The unpivoted form of CensusData.languageEstimates: Record<LanguageCode, number>.
-- The associative entity between Census and Language.
CREATE TABLE census_language_estimate (
  census_id           text   NOT NULL REFERENCES census(id) ON DELETE CASCADE,
  language_id         text   NOT NULL REFERENCES language(id),
  population_estimate bigint NOT NULL,

  -- parseCensusLanguageRow.ts coerces unparseable and non-positive values to 1,
  -- because they usually mean "too small to disclose" rather than zero. Without
  -- these two columns, "1 speaker" and "suppressed for privacy" become
  -- permanently indistinguishable.
  raw_value     text,
  is_suppressed boolean NOT NULL DEFAULT false,

  source_name text,   -- the language name the census itself used

  PRIMARY KEY (census_id, language_id)
);


-- ═══════════════════════════════════════════════════════════════════════════
--  §7  SATELLITE TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- One language may have MANY UDHR translations (LanguageData.udhr is an array).
CREATE TABLE language_udhr (
  id                 bigserial PRIMARY KEY,
  language_id        text NOT NULL REFERENCES language(id) ON DELETE CASCADE,
  language_code_path text NOT NULL,   -- 'som/afas1238'
  name               text NOT NULL,   -- 'Af Marka'
  variant            text,            -- 'Latn' | 'Cyrl' | ''
  document_url       text
  -- See the note on entity_name_uniq: expression uniqueness needs an INDEX.
);

CREATE UNIQUE INDEX language_udhr_uniq ON language_udhr
  (language_id, language_code_path, COALESCE(variant, ''));

-- 15 attributes, but only ~345 of ~8,200 languages have any. That sparsity
-- crosses the threshold for its own table.
CREATE TABLE language_cldr_coverage (
  language_id           text PRIMARY KEY REFERENCES language(id) ON DELETE CASCADE,
  explicit_script_id    text REFERENCES writing_system(id),
  script_default_id     text REFERENCES writing_system(id),
  territory_default_id  text REFERENCES territory(id),
  count_of_cldr_locales int,
  target_coverage_level cldr_coverage_level,
  actual_coverage_level cldr_coverage_level,
  in_icu                boolean NOT NULL DEFAULT false,
  pct_values_confirmed  numeric(5,2),
  pct_modern_complete   numeric(5,2),
  pct_moderate_complete numeric(5,2),
  pct_basic_complete    numeric(5,2),
  pct_core_complete     numeric(5,2)
);

CREATE TABLE language_cldr_missing_feature (
  language_id text NOT NULL
    REFERENCES language_cldr_coverage(language_id) ON DELETE CASCADE,
  feature text NOT NULL,
  PRIMARY KEY (language_id, feature)
);

CREATE TABLE cldr_language_match (
  id        bigserial PRIMARY KEY,
  desired   text NOT NULL,
  supported text NOT NULL,
  distance  int  NOT NULL,
  oneway    boolean NOT NULL DEFAULT false,
  UNIQUE (desired, supported)
);

CREATE TABLE language_retirement (
  language_id           text PRIMARY KEY REFERENCES language(id) ON DELETE CASCADE,
  name                  text,
  reason                char(1),   -- C=change D=duplicate N=non-existent S=split M=merge
  change_to_language_id text REFERENCES language(id),
  remedy                text,
  effective_date        date
);

-- BCNF matters here: alias_code alone determines language_id, so it must be
-- part of the key. Keying on (language_id, alias_code) would allow 'ta' to
-- resolve to two different languages. This is a BCNF requirement.
CREATE TABLE language_code_alias (
  language_id text NOT NULL REFERENCES language(id) ON DELETE CASCADE,
  alias_code  text NOT NULL,
  alias_kind  text NOT NULL
    CHECK (alias_kind IN ('iso639-1', 'iso639-2b', 'iso639-2t', 'glottocode')),
  PRIMARY KEY (alias_code, alias_kind)
);

CREATE TABLE wikipedia_edition (
  wikipedia_subdomain text PRIMARY KEY,   -- 'en', 'zh-classical', 'map-bms'
  locale_id           text REFERENCES locale(id),
  language_id         text REFERENCES language(id),
  title_english       text,
  title_local         text,
  status              wikipedia_status,
  language_name       text,
  articles            int,
  active_users        int,
  url                 text
);

CREATE TABLE wikipedia_edition_script (
  wikipedia_subdomain text NOT NULL
    REFERENCES wikipedia_edition(wikipedia_subdomain) ON DELETE CASCADE,
  script_id text NOT NULL REFERENCES writing_system(id),
  PRIMARY KEY (wikipedia_subdomain, script_id)
);


-- ═══════════════════════════════════════════════════════════════════════════
--  §8  DERIVED STRUCTURES
-- ═══════════════════════════════════════════════════════════════════════════
--  Rebuilt by the ETL, never written by hand.

-- ── §8.1  language_ancestry ────────────────────────────────────────────────
--  A CLOSURE TABLE: one row per (source, ancestor, descendant) pair, including
--  depth-0 self rows.
--
--  Why not a recursive CTE at query time? It would run on EVERY filtered query.
--  Why not ltree? Because ReportLanguagePaths exists specifically to find
--  languages reachable by MORE THAN ONE route - the structure is a DAG, and
--  ltree stores exactly one path per node. A closure table handles DAGs natively.
--
--  Size: ~8,200 languages x 7 sources x ~5 average depth ~= 300,000 rows (~12 MB).
--  If it comes out much larger than that, suspect a cycle.
CREATE TABLE language_ancestry (
  source        language_source NOT NULL,
  ancestor_id   text NOT NULL REFERENCES language(id) ON DELETE CASCADE,
  descendant_id text NOT NULL REFERENCES language(id) ON DELETE CASCADE,
  depth         smallint NOT NULL,
  PRIMARY KEY (source, ancestor_id, descendant_id)
);

-- ── §8.2  territory_ancestry ───────────────────────────────────────────────
-- Same structure, but for BOTH territory hierarchies.
CREATE TABLE territory_ancestry (
  hierarchy     territory_hierarchy NOT NULL,
  ancestor_id   text NOT NULL REFERENCES territory(id) ON DELETE CASCADE,
  descendant_id text NOT NULL REFERENCES territory(id) ON DELETE CASCADE,
  depth         smallint NOT NULL,
  PRIMARY KEY (hierarchy, ancestor_id, descendant_id)
);


-- ═══════════════════════════════════════════════════════════════════════════
--  §9  OPERATIONAL TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Replaces LanguageData.warnings (an in-memory map) AND backs several of the
-- 13 reports, with history. Written by the ingest validator.
CREATE TABLE data_quality_finding (
  id          bigserial PRIMARY KEY,
  -- NULLABLE on purpose. Not every problem belongs to an entity: "this source
  -- file produced zero rows", "180 family constituents in this file are not
  -- known languages", "this column is misaligned" are all findings about a
  -- FILE or a whole source. Requiring an entity here would mean either
  -- discarding those or inventing a fake id to hang them on.
  entity_id   text REFERENCES entity(id) ON DELETE CASCADE,
  field       text NOT NULL,
  severity    text NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  message     text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  run_id      uuid NOT NULL   -- which ingest run found it
);

-- Lets the API return a cache key / ETag and lets clients detect staleness.
CREATE TABLE ingest_run (
  run_id      uuid PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status      text NOT NULL DEFAULT 'running'
                CHECK (status IN ('running', 'succeeded', 'failed')),
  notes       text
);


-- ═══════════════════════════════════════════════════════════════════════════
--  §10  FUNCTIONS, TRIGGERS AND VIEWS
-- ═══════════════════════════════════════════════════════════════════════════
--
--  PHILOSOPHY: hard EXCEPTION for things that would corrupt the model (cycles,
--  duplicate keys). WARNING or a reporting VIEW for things that are genuinely
--  messy in the real world (scope conflicts, over-counted populations). The 13
--  reports exist BECAUSE the data is imperfect - do not build a schema that
--  refuses to hold it.

-- ── §10.1  updated_at maintenance ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER entity_touch         BEFORE UPDATE ON entity
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER language_touch       BEFORE UPDATE ON language
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER locale_touch         BEFORE UPDATE ON locale
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER territory_touch      BEFORE UPDATE ON territory
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER writing_system_touch BEFORE UPDATE ON writing_system
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER variant_touch        BEFORE UPDATE ON variant
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER census_touch         BEFORE UPDATE ON census
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER keyboard_touch       BEFORE UPDATE ON keyboard
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER organization_touch   BEFORE UPDATE ON organization
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ── §10.2  Census collector ranking ────────────────────────────────────────
-- Mirrors getCensusCollectorTypeRank(). Lower rank = higher priority.
-- Used by the census-selection rules in the ingest pipeline.
CREATE OR REPLACE FUNCTION census_collector_rank(t census_collector_type)
RETURNS int IMMUTABLE LANGUAGE sql AS $$
  SELECT CASE t
    WHEN 'Government' THEN 1
    WHEN 'Study'      THEN 2
    WHEN 'NGO'        THEN 3
    WHEN 'Media'      THEN 4
    WHEN 'Secondary'  THEN 5
    ELSE 6
  END;
$$;

-- ── §10.3  Closure table rebuilds ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION assert_no_language_cycles() RETURNS void AS $$
DECLARE n int;
BEGIN
  SELECT COUNT(*) INTO n
    FROM language_ancestry
   WHERE ancestor_id = descendant_id AND depth > 0;
  IF n > 0 THEN
    RAISE EXCEPTION 'Language hierarchy contains % cycle(s)', n;
  END IF;
END $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rebuild_language_ancestry() RETURNS void AS $$
BEGIN
  TRUNCATE language_ancestry;

  INSERT INTO language_ancestry (source, ancestor_id, descendant_id, depth)
  WITH RECURSIVE walk AS (
    -- depth 0: every language is its own ancestor. This makes "descendants of
    -- X" naturally include X, matching the frontend's
    -- getLanguageFamiliesRelevantToObject(), which returns [...parents, object].
    SELECT source, language_id AS ancestor_id, language_id AS descendant_id,
           0 AS depth
      FROM language_source_attribute
    UNION ALL
    SELECT w.source, w.ancestor_id, lsa.language_id, w.depth + 1
      FROM walk w
      JOIN language_source_attribute lsa
        ON lsa.parent_language_id = w.descendant_id
       AND lsa.source             = w.source
     WHERE w.depth < 50   -- mirrors the depth>50 guard in updatePopulations.ts
  )
  SELECT source, ancestor_id, descendant_id, MIN(depth)
    FROM walk
   GROUP BY source, ancestor_id, descendant_id;   -- MIN(depth) resolves DAG
                                                  -- multi-route cases

  PERFORM assert_no_language_cycles();
  ANALYZE language_ancestry;
END $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rebuild_territory_ancestry() RETURNS void AS $$
BEGIN
  TRUNCATE territory_ancestry;

  -- Geographic containment
  INSERT INTO territory_ancestry (hierarchy, ancestor_id, descendant_id, depth)
  WITH RECURSIVE walk AS (
    SELECT id AS ancestor_id, id AS descendant_id, 0 AS depth FROM territory
    UNION ALL
    SELECT w.ancestor_id, t.id, w.depth + 1
      FROM walk w
      JOIN territory t ON t.contained_un_region_id = w.descendant_id
     WHERE w.depth < 20
  )
  SELECT 'geographic', ancestor_id, descendant_id, MIN(depth)
    FROM walk GROUP BY ancestor_id, descendant_id;

  -- Political sovereignty
  INSERT INTO territory_ancestry (hierarchy, ancestor_id, descendant_id, depth)
  WITH RECURSIVE walk AS (
    SELECT id AS ancestor_id, id AS descendant_id, 0 AS depth FROM territory
    UNION ALL
    SELECT w.ancestor_id, t.id, w.depth + 1
      FROM walk w
      JOIN territory t ON t.sovereign_id = w.descendant_id
     WHERE w.depth < 20
  )
  SELECT 'political', ancestor_id, descendant_id, MIN(depth)
    FROM walk GROUP BY ancestor_id, descendant_id;

  ANALYZE territory_ancestry;
END $$ LANGUAGE plpgsql;

-- ── §10.4  Scope monotonicity check ────────────────────────────────────────
-- A parent must be BROADER than its child (Family=5 > Language=3 > Dialect=2).
-- RAISE WARNING, not EXCEPTION: ReportLanguageScopeIssues exists precisely
-- because real violations are present in the data today. Surface them, do not
-- block ingest.
CREATE OR REPLACE FUNCTION check_scope_monotonic() RETURNS trigger AS $$
DECLARE parent_scope smallint;
BEGIN
  IF NEW.parent_language_id IS NULL OR NEW.scope IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT scope INTO parent_scope
    FROM language_source_attribute
   WHERE language_id = NEW.parent_language_id AND source = NEW.source;
  IF parent_scope IS NOT NULL AND parent_scope <= NEW.scope THEN
    RAISE WARNING 'Scope issue: % (scope %) parented by % (scope %) in source %',
      NEW.language_id, NEW.scope, NEW.parent_language_id, parent_scope, NEW.source;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER lsa_scope_monotonic
  AFTER INSERT OR UPDATE ON language_source_attribute
  FOR EACH ROW EXECUTE FUNCTION check_scope_monotonic();

-- ── §10.5  Reporting views ─────────────────────────────────────────────────
-- A VIEW, not a constraint: multiple-response censuses legitimately over-count
-- (a bilingual person is counted twice), so this cannot be a hard rule.
CREATE OR REPLACE VIEW locale_population_anomaly AS
SELECT lo.id AS locale_id,
       lo.pop_speaking_adjusted,
       t.id  AS territory_id,
       t.population AS territory_population
  FROM locale lo
  JOIN territory t ON t.id = lo.territory_id
 WHERE lo.pop_speaking_adjusted > t.population * 1.05;   -- 5% tolerance

-- ── §10.6  Map aggregates ──────────────────────────────────────────────────
-- 289 territories. Refreshed as the final step of every ingest run.
--
-- WHICH LOCALES DESCRIBE A TERRITORY DEPENDS ON WHAT KIND OF TERRITORY IT IS,
-- and getting this wrong is silent. A country is described by its CURATED
-- locales. A group - the World, a continent, a region - has essentially none:
-- only 30 exist across all 32 groups, almost all constructed languages parked
-- on '001' because they belong to no country. A group is described by the
-- REGIONAL locales D5 generates for it.
--
-- The frontend says exactly this: createRegionalLocales REPLACES
-- territory.locales for a group, so a group's list holds only generated rows
-- and a leaf's holds only curated ones. This CASE is that rule.
--
-- Until 2026-08-05 the join read `AND lo.locale_source = 'StableDatabase'`
-- unconditionally. The consequence was not an empty column, which would have
-- been honest, but a confident wrong answer: the world's largest language was
-- reported as `vol`, Volapuk, on the strength of 200 speakers, because it was
-- the only curated locale on '001' carrying a number at all.
--
-- The CASE on largest_language_id is the second half of that fix. Without it
-- the id and the count can disagree - a plausible-looking language id says
-- "computed, and this is the answer" where a NULL would say "not computed".
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

-- Required for REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX territory_stats_pk ON territory_stats (territory_id);


-- ═══════════════════════════════════════════════════════════════════════════
--  §10.7  DEFERRABLE FOREIGN KEYS
-- ═══════════════════════════════════════════════════════════════════════════
--
--  Every foreign key is made DEFERRABLE so that a bulk load can insert tables
--  in any order and have referential integrity checked once, at COMMIT.
--
--  This is not a nicety. There is a genuine CYCLE in the schema:
--      language.primary_script_id        -> writing_system
--      writing_system.primary_language_id -> language
--  Neither table can be loaded first, so no COPY order can satisfy both.
--
--  There are also four SELF-REFERENCING keys - territory.contained_un_region_id,
--  territory.sovereign_id, writing_system.parent_writing_system_id and
--  organization.parent_id. Those appear to work when the source file happens to
--  list parents before children, and break silently when it does not. Relying
--  on row order inside a file is not a property worth depending on.
--
--  INITIALLY IMMEDIATE keeps normal application writes checked per statement,
--  exactly as before. Only a session that explicitly issues
--  SET CONSTRAINTS ALL DEFERRED - which the ETL does, and nothing else should -
--  gets the deferred behaviour.
--
--  Written as a loop rather than 40 inline clauses so that any foreign key
--  added later is covered automatically and cannot reintroduce the problem.

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conrelid::regclass::text AS table_name, conname
      FROM pg_constraint
     WHERE contype = 'f'
       AND connamespace = 'public'::regnamespace
       AND NOT condeferrable
  LOOP
    EXECUTE format(
      'ALTER TABLE %s ALTER CONSTRAINT %I DEFERRABLE INITIALLY IMMEDIATE',
      r.table_name, r.conname
    );
  END LOOP;
END $$;

ANALYZE;

COMMIT;

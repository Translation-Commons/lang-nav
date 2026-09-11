-- The `api` schema: views that return the shape the app renders.
--
-- WHY THIS EXISTS, and why it is not just tidier URLs.
--
-- PostgREST serves base tables, so every difference between "what the database
-- stores" and "what the browser renders" has to be reconciled in the frontend
-- mapper. For `language` that reconciliation is not a set of missing columns -
-- the database holds every fact - it is the ORDER in which CoreData.tsx mutates
-- its dictionaries. Four supplemental files remained fetched for that reason
-- alone, and reproducing them in the mapper failed on ordering that no per-row
-- function can express: groupLanguagesBySource runs BEFORE the retirement step
-- on the file path and AFTER the mapper on the API path, so one glottocode is
-- simultaneously required (for the dictionary to register it) and forbidden
-- (from the end state).
--
-- THE DEADLOCK THIS BREAKS. `Combined.parentLanguageCode` in the browser is a
-- GLOTTOCODE wherever nothing resolves it - `kor` -> `kore1284`. In the
-- database the same field is a FOREIGN KEY, so the value cannot be stored:
-- writing it grafts the Glottolog forest onto the Combined tree, measured at
-- language_ancestry 281k -> 477k with D10 failing on 994 rows. That was treated
-- as an unresolvable conflict between the two representations.
--
-- A VIEW COLUMN IS COMPUTED, NOT STORED. The base table keeps its foreign key
-- and its referential integrity; the view returns the browser's value. One
-- COALESCE, and the conflict is gone.
--
-- ROOTED ON `language`, NOT ON THE COMBINED ROW. 18,795 of the 27,378 languages
-- have no `language_source_attribute` row for Combined - they exist only in the
-- Glottolog tree. Joining from the Combined row returns 8,583 languoids and
-- silently loses two thirds of the dataset.

-- A VIEW CARRIES NO FOREIGN KEYS, and that is the constraint this approach
-- runs into. PostgREST builds its embeds from the FK graph, so
-- `?select=...,language_source_attribute(...)` fails with PGRST200 against a
-- view - "no matches were found" - even though the underlying table has the
-- key. Two consequences, both learned by trying it:
--
--   1. `db-schemas` must list `public` FIRST. With `api` first the view
--      shadows the base table for every unqualified request and every existing
--      loader breaks at once.
--   2. A view that REPLACES the language query must therefore return the
--      per-source rows itself - as an aggregated json column - rather than
--      relying on an embed. That is a bigger change than adding columns, and
--      it is why this file starts with one view carrying the fields the merge
--      steps compute rather than the whole entity.

-- REQUIRES A POSTGREST CONFIG CHANGE, and that file is gitignored because it
-- holds a database credential - so this will not work on a fresh clone until
-- someone makes it by hand:
--
--     db-schemas = "public,api"
--
-- `public` MUST come first. PostgREST resolves an unqualified name against the
-- first schema in the list that has it, so with `api` first this view shadows
-- the base table and every existing loader breaks at once. With `public` first
-- the base tables are untouched and the view is reached only by asking for it
-- with an `Accept-Profile: api` header.

CREATE SCHEMA IF NOT EXISTS api;
GRANT USAGE ON SCHEMA api TO langnav_read;

-- ---------------------------------------------------------------------------
-- api.language
-- ---------------------------------------------------------------------------
-- One row per languoid, carrying the fields the four remaining files supply.
-- The per-source blocks stay in `language_source_attribute` and are embedded by
-- PostgREST as before; this view adds only what the merge steps computed.

-- DROP then CREATE, not CREATE OR REPLACE. Postgres only lets REPLACE add
-- columns at the END of the list, so inserting one in the middle fails with
-- "cannot change name of view column". Dropping first keeps the column order
-- readable instead of forcing every later addition to the bottom.
DROP VIEW IF EXISTS api.language;

CREATE VIEW api.language AS
SELECT
    l.id,
    l.name_canonical,
    l.name_subtitle,
    l.name_endonym,
    l.modality,
    l.primary_script_id,
    l.population_rough,
    l.recommendation,
    l.recommendation_reason,
    l.iso_status,
    l.latitude,
    l.longitude,
    l.coords_source,

    -- THE COMBINED PARENT, as the browser renders it.
    --
    -- `addGlottologLanguages` fills this with `??=`: a curated ISO family edge
    -- from familiesToLanguages.tsv wins, and the Glottolog parent fills the gap
    -- where there is none. COALESCE is that rule.
    --
    --   kor  combined NULL, glottolog kore1284 -> kore1284  (glottocode fill)
    --   aiq  combined NULL, glottolog east2745 -> east2745
    --   eng  combined gmw,  glottolog macr1271 -> gmw       (curated edge wins)
    --   cmn  combined zho,  glottolog mand1471 -> zho
    combined.parent_language_id,
    -- RESOLVED THROUGH THE ALIAS TABLE, because the browser does the same.
    --
    -- `addGlottologLanguages` looks the parent glottocode up and stores the
    -- LANGUOID ID it finds, falling back to the raw code only when nothing
    -- claims it. glottocodeToISO.tsv is what claims `muya1239` for `mvm`,
    -- `ijoo1239` for `ijo` and 100-odd more, and the ETL records every one of
    -- those as a `glottocode` alias - so the same resolution is a join.
    --
    -- Without it the view returns `muya1239` where the app shows `mvm`, on 20
    -- languages. With it they agree.
    COALESCE(galias.language_id, glot.parent_language_id)
        AS glottolog_parent_language_id,

    -- Something the browser cannot currently express: whether that parent is a
    -- real edge in the Combined tree or a display-only glottocode. The frontend
    -- holds one string and cannot tell the two apart; a consumer that walks the
    -- tree needs to.
    (combined.parent_language_id IS NOT NULL) AS parent_is_in_combined_tree,

    -- SET BY languageFamilyCombinedOverrides.tsv, and the reason the flag was
    -- put on the table in the first place: it tells a later step not to clobber
    -- a hand-curated parent.
    --
    -- The frontend needs it for the same reason. `cca` Cauca is retired with no
    -- changeTo, so addISORetirementsToLanguages REPLACES the whole languoid and
    -- its parent goes with it; the overrides file then restores `sai`. Serving
    -- the flag lets the mapper keep the parent through the retirement rebuild
    -- instead, which is what makes that file droppable.
    COALESCE(combined.is_manual_override, false) AS parent_is_manual_override,

    -- RETIREMENT, which drives addISORetirementsToLanguages. Serving these lets
    -- the frontend build the same warning text from the same four fields rather
    -- than re-reading the file - the split-language list is parsed out of
    -- `remedy` by regex, so the text carries the list with it.
    -- The name AS THE RETIREMENT FILE SPELLS IT, which is not always the one
    -- on `language`. addISORetirementsToLanguages rebuilds the languoid from
    -- `retirement.languageName`, so `myi` reads "Mina (India)" there against
    -- "Mina" here.
    ret.name                AS retirement_name,
    ret.reason              AS retirement_reason,
    ret.change_to_language_id AS retirement_change_to,
    ret.remedy              AS retirement_remedy,
    ret.effective_date      AS retirement_effective_date,

    -- THE PER-SOURCE ROWS, AGGREGATED, because a view has no foreign keys and
    -- PostgREST therefore cannot embed through it (PGRST200). Returning them as
    -- json here is what makes the view a replacement for the embedded query
    -- rather than an addition to it.
    --
    -- COALESCE to an empty array, not NULL: 18,795 languages have no Combined
    -- row and the mapper should iterate an empty list rather than branch on
    -- null.
    COALESCE(attrs.rows, '[]'::json) AS sources,
    COALESCE(aliases.rows, '[]'::json) AS aliases
FROM language l
LEFT JOIN language_source_attribute combined
       ON combined.language_id = l.id AND combined.source = 'Combined'
LEFT JOIN language_source_attribute glot
       ON glot.language_id = l.id AND glot.source = 'Glottolog'
LEFT JOIN language_retirement ret
       ON ret.language_id = l.id
-- The languoid that CLAIMS the parent glottocode, where one does.
LEFT JOIN language_code_alias galias
       ON galias.alias_code = glot.parent_language_id
      AND galias.alias_kind = 'glottocode'
-- Aggregated in LATERAL subqueries rather than a GROUP BY over the whole join,
-- so the row count stays one per language and the aggregation runs per row
-- against the indexed foreign key.
LEFT JOIN LATERAL (
    -- SHORT KEYS, deliberately. The key names repeat once per source per
    -- language - five times across 27,378 rows - so `parent_language_id`
    -- against `p` is about 2 MB of the response. The mapper reads these in one
    -- place and the column they come from is named in the comment above.
    --   s=source  c=code  n=name  sc=scope  p=parent_language_id
    --   c1=code_6391  rr=retirement_reason
    SELECT json_agg(json_build_object(
               's', a.source,
               'c', a.code,
               'n', a.name,
               'sc', a.scope,
               'p', a.parent_language_id,
               'c1', a.code_6391,
               'rr', a.retirement_reason
           ) ORDER BY a.source) AS rows
      FROM language_source_attribute a
     WHERE a.language_id = l.id
) attrs ON true
LEFT JOIN LATERAL (
    -- Only the kinds the mapper reads. `iso639-2t` is stored and never used.
    -- Same reasoning: a=alias_code, k=alias_kind.
    SELECT json_agg(json_build_object(
               'a', c.alias_code,
               'k', c.alias_kind
           ) ORDER BY c.alias_code) AS rows
      FROM language_code_alias c
     WHERE c.language_id = l.id
       AND c.alias_kind IN ('glottocode', 'iso639-2b')
) aliases ON true;

GRANT SELECT ON api.language TO langnav_read;

-- PostgREST caches the schema; a view added while it is running is invisible
-- until it reloads. The ETL signals this after applying schema files.
NOTIFY pgrst, 'reload schema';

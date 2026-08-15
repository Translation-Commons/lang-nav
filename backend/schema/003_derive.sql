-- ═══════════════════════════════════════════════════════════════════════════
--  003_derive.sql - derive-stage functions
--
--  Structure lives in 001_schema.sql and access paths in 002_indexes.sql.
--  This file holds computation: the functions that turn loaded rows into the
--  derived columns. It is separated for three reasons.
--
--    1. 001_schema.sql is the clean-install file. Every derive step added to it
--       is another change that has to be applied to a live database by hand,
--       which is how a schema file drifts from what is actually installed.
--    2. Every function here is CREATE OR REPLACE and every body is
--       re-runnable, so applying this file to a running database and running it
--       during a fresh install produce the same result.
--    3. The derive chain runs D3 through D11. Keeping the steps together, in
--       execution order, beats scattering them through the table definitions.
--
--  Apply after 001_schema.sql. Order against 002_indexes.sql does not matter.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;


-- ── D3  Territory roll-up ──────────────────────────────────────────────────
-- Ports computeTerritoryStats.ts. Territory groups (World, Continent, Region,
-- Subcontinent) hold no data of their own; their figures are aggregates of the
-- countries and dependencies beneath them in the GEOGRAPHIC hierarchy. The
-- political hierarchy is deliberately not used: Greenland's population belongs
-- to Northern America, not to Denmark.
--
-- Four semantics are copied exactly from the TypeScript, and they are not
-- uniform. Getting one wrong produces a plausible number rather than an error.
--
--   population, land_area_km2   OVERWRITTEN by the child sum, but only when
--                               that sum is non-zero (`if (newPopulation)`)
--   gdp, literacy_percent       FILLED ONLY IF UNSET (`??=`)
--   literacy_percent            weighted by child population, not a plain mean
--
-- ONE DELIBERATE DIVERGENCE. In the TypeScript the gdp and literacy lines sit
-- outside the isTerritoryGroup() block, so a country with no GDP figure gets
-- `0` rather than being left unknown, and its literacy becomes `0 / population`
-- = 0. Storing a fabricated zero as though it were a measurement is the same
-- mistake as the +/-0.01 tie-breakers this project has already removed. Leaves
-- keep NULL here, and the gap is written to data_quality_finding instead. As of
-- 2026-08-04 all 257 leaves carry both figures, so this changes no current row.
--
-- Runs bottom-up by depth because a parent must see finished children. That
-- ordering is unavoidable for the coordinates, whose 4th-root weighting is
-- non-linear and therefore cannot be flattened into one pass over the closure
-- table the way the four scalar columns could.
CREATE OR REPLACE FUNCTION rebuild_territory_rollup(p_run_id uuid)
RETURNS void AS $$
DECLARE
  d int;
BEGIN
  -- Seed. The ETL loads only population_from_un; `population` is derived and
  -- arrives NULL. loadTerritories.ts:25-26 does exactly this, populating both
  -- from the same column with the comment "This may be recomputed later".
  -- Groups are seeded too, then overwritten below wherever a child sum exists.
  UPDATE territory SET population = population_from_un;

  FOR d IN
    SELECT DISTINCT ta.depth
      FROM territory_ancestry ta
     WHERE ta.hierarchy = 'geographic' AND ta.ancestor_id = '001'
     ORDER BY ta.depth DESC
  LOOP

    -- Pass 1: population and land area. Overwrite semantics.
    -- NULLIF(...,0) reproduces `if (newPopulation)`: a zero sum leaves the
    -- seeded value alone rather than blanking a group that has a UN figure.
    UPDATE territory p
       SET population    = COALESCE(NULLIF(agg.pop, 0), p.population),
           land_area_km2 = COALESCE(NULLIF(agg.area, 0), p.land_area_km2)
      FROM (
            SELECT c.contained_un_region_id AS parent_id,
                   SUM(c.population)::bigint       AS pop,
                   SUM(c.land_area_km2)            AS area
              FROM territory c
             WHERE c.contained_un_region_id IS NOT NULL
             GROUP BY c.contained_un_region_id
           ) agg
     WHERE p.id = agg.parent_id
       -- EXISTS rather than a join: the FROM clause of an UPDATE cannot
       -- reference the target table, so territory_scope has to be tested here.
       AND EXISTS (SELECT 1 FROM territory_scope ts
                    WHERE ts.id = p.scope AND ts.is_group)
       AND EXISTS (SELECT 1 FROM territory_ancestry ta
                    WHERE ta.hierarchy = 'geographic'
                      AND ta.ancestor_id = '001'
                      AND ta.descendant_id = p.id
                      AND ta.depth = d);

    -- Pass 2: gdp and literacy. Fill-only semantics, and separated from pass 1
    -- because the literacy denominator is the population that pass 1 just
    -- wrote. A child contributing no literacy figure still counts in the
    -- denominator, which matches the TypeScript and understates the average
    -- wherever a source is incomplete.
    UPDATE territory p
       SET gdp              = COALESCE(p.gdp, agg.gdp),
           literacy_percent = COALESCE(
                                p.literacy_percent,
                                agg.literacy_weighted / NULLIF(p.population, 0)
                              )
      FROM (
            SELECT c.contained_un_region_id AS parent_id,
                   SUM(c.gdp)::bigint AS gdp,
                   SUM(c.literacy_percent * c.population) AS literacy_weighted
              FROM territory c
             WHERE c.contained_un_region_id IS NOT NULL
             GROUP BY c.contained_un_region_id
           ) agg
     WHERE p.id = agg.parent_id
       -- EXISTS rather than a join: the FROM clause of an UPDATE cannot
       -- reference the target table, so territory_scope has to be tested here.
       AND EXISTS (SELECT 1 FROM territory_scope ts
                    WHERE ts.id = p.scope AND ts.is_group)
       AND EXISTS (SELECT 1 FROM territory_ancestry ta
                    WHERE ta.hierarchy = 'geographic'
                      AND ta.ancestor_id = '001'
                      AND ta.descendant_id = p.id
                      AND ta.depth = d);

    -- Pass 3: coordinates. Ports averageCoordinates.ts - project each child
    -- onto the unit sphere, take a weighted mean in 3D, convert back. A plain
    -- mean of latitude and longitude is wrong across the antimeridian and near
    -- the poles, which is why the detour through Cartesian space exists.
    --
    -- Weight is the FOURTH ROOT of land area, so that one large country does
    -- not drag a region's marker onto itself. Children with no coordinates or
    -- no area are skipped entirely, exactly as getEntityWeight() > 0 does.
    --
    -- The TypeScript divides x, y and z by the total weight before calling
    -- atan2. That division is omitted here on purpose: both atan2 arguments
    -- scale by the same positive constant, which cancels. Computing it would
    -- add a denominator that provably cannot change the answer.
    UPDATE territory p
       SET latitude  = agg.lat,
           longitude = agg.lon
      FROM (
            SELECT c.contained_un_region_id AS parent_id,
                   degrees(atan2(
                     SUM(sin(radians(c.latitude)) * w.weight),
                     sqrt(
                       POWER(SUM(cos(radians(c.latitude)) * cos(radians(c.longitude)) * w.weight), 2)
                     + POWER(SUM(cos(radians(c.latitude)) * sin(radians(c.longitude)) * w.weight), 2)
                     )
                   )) AS lat,
                   degrees(atan2(
                     SUM(cos(radians(c.latitude)) * sin(radians(c.longitude)) * w.weight),
                     SUM(cos(radians(c.latitude)) * cos(radians(c.longitude)) * w.weight)
                   )) AS lon
              FROM territory c
              CROSS JOIN LATERAL (
                    SELECT POWER(c.land_area_km2::double precision, 0.25) AS weight
                   ) w
             WHERE c.contained_un_region_id IS NOT NULL
               AND c.latitude  IS NOT NULL
               AND c.longitude IS NOT NULL
               AND c.land_area_km2 > 0
             GROUP BY c.contained_un_region_id
           ) agg
     WHERE p.id = agg.parent_id
       AND EXISTS (SELECT 1 FROM territory_scope ts
                    WHERE ts.id = p.scope AND ts.is_group)
       AND p.id <> '001'          -- the world is pinned below, not averaged
       AND EXISTS (SELECT 1 FROM territory_ancestry ta
                    WHERE ta.hierarchy = 'geographic'
                      AND ta.ancestor_id = '001'
                      AND ta.descendant_id = p.id
                      AND ta.depth = d);

  END LOOP;

  -- computeRegionCoordinates() special-cases the world to the origin rather
  -- than averaging it, because the weighted centroid of every landmass is a
  -- point in north-eastern Africa and a marker there reads as a claim.
  UPDATE territory SET latitude = 0, longitude = 0 WHERE id = '001';

  -- Writing population: how many people here can read and write at all, in any
  -- language. Added upstream 2026-08-05 as TerritoryData.pop.writing.
  --
  -- Runs after the loop, not inside it, because it depends only on this
  -- territory's own finished population and literacy - there is nothing to
  -- roll up. The `??=` in the TypeScript is a fill-only, but nothing else
  -- writes this column, so a plain assignment is equivalent and clearer.
  UPDATE territory
     SET population_writing =
           ROUND(COALESCE(population, 0) * COALESCE(literacy_percent, 0) / 100.0)
   WHERE population IS NOT NULL;

  -- Record the gaps rather than filling them with zeroes. A territory that
  -- holds data of its own and is missing one of these figures is a hole in the
  -- source files, and the roll-up above silently understates every ancestor's
  -- literacy because of it.
  INSERT INTO data_quality_finding (entity_id, field, severity, message, run_id)
  SELECT t.id, 'territory.' || m.field, 'info',
         'D3 roll-up: no ' || m.field || ' for this territory. Left NULL '
         || 'rather than defaulted to 0; it contributes nothing to its '
         || 'ancestors'' totals.',
         p_run_id
    FROM territory t
    JOIN territory_scope ts ON ts.id = t.scope
   CROSS JOIN LATERAL (VALUES
           ('gdp',              t.gdp IS NULL),
           ('literacy_percent', t.literacy_percent IS NULL),
           ('population',       t.population IS NULL)
         ) AS m(field, missing)
   WHERE NOT ts.is_group AND m.missing
     -- The function is re-runnable, so a second call inside one ingest run
     -- must not duplicate what the first one already reported.
     AND NOT EXISTS (
           SELECT 1 FROM data_quality_finding f
            WHERE f.run_id = p_run_id
              AND f.entity_id = t.id
              AND f.field = 'territory.' || m.field);

  ANALYZE territory;
END $$ LANGUAGE plpgsql;

-- ── D4  Locale population from censuses ────────────────────────────────────
-- Ports computeLocalesPopulationFromCensuses.ts.
--
-- READ THIS BEFORE COMPARING AGAINST 09_Derived_Data_Pipeline.md §3.2. That
-- document describes an older version of the frontend and is wrong in four
-- ways: the ranking is a continuous score rather than an ordered rules array
-- with feature flags; the year IS active, not disabled; the percentage divides
-- by the CENSUS population, not the territory's; and a locale picks two
-- winners, one for speaking and one for writing, not one. It also omits the
-- branch for locales with no census records at all, which is most of them.
--
-- Two helper functions first, because both are lookup tables that read far
-- better as functions than as inlined CASE expressions repeated four times.

-- Ports getLanguageModalityDiscount.ts. When a source reports one number for a
-- language, that number means different things depending on how the language is
-- actually used: a count for a sign language says nothing about writers, and a
-- count for a liturgical written language says little about speakers.
--
-- The modality axis runs written(-2) .. spoken(2), with sign(3) apart. See the
-- COMMENT on language_modality.
CREATE OR REPLACE FUNCTION language_modality_discount(p_modality smallint, p_use text)
RETURNS numeric AS $$
  SELECT CASE
    -- Unknown modality is not discounted. 26,353 of 27,299 languages take this
    -- branch, and the frontend does exactly the same.
    WHEN p_modality IS NULL THEN 1.0
    WHEN p_use = 'speaking' THEN
      CASE p_modality
        WHEN  3 THEN 1.0    -- Sign: grouped with speaking for informal contexts
        WHEN  2 THEN 1.0    -- Spoken
        WHEN  1 THEN 1.0    -- Mostly Spoken
        WHEN  0 THEN 1.0    -- Spoken & Written
        WHEN -1 THEN 0.1    -- Mostly Written: technically speakable, heavily discounted
        WHEN -2 THEN 0.0    -- Written: not spoken at all
      END
    ELSE
      CASE p_modality
        WHEN  3 THEN 0.0    -- Sign: not directly written
        WHEN  2 THEN 0.0    -- Spoken: may have a written form, no written tradition
        WHEN  1 THEN 0.1    -- Mostly Spoken
        WHEN  0 THEN 1.0    -- Spoken & Written
        WHEN -1 THEN 0.0    -- Mostly Written
        WHEN -2 THEN 1.0    -- Written
      END
  END::numeric
$$ LANGUAGE sql IMMUTABLE;

-- Ports computeCensusRecordPriority(), which REPLACED getPopulationRecordRank()
-- upstream on 2026-08-11 (PR #745). A continuous score, not a rule hierarchy:
-- every factor contributes to one number and the highest wins.
--
-- The shape changed, not just the constants. The old version added four terms
-- of whatever magnitude each happened to have; this one scores each factor on
-- a nominal 0..1 scale and multiplies by an explicit weight, so the weights
-- are now readable as the relative importance they express:
--
--   language use 0.6, year 0.2, acquisition order 0.1, population 0.1
--
-- Every term's effective size moved as a result. Recency in particular fell
-- from +0.625 to +0.2 for a 2025 census against a 1.0 -> 0.6 'Speaks' term,
-- so it is roughly half as decisive as it was. This is the SECOND upstream
-- reweighting of this function; see the impl_plan's session-sync rule.
--
-- collector_type is deliberately absent. It is commented out in the frontend,
-- and census_collector_rank() already exists in 001_schema.sql for when it is
-- turned back on; adding it here would silently change today's answers.
CREATE OR REPLACE FUNCTION census_record_rank(
  p_language_use        census_language_use,
  p_year_collected      smallint,
  p_acquisition_order   text,
  p_population_percent  numeric,
  p_population_estimate bigint,
  p_use                 text
) RETURNS numeric AS $$
  SELECT
    -- What the census actually asked. Still the dominant term.
    0.6 * CASE WHEN p_use = 'speaking' THEN
      CASE p_language_use
        WHEN 'Speaks'      THEN 1.0
        WHEN 'Uses'        THEN 0.5
        WHEN 'Understands' THEN 0.5
        WHEN 'Ethnicity'   THEN 0.05
        ELSE 0.0                      -- includes NULL: 2,412 records have none
      END
    ELSE
      CASE p_language_use
        WHEN 'Writes'    THEN 1.0
        WHEN 'Uses'      THEN 0.75
        WHEN 'Reads'     THEN 0.5
        WHEN 'Ethnicity' THEN -0.05   -- ethnicity actively counts AGAINST writing
        ELSE 0.0
      END
    END
    -- Recency. Divisor is now 25 with a 0.2 weight, i.e. (year-2000)/125
    -- effective, against (year-2000)/40 before.
    -- 2025 -> +0.2, 2010 -> +0.08, 2000 -> 0, 1984 -> -0.128.
    + 0.2 * ((p_year_collected - 2000) / 25.0)
    -- Whether the census counted any speaker or only first-language speakers.
    -- Rescaled to 0..1 upstream, so the spread between 'Any' and 'L2' widened
    -- slightly even though the weight caps it at the same 0.1 it had before.
    + 0.1 * CASE p_acquisition_order
        WHEN 'Any' THEN 1.0
        WHEN 'L1'  THEN 0.5
        WHEN 'L2'  THEN 0.25
        ELSE 0.0                      -- 'L3' scores 0 explicitly; so does NULL
      END
    -- Mild preference for the larger figure, as a tie-breaker - EXCEPT that a
    -- record of under ten people is now actively penalised. Upstream's reason:
    -- "It's probably just a 'has population' signal, not a true estimate."
    -- That -1 is a whole factor, so it costs 0.1 of the total score, which is
    -- enough to lose to an otherwise equal record but not enough to outweigh
    -- the language-use term.
    --
    -- A NULL estimate falls through to the ELSE rather than being treated as
    -- small; the column is NOT NULL upstream, so this only guards the
    -- percentage-only call path.
    + 0.1 * CASE
        WHEN p_population_estimate < 10 THEN -1.0
        ELSE COALESCE(p_population_percent, 0) / 100.0
      END
$$ LANGUAGE sql IMMUTABLE;


-- Ports getPopulationSourceCategoryForCensus.tsx, added upstream 2026-08-05.
-- Answers "how much should a reader trust this number", derived from who
-- collected the census rather than from anything a contributor typed.
CREATE OR REPLACE FUNCTION census_population_source_category(
  p_presenter_org_id text,
  p_collector_type   census_collector_type
) RETURNS population_source_category AS $$
  SELECT CASE
    -- CLDR republishes other people's figures, so it is checked before the
    -- collector: the presenter is the meaningful attribution in that case.
    --
    -- 'org.CLDR', not 'CLDR': organisation ids carry an `org.` prefix here
    -- (org.UNdata, org.AXL), whereas the frontend compares against a bare name.
    -- As of 2026-08-05 no census has a CLDR presenter, so this branch matches
    -- zero rows; it is here so that it works the day one appears rather than
    -- silently classifying it as Other.
    WHEN p_presenter_org_id = 'org.CLDR' THEN 'CLDR'
    WHEN p_collector_type = 'Government' THEN 'Official'
    WHEN p_collector_type = 'Study'      THEN 'Study'
    ELSE 'Other'   -- NGO, Media, Secondary, Unknown
  END::population_source_category
$$ LANGUAGE sql IMMUTABLE;


CREATE OR REPLACE FUNCTION rebuild_locale_population_from_censuses(p_run_id uuid)
RETURNS void AS $$
BEGIN
  -- Reset every column this function owns, so a re-run cannot leave a stale
  -- winner behind. The *_unadjusted columns are NOT reset: they hold the
  -- curated figure from locales.tsv and this step must not destroy it.
  UPDATE locale SET
    pop_speaking_adjusted  = NULL,
    pop_speaking_percent   = NULL,
    pop_speaking_census_id = NULL,
    pop_writing_percent    = NULL,
    pop_writing_adjusted   = NULL,
    pop_writing_census_id  = NULL,
    pop_speaking_source_derived = NULL,
    pop_writing_source_derived  = NULL,
    pop_speaking_unadjusted_derived = NULL,
    pop_writing_unadjusted_derived  = NULL,
    literacy_percent       = NULL;

  -- ── Pass 1: the 3,100 locales that have census records ──────────────────
  --
  -- The join reproduces connectCensuses.ts exactly: a census attaches to the
  -- locale whose id is languageCode || '_' || isoRegionCode. That is an id
  -- match, not a (language, territory) match, so a locale carrying a script or
  -- variant subtag never receives census records. Preserved deliberately; a
  -- looser join would attach Mandarin's Taiwanese censuses to zho_Hant_TW and
  -- change numbers the site shows today.
  --
  -- language_id and territory_id are carried through the CTE rather than joined
  -- at the end, because the FROM clause of an UPDATE cannot reference the
  -- target table. Joining `locale` again there is the trap that broke D3.
  WITH records AS (
    SELECT lo.id           AS locale_id,
           lo.language_id,
           lo.territory_id,
           c.id            AS census_id,
           -- The head-count as reported. applyPopRecord() line 93 assigns this
           -- straight over pop.unadjusted, for both uses. It lands in the
           -- *_unadjusted_derived columns rather than over the curated ones.
           cle.population_estimate AS estimate,
           -- The denominator is the CENSUS population, not the territory's.
           -- NULLIF on population_with_positive_responses reproduces the JS
           -- `||`, which falls through on 0 as well as on null.
           -- LEAST guards locale_speaking_pct_range; it clamps 0 rows today.
           LEAST(
             cle.population_estimate * 100.0
               / NULLIF(COALESCE(NULLIF(c.population_with_positive_responses, 0),
                                 c.population), 0),
             100
           ) AS pct,
           c.language_use,
           c.year_collected,
           c.acquisition_order,
           c.presenter_org_id,
           c.collector_type
      FROM census_language_estimate cle
      JOIN census c  ON c.id = cle.census_id
      JOIN locale lo ON lo.id = cle.language_id || '_' || c.territory_id
  ),
  ranked AS (
    SELECT r.*,
           -- Two independent rankings over the same records. A locale can take
           -- its speaker count from a 2020 'Speaks' census and its writer count
           -- from a 2011 'Writes' one, which is the entire point of scoring the
           -- same records twice.
           --
           -- census_id is a deterministic tie-break. JS Array.sort is stable, so
           -- ties there keep file order; SQL cannot reproduce that and it would
           -- not survive a reload anyway.
           ROW_NUMBER() OVER (
             PARTITION BY r.locale_id
             ORDER BY census_record_rank(r.language_use, r.year_collected,
                                         r.acquisition_order, r.pct, r.estimate,
                                         'speaking') DESC,
                      r.census_id
           ) AS rn_speaking,
           ROW_NUMBER() OVER (
             PARTITION BY r.locale_id
             ORDER BY census_record_rank(r.language_use, r.year_collected,
                                         r.acquisition_order, r.pct, r.estimate,
                                         'writing') DESC,
                      r.census_id
           ) AS rn_writing
      FROM records r
  ),
  -- Collapse the two winning rows per locale into one, so the UPDATE below
  -- touches each locale exactly once. An UPDATE with two matching FROM rows
  -- would apply an arbitrary one of them and silently drop the other.
  winners AS (
    SELECT locale_id,
           MAX(language_id)  AS language_id,
           MAX(territory_id) AS territory_id,
           MAX(census_id)   FILTER (WHERE rn_speaking = 1) AS s_census_id,
           MAX(pct)         FILTER (WHERE rn_speaking = 1) AS s_pct,
           MAX(estimate)    FILTER (WHERE rn_speaking = 1) AS s_estimate,
           bool_or(language_use = 'Speaks')
                            FILTER (WHERE rn_speaking = 1) AS s_precise,
           MAX(census_id)   FILTER (WHERE rn_writing = 1)  AS w_census_id,
           MAX(pct)         FILTER (WHERE rn_writing = 1)  AS w_pct,
           MAX(estimate)    FILTER (WHERE rn_writing = 1)  AS w_estimate,
           bool_or(language_use IN ('Writes', 'Reads'))
                            FILTER (WHERE rn_writing = 1)  AS w_precise,
           -- max() over a one-row group: just "the winning row's value".
           max(census_population_source_category(presenter_org_id, collector_type))
                            FILTER (WHERE rn_speaking = 1) AS s_source,
           max(census_population_source_category(presenter_org_id, collector_type))
                            FILTER (WHERE rn_writing = 1)  AS w_source
      FROM ranked
     WHERE rn_speaking = 1 OR rn_writing = 1
     GROUP BY locale_id
  )
  UPDATE locale lo SET
    pop_speaking_census_id = w.s_census_id,
    pop_speaking_percent   = w.s_pct,
    -- What the census actually counted, kept beside the curated figure rather
    -- than on top of it. D5 sums these, not the curated ones.
    pop_speaking_unadjusted_derived = w.s_estimate,
    pop_writing_unadjusted_derived  = w.w_estimate,
    -- The DERIVED source columns only. pop_speaking_source holds curated
    -- attribution from locales.tsv and must survive this step untouched, so
    -- that a contributor's claim and the census's implication stay comparable.
    pop_speaking_source_derived = w.s_source,
    pop_writing_source_derived  = w.w_source,
    -- percentAdjusted / 100 * territory population, rounded.
    -- `territory?.population || 1` in the TypeScript, hence the fallback to 1.
    -- Discounts apply ONLY when the record is imprecise for this use: a
    -- 'Speaks' census needs no interpretation to count speakers.
    -- Speaking never takes a literacy discount; only writing does.
    pop_speaking_adjusted  = ROUND(
      w.s_pct
        * CASE WHEN COALESCE(w.s_precise, false) THEN 1
               ELSE language_modality_discount(l.modality, 'speaking') END
        / 100.0
        * COALESCE(NULLIF(t.population, 0), 1)
    ),
    pop_writing_census_id  = w.w_census_id,
    pop_writing_percent    = w.w_pct,
    pop_writing_adjusted   = ROUND(
      w.w_pct
        * CASE WHEN COALESCE(w.w_precise, false) THEN 1
               ELSE language_modality_discount(l.modality, 'writing')
                    -- Literacy discount: a count of people who USE a language
                    -- overstates how many can write it, in proportion to how
                    -- many people in that territory can write at all.
                    * COALESCE(t.literacy_percent, 100) / 100.0 END
        / 100.0
        * COALESCE(NULLIF(t.population, 0), 1)
    )
  FROM winners w
  LEFT JOIN language  l ON l.id = w.language_id
  LEFT JOIN territory t ON t.id = w.territory_id
  WHERE lo.id = w.locale_id;

  -- ── Pass 2: locales with no census records ──────────────────────────────
  --
  -- Ports computePopulationWithoutCensusRecords(). Most locales land here:
  -- 9,040 carry a curated figure and only 3,100 have any census at all.
  --
  -- Discounts are applied unconditionally in this branch, unlike pass 1: a
  -- hand-curated number carries no statement about what was actually measured,
  -- so it always needs interpreting.
  --
  -- Note the asymmetry, which is in the TypeScript and is preserved here:
  -- speaking scales the RAW COUNT by its discount, while writing goes through
  -- the percentage and back out via the territory population. The two produce
  -- different answers whenever the curated figure disagrees with the territory
  -- total, and the frontend has always worked this way.
  UPDATE locale lo SET
    pop_speaking_percent  = pass2.s_pct,
    pop_speaking_adjusted = ROUND(lo.pop_speaking_unadjusted * pass2.s_discount),
    -- No census to overwrite it, so the derived head-count is a copy of the
    -- curated one. Writing takes the SPEAKING figure, which is what
    -- computePopulationWithoutCensusRecords() line 75 does.
    pop_speaking_unadjusted_derived = lo.pop_speaking_unadjusted,
    pop_writing_unadjusted_derived  = lo.pop_speaking_unadjusted,
    pop_writing_percent   = pass2.s_pct,
    pop_writing_adjusted  = ROUND(
      pass2.s_pct * pass2.w_discount * pass2.literacy_discount
        / 100.0 * pass2.territory_population
    )
  FROM (
    SELECT lo2.id AS locale_id,
           LEAST(lo2.pop_speaking_unadjusted * 100.0
                   / COALESCE(NULLIF(t2.population, 0), 1), 100) AS s_pct,
           language_modality_discount(l2.modality, 'speaking')   AS s_discount,
           language_modality_discount(l2.modality, 'writing')    AS w_discount,
           COALESCE(t2.literacy_percent, 100) / 100.0            AS literacy_discount,
           COALESCE(NULLIF(t2.population, 0), 1)                 AS territory_population
      FROM locale lo2
      LEFT JOIN language  l2 ON l2.id = lo2.language_id
      LEFT JOIN territory t2 ON t2.id = lo2.territory_id
     WHERE lo2.pop_speaking_unadjusted IS NOT NULL
       AND lo2.pop_speaking_census_id IS NULL   -- pass 1 did not claim it
       -- D6 stores a family locale's PRE-CENSUS sum in pop_speaking_unadjusted,
       -- which is the same meaning the column has for a curated row and is what
       -- lets D5's cutoff work unchanged. It also makes this pass's predicate
       -- match a generated row. D6 deletes and rebuilds its rows immediately
       -- after D4, so today the write would be discarded - but "correct because
       -- of what runs next" is not a property worth depending on.
       AND lo2.locale_source NOT IN ('createRegionalLocales', 'createFamilyLocales')
  ) pass2
  WHERE lo.id = pass2.locale_id;

  -- ── Pass 3: locale-specific literacy ────────────────────────────────────
  --
  -- This is NOT a copy of the territory's rate. Latin in Italy and Italian in
  -- Italy have the same territory and very different literacy: the ratio of
  -- writers to speakers is a property of the locale. The territory value is
  -- only the fallback for when one side of the ratio is missing.
  --
  -- The TypeScript tests both sides for truthiness, so a zero on either side
  -- falls back rather than producing 0 or a division by zero.
  UPDATE locale lo SET
    literacy_percent = CASE
      WHEN COALESCE(lo.pop_speaking_adjusted, 0) <> 0
       AND COALESCE(lo.pop_writing_adjusted, 0)  <> 0
      THEN LEAST(lo.pop_writing_adjusted * 100.0 / lo.pop_speaking_adjusted, 100)
      ELSE t.literacy_percent
    END
  FROM territory t
  WHERE t.id = lo.territory_id
    -- The one place D4 can reach a row D5 or D6 owns. Neither gets a territory
    -- fallback: computeAggregatedLocalesPopulation.ts:22-25 leaves regional
    -- literacy undefined, and a family locale's literacy is set by D6 from its
    -- own writers-to-speakers ratio. Letting this branch fire would write a
    -- value the next step has to undo, and would leave a wrong one behind if
    -- D4 were ever run on its own afterwards.
    AND lo.locale_source NOT IN ('createRegionalLocales', 'createFamilyLocales');

  ANALYZE locale;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_locale_population_from_censuses(uuid) IS
  'D4. Chooses a winning census per locale, separately for speaking and for '
  'writing, and derives the population, percentage and locale literacy rate. '
  'Idempotent: resets the columns it owns on every call. Ports '
  'src/features/data/compute/computeLocalesPopulationFromCensuses.ts. It does '
  'NOT overwrite the *_unadjusted columns the way the frontend overwrites its '
  'in-memory equivalents: those hold the curated figure from locales.tsv, and '
  'the census figure remains reachable through pop_speaking_census_id.';

-- ── D5  Regional locales ───────────────────────────────────────────────────
-- Ports TWO frontend functions, because neither is useful on its own:
--
--   createRegionalLocales.ts                      creates the rows and applies
--                                                 the > 10 cutoff
--   computeAggregatedLocalesPopulation.ts:11-61   the numbers the site shows
--
-- Locale input data stops at countries and dependencies. This synthesises the
-- missing rows for the 32 territory GROUPS, so that "English worldwide" and
-- "Spanish in South America" exist as locales at all. It is the step that
-- finally makes territory_stats meaningful for the World and the continents.
--
-- READ THIS BEFORE COMPARING AGAINST Archive/09_Derived_Data_Pipeline.md. That
-- document has been wrong about every derive step so far; §9.3 and §9.5 of the
-- implementation plan list seven verified defects. Everything below was read
-- out of src/ on 2026-08-05.
--
-- FOUR SEMANTICS THAT LOOK LIKE DETAIL AND ARE NOT.
--
-- 1. TWO PARALLEL SUMS, over the same tree, with different inputs.
--    createRegionalLocales runs during CoreData, BEFORE census data loads, so
--    its > 10 cutoff sees the CURATED figures from locales.tsv.
--    computeRegionalLocalesPopulation runs afterwards and sums the
--    CENSUS-OVERWRITTEN ones, because applyPopRecord() assigns the winning
--    census estimate straight over pop.speaking.unadjusted. They differ by
--    enough to matter: Hindi worldwide is 695,657,316 from the censuses and
--    1,250,398,350 from locales.tsv. So the loop below carries both. The cutoff
--    sum is scaffolding and is deliberately not persisted anywhere.
--
-- 2. THE CUTOFF IS APPLIED AT EVERY LEVEL, not once at the end. A locale with
--    five speakers is dropped at its subregion and therefore never reaches the
--    continent. A flat "sum all leaf descendants" roll-up is a different, and
--    wrong, number.
--
-- 3. A GROUP CONTRIBUTES ONLY ITS GENERATED LOCALES. createRegionalLocales
--    REPLACES territory.locales wholesale for a group, so a curated locale
--    sitting on a group territory - there are 30, mostly constructed languages
--    at the World - is excluded from its parent's sum. Leaves contribute
--    everything attached to them regardless of source, which is what makes
--    this forward-compatible with D6: family locales will be picked up with no
--    change here.
--
-- 4. LITERACY DOES NOT FALL BACK. D4 pass 3 copies the territory rate when
--    either side of the writers-to-speakers ratio is missing. This step leaves
--    NULL instead, because computeAggregatedLocalesPopulation.ts:22-25 does.
--
-- IDS. Generated rows take 'reg.' || the locale code, with entity.code_display
-- holding the bare code - the same split the schema already uses for
-- org.StatCAN -> StatCAN. locale.id is a single-row primary key but the UNIQUE
-- constraint deliberately admits a curated AND a generated row for the same
-- (language, script, territory, variant); without a prefix those two facts
-- cannot both be stored. Four rows collide today (epo_001, ido_001, ina_001,
-- und_001) and D6 will add tens of thousands more candidates, so the rule is
-- uniform rather than collision-triggered. The frontend resolves the same
-- clash by overwriting, which loses the curated row; this does not.
--
-- Generated rows write ONLY derived columns. That is not tidiness: it is what
-- makes D4 skip them, since its pass 2 keys off pop_speaking_unadjusted being
-- non-NULL and its pass 1 joins on an id no generated row can have.
--
-- The frontend's `if (pop.census) return` guard is not reproduced. It protects
-- a regional locale that received census records, and no census targets a
-- group territory - 0 of 445. This function deletes and recreates its rows, so
-- a generated row cannot be holding a census id when the sums are taken.
CREATE OR REPLACE FUNCTION rebuild_regional_locales(p_run_id uuid)
RETURNS void AS $$
DECLARE
  d int;
BEGIN
  -- Remove what a previous call created. The predicate cannot reach a curated
  -- row: locale_source is the discriminator and only this function writes
  -- 'createRegionalLocales'. Deleting from entity rather than locale is
  -- deliberate - it is the parent, so one statement also clears entity_name
  -- and locale_variant through ON DELETE CASCADE.
  DELETE FROM entity e
   WHERE e.type = 'Locale'
     AND EXISTS (SELECT 1 FROM locale l
                  WHERE l.id = e.id
                    AND l.locale_source = 'createRegionalLocales');

  -- Scaffolding for the level-by-level accumulation. It has to be a real table
  -- rather than a recursive CTE: pruning at each level feeds the next level's
  -- input, which a single recursive term cannot express.
  DROP TABLE IF EXISTS _regional_locale;
  CREATE TEMP TABLE _regional_locale (
    territory_id text NOT NULL,
    language_id  text NOT NULL,
    script_id    text,
    variant_key  text NOT NULL,
    -- The curated sum. Decides whether the row exists; never stored.
    cutoff_unadjusted       bigint,
    pop_speaking_unadjusted bigint,
    pop_writing_unadjusted  bigint,
    pop_speaking_adjusted   bigint,
    pop_writing_adjusted    bigint,
    code         text,
    name_display text
  ) ON COMMIT DROP;

  -- Bottom-up over the GEOGRAPHIC hierarchy, deepest group first, because a
  -- parent must see finished children. The political hierarchy is not used:
  -- Greenland's speakers belong to Northern America, not to Denmark.
  FOR d IN
    SELECT DISTINCT ta.depth
      FROM territory_ancestry ta
      JOIN territory t        ON t.id  = ta.descendant_id
      JOIN territory_scope ts ON ts.id = t.scope AND ts.is_group
     WHERE ta.hierarchy = 'geographic' AND ta.ancestor_id = '001'
     ORDER BY ta.depth DESC
  LOOP

    INSERT INTO _regional_locale (
      territory_id, language_id, script_id, variant_key,
      cutoff_unadjusted, pop_speaking_unadjusted, pop_writing_unadjusted,
      pop_speaking_adjusted, pop_writing_adjusted)
    SELECT p.id, s.language_id, s.script_id, s.variant_key,
           SUM(s.cutoff)::bigint,
           -- sumBy() coalesces each term to 0 and then maps a 0 total to
           -- undefined, so NULLIF reproduces it exactly. SUM already skips
           -- NULLs and already returns NULL when every term is NULL.
           NULLIF(SUM(s.s_unadj), 0)::bigint,
           NULLIF(SUM(s.w_unadj), 0)::bigint,
           NULLIF(SUM(s.s_adj),   0)::bigint,
           NULLIF(SUM(s.w_adj),   0)::bigint
      FROM territory p
      JOIN territory c         ON c.contained_un_region_id = p.id
      JOIN territory_scope cts ON cts.id = c.scope
      CROSS JOIN LATERAL (
            -- A leaf child contributes everything attached to it: its curated
            -- locales and the family locales D6 synthesises, which arrive here
            -- with no change to this branch.
            --
            -- ONE SOURCE ONLY, and this line is load-bearing. D6 generates a
            -- family locale per classification source, and this SELECT groups
            -- by (language, script, variant) with no source dimension - so
            -- without the filter, five sources' copies of `inc_IN` would all
            -- land in one bucket and be summed. A 5x regional overcount, and
            -- silent, because every individual number would still look
            -- reasonable. ISO is the source the frontend generates, so ISO is
            -- the one that reproduces the site.
            --
            -- The consequence is deliberate and was decided on 2026-08-05: a
            -- non-ISO family locale exists at country level and has no
            -- worldwide roll-up. Giving regional locales their own source
            -- dimension was the alternative and was deferred, because 146 of
            -- the 254 ISO family languoids also carry curated locales - which
            -- have no source - and would split into two regional rows where the
            -- frontend produces one. See FP-013.
            SELECT l.language_id, l.script_id, l.variant_key,
                   l.pop_speaking_unadjusted         AS cutoff,
                   l.pop_speaking_unadjusted_derived AS s_unadj,
                   l.pop_writing_unadjusted_derived  AS w_unadj,
                   l.pop_speaking_adjusted           AS s_adj,
                   l.pop_writing_adjusted            AS w_adj
              FROM locale l
             WHERE NOT cts.is_group
               AND l.territory_id = c.id
               AND (l.language_source IS NULL OR l.language_source = 'ISO')
            UNION ALL
            -- A group child contributes only what this function generated for
            -- it, because territory.locales was replaced for that group.
            SELECT r.language_id, r.script_id, r.variant_key,
                   r.cutoff_unadjusted, r.pop_speaking_unadjusted,
                   r.pop_writing_unadjusted, r.pop_speaking_adjusted,
                   r.pop_writing_adjusted
              FROM _regional_locale r
             WHERE cts.is_group
               AND r.territory_id = c.id
           ) s
     -- EXISTS rather than a join: the FROM clause of an UPDATE cannot
     -- reference the target table, and the same shape is kept here so the two
     -- level loops in this file read identically.
     WHERE EXISTS (SELECT 1 FROM territory_scope ts
                    WHERE ts.id = p.scope AND ts.is_group)
       AND EXISTS (SELECT 1 FROM territory_ancestry ta
                    WHERE ta.hierarchy    = 'geographic'
                      AND ta.ancestor_id  = '001'
                      AND ta.descendant_id = p.id
                      AND ta.depth = d)
     GROUP BY p.id, s.language_id, s.script_id, s.variant_key
    -- `.filter((loc) => (loc.pop.speaking.unadjusted ?? 0) > 10)`. Drops NULL
    -- as well as small, and it runs HERE so the survivors are what the next
    -- level up sees.
    HAVING COALESCE(SUM(s.cutoff), 0) > 10;

  END LOOP;

  -- getLocaleCode(loc, Underscore, territory.ID). Variants are lower-cased and
  -- dot-joined in variant_key, and the code wants them underscore-joined.
  UPDATE _regional_locale r
     SET code = concat_ws('_', r.language_id, r.script_id, r.territory_id,
                          NULLIF(replace(r.variant_key, '.', '_'), ''));

  -- getLocaleName(): languageName (territoryName, scriptName, variantNames).
  -- entity.name_display for the language is the canonical name rather than the
  -- source-specific one the frontend would use, because the source is a UI
  -- setting and this row has to be stored once.
  --
  -- Correlated subqueries rather than a FROM with joins, because a JOIN inside
  -- the FROM clause of an UPDATE cannot reference the update target. This is
  -- the same trap that broke D3 and D4; it bites once per derive step.
  UPDATE _regional_locale r
     SET name_display =
           (SELECT le.name_display FROM entity le
             WHERE le.id = r.language_id AND le.type = 'Language')
        || COALESCE(NULLIF(' (' || concat_ws(', ',
             (SELECT te.name_display FROM entity te
               WHERE te.id = r.territory_id AND te.type = 'Territory'),
             (SELECT we.name_display FROM entity we
               WHERE we.id = r.script_id AND we.type = 'WritingSystem'),
             (SELECT string_agg(ve.name_display, ', ' ORDER BY v.ord)
                FROM unnest(string_to_array(NULLIF(r.variant_key, ''), '.'))
                       WITH ORDINALITY AS v(code, ord)
                JOIN entity ve ON ve.id = v.code AND ve.type = 'Variant')
           ) || ')', ' ()'), '');

  INSERT INTO entity (id, type, code_display, name_display)
  SELECT 'reg.' || r.code, 'Locale', r.code, r.name_display
    FROM _regional_locale r;

  INSERT INTO locale (
    id, language_id, script_id, territory_id, locale_source, variant_key,
    pop_speaking_unadjusted_derived, pop_writing_unadjusted_derived,
    pop_speaking_adjusted, pop_writing_adjusted,
    pop_speaking_percent,  pop_writing_percent,
    pop_speaking_source_derived, pop_writing_source_derived,
    literacy_percent, source_ref)
  SELECT 'reg.' || r.code, r.language_id, r.script_id, r.territory_id,
         'createRegionalLocales', r.variant_key,
         r.pop_speaking_unadjusted, r.pop_writing_unadjusted,
         r.pop_speaking_adjusted,   r.pop_writing_adjusted,
         -- `pop.unadjusted / (territory.pop.overall || 1) * 100`, hence the
         -- fallback to 1. LEAST guards locale_speaking_pct_range; every clamp
         -- is reported below rather than passing silently.
         LEAST(r.pop_speaking_unadjusted * 100.0
                 / COALESCE(NULLIF(t.population, 0), 1), 100),
         LEAST(r.pop_writing_unadjusted * 100.0
                 / COALESCE(NULLIF(t.population, 0), 1), 100),
         'Aggregated from Territories', 'Aggregated from Territories',
         -- Both sides tested for truthiness, so a zero on either falls through
         -- to NULL rather than dividing by zero or storing a fabricated 0.
         CASE WHEN COALESCE(r.pop_speaking_adjusted, 0) <> 0
               AND COALESCE(r.pop_writing_adjusted,  0) <> 0
              THEN LEAST(r.pop_writing_adjusted * 100.0
                           / r.pop_speaking_adjusted, 100)
         END,
         'derived: rebuild_regional_locales'
    FROM _regional_locale r
    JOIN territory t ON t.id = r.territory_id;

  -- variantCodes are copied onto the regional locale, so the link rows are
  -- too. ORDER matters: slv_Latn_SI_bohoric_nedis is not its own reverse.
  INSERT INTO locale_variant (locale_id, variant_id, position)
  SELECT 'reg.' || r.code, v.code, v.ord
    FROM _regional_locale r
    CROSS JOIN LATERAL unnest(string_to_array(r.variant_key, '.'))
                       WITH ORDINALITY AS v(code, ord)
   WHERE r.variant_key <> ''
     AND EXISTS (SELECT 1 FROM variant vv WHERE vv.id = v.code);

  -- A region whose summed speakers exceed the people living in it is a
  -- contradiction in the source data, not a rounding artefact. The percentage
  -- had to be clamped to satisfy the CHECK constraint; say so rather than
  -- letting a 100 look measured.
  INSERT INTO data_quality_finding (entity_id, field, severity, message, run_id)
  SELECT 'reg.' || r.code, 'locale.pop_speaking_percent', 'warning',
         'D5 regional roll-up: the summed speaking population '
         || r.pop_speaking_unadjusted || ' exceeds the population of '
         || r.territory_id || ', which is ' || t.population
         || '. The percentage was clamped to 100. Some locale beneath this '
         || 'territory reports more speakers than its own territory holds '
         || 'people.',
         p_run_id
    FROM _regional_locale r
    JOIN territory t ON t.id = r.territory_id
   WHERE r.pop_speaking_unadjusted > COALESCE(NULLIF(t.population, 0), 1);

  ANALYZE locale;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_regional_locales(uuid) IS
  'D5. Synthesises the locale rows for the 32 territory GROUPS by rolling '
  'country and dependency locales up the geographic hierarchy, level by level. '
  'Ports src/features/data/connect/createRegionalLocales.ts together with '
  'computeRegionalLocalesPopulation from computeAggregatedLocalesPopulation.ts '
  '- the first decides which rows exist, the second decides what they say, and '
  'they sum different inputs. Idempotent: deletes every row it owns before '
  'rebuilding. Generated rows are identified by locale_source and take a '
  'reg. prefixed id, so a curated locale on the same territory survives.';

COMMENT ON FUNCTION rebuild_territory_rollup(uuid) IS
  'D3. Aggregates population, land area, GDP, literacy and coordinates from '
  'countries and dependencies up through the geographic hierarchy. Idempotent: '
  're-seeds population from population_from_un on every call. Ports '
  'src/features/data/compute/computeTerritoryStats.ts, except that leaf '
  'territories missing a GDP or literacy figure are left NULL and reported '
  'instead of being set to 0.';


-- ── D6  Family locales ─────────────────────────────────────────────────────
-- Ports TWO frontend functions, for the same reason D5 does: one decides which
-- rows exist, the other decides what they say, and they sum different inputs.
--
--   createFamilyLocales.ts                         creates the rows, from the
--                                                  CURATED populations
--   computeAggregatedLocalesPopulation.ts:63-125   the numbers the site shows,
--                                                  from the CENSUS-corrected
--                                                  ones
--
-- Locale data is recorded against languages, not against families. This
-- synthesises the missing rows so that "Indo-Aryan in India" exists as a locale
-- at all. It is what makes a family node sortable and reportable, and it is the
-- feature the browser could not afford: the frontend caps itself at ISO because
-- generating every source needed ~125 MB of heap.
--
-- ORDER. D4, then this, then D5. That is not a preference. updatePopulations.ts
-- lines 21-29 run the censuses, then the family sums, then the regional ones,
-- and connectObjects.ts:41 creates family locale ROWS before regional ones with
-- the comment "create them before regional locales". D5 is a full rebuild, so
-- re-running it afterwards is the entire integration.
--
-- ═══ ONE FUNCTION, CALLED ONCE PER CLASSIFICATION SOURCE ═══
--
-- The frontend hardcodes ISO (createFamilyLocales.ts:13) because generating
-- every source needed ~125 MB of browser heap. That limit does not apply here,
-- so p_source parameterises the tree and run.py calls this once per source.
-- FP-013 has the full history; three things about it are load-bearing.
--
-- 1. locale.language_source EXISTS BECAUSE OF THIS STEP. 257 languoids are a
--    family in more than one source, and for 80 of them the CHILD SET differs -
--    so "Indo-Aryan in India" genuinely has a different population under ISO
--    than under Glottolog. Both are correct. Without the column those 80
--    collide on locale_identity_key and whichever source ran last would
--    silently win. Curated and regional locales carry NULL, meaning "not
--    specific to a classification".
--
-- 2. ORDER MATTERS, AND ISO MUST RUN FIRST. Part B updates CURATED locales,
--    which are shared by every source, and it only does so on the ISO pass -
--    see the p_source = 'ISO' guard below. Running ISO first means every later
--    source reads curated rows that have already settled, so the result does
--    not depend on the order of the remaining four. run.py fixes the order and
--    a test pins it.
--
-- 3. D5 DELIBERATELY AGGREGATES ISO FAMILY LOCALES ONLY. Its leaf branch groups
--    by (language, script, variant) with no source dimension, so five sources'
--    copies of one family locale would all land in the same bucket and be
--    summed - a 5x regional overcount, silent. Giving regional locales their
--    own source dimension was considered and deferred: 146 of the 254 ISO
--    family languoids ALSO carry curated locales, which have no source, so they
--    would split from the generated ones into two regional rows where the
--    frontend produces one. Decision recorded 2026-08-05. The consequence is
--    that a non-ISO family locale exists at country level but has no worldwide
--    roll-up, which is a stated gap rather than a wrong number.
--
-- ═══ FIVE SEMANTICS THAT LOOK LIKE DETAIL AND ARE NOT ═══
--
-- 1. A CURATED LOCALE SHADOWS THE SUM. createLocalesForLanguageFamily returns
--    `language.locales`, not the child locales it just built, and it creates
--    nothing when a locale already exists at (family, territory). So zho_CN
--    keeps its own 1,274,436,000 and hides cmn_CN + yue_CN, and the family
--    above zho receives the curated figure rather than the sum. This is the
--    "a macrolanguage may already have data from a census" case named in
--    computeAggregatedLocalesPopulation.ts:110. 231 of the 1,619 candidate
--    rows are suppressed by it.
--
-- 2. TWO PARALLEL SUMS, over the same tree, with different inputs - the same
--    shape as D5. Part A runs during CoreData, before censuses, so it sums the
--    CURATED locales.tsv figures. Part B runs after and sums the
--    census-corrected ones. Collapsing them into one sum is the mistake that
--    was worth 44% on Hindi in D5.
--
-- 3b. THE TWO HALVES ALSO DISAGREE ABOUT WHICH SOURCE THEY WALK, and under one
--    source that is invisible. Part A reads SOURCE, a constant.
--    searchLocalesForMissingLinks.ts:34 HARDCODES language.ISO.parentLanguage.
--    They agree in the frontend only because SOURCE is ISO. Here p_source
--    drives both, which is the whole reason part B could be parameterised at
--    all - had it been ported as written it would walk the ISO tree while part
--    A built a Glottolog one, and every non-ISO row would be quietly wrong.
--
-- 3. PART A'S TERRITORY DENOMINATOR IS THE RAW UN FIGURE, NOT THE ROLLED-UP
--    ONE. createFamilyLocales runs in CoreData (CoreData.tsx:156);
--    computeContainedTerritoryStats does not run until SupplementalData
--    (SupplementalData.tsx:81), and territory.pop.speaking is not set until
--    then either, so `pop.speaking ?? pop.overall` is the territories.tsv
--    value. Identical to territory.population for all 257 leaves - D3 re-seeds
--    it and a golden check asserts it - and different for the 32 groups, which
--    is exactly where the 30 curated group-territory locales sit. Part B, which
--    runs after SupplementalData, correctly uses the rolled-up figure.
--
-- 4. PART A AND PART B WALK DIFFERENT GRAPHS. Part A walks the language tree
--    (`language[ISO].childLanguages`). Part B walks locale-to-locale edges
--    built by searchLocalesForMissingLinks.ts:34, which requires the child and
--    the parent locale to share script, territory AND variants, and connects
--    the DIRECT parent only. Part A never emits a locale with a script or a
--    variant, so for plain locales the two agree; for the curated script and
--    variant locales part B reaches only those pairs that happen to both exist.
--
-- 5. PART B UPDATES CURATED LOCALES TOO, and it is not a no-op. It can raise a
--    macrolanguage's population to the sum of its children, and it recomputes
--    literacy UNCONDITIONALLY for every locale that has child locales - so it
--    can replace a value D4 computed with NULL. That is what the frontend does.
--    It moves numbers D4 and D5 have already verified; that is expected.
--
-- COLUMN MAPPING, and why D5 needs no edit. Family locales mirror the curated
-- raw/derived split rather than D5's generated-columns-only rule:
--
--   pop_speaking_unadjusted          part A, the pre-census figure
--   pop_speaking_percent             part A
--   pop_speaking_unadjusted_derived  part B, the post-census figure
--   pop_speaking_adjusted            part B
--   pop_*_source_derived             'Aggregated from Languages'
--   the writing columns              part B only - part A sets `writing: {}`
--
-- D5's leaf branch already reads pop_speaking_unadjusted for its > 10 cutoff
-- and pop_speaking_unadjusted_derived for its sums, which is precisely the
-- pre/post-census split above. Its own comment says the branch was left open
-- for this. D4 runs before D6 and never sees these rows.
--
-- IDS. 'fam.' || the locale code, with entity.code_display holding the bare
-- code - the same split D5 uses for 'reg.' and the schema for org.StatCAN. It
-- is required, not cosmetic: a family locale on a group territory and a
-- regional locale for the same languoid carry the same code.
--
-- NOT PORTED, deliberately, each verified against src/ rather than assumed:
--   * uniqueBy(languageCode) in sumUpPopulationFromChildLanguages is a NO-OP.
--     Child locales share the parent's script, territory and variants, so two
--     of them cannot share a language code. Same finding as D5's uniqueBy.
--   * pop.percentAdjusted and relatedLocales.sumOfPopulationFromChildLanguages
--     have no column. Both are UI-only.
CREATE OR REPLACE FUNCTION rebuild_family_locales(p_run_id uuid,
                                                  p_source language_source)
RETURNS void AS $$
DECLARE
  d int;
  max_depth int;
BEGIN
  -- Remove what a previous call created, so the function is idempotent.
  -- Deleting from entity rather than locale is deliberate: it is the parent, so
  -- ON DELETE CASCADE also clears entity_name and locale_variant. The predicate
  -- cannot reach a curated row - locale_source is the discriminator and only
  -- this function ever writes 'createFamilyLocales'.
  DELETE FROM entity e
   WHERE e.type = 'Locale'
     AND EXISTS (SELECT 1 FROM locale l
                  WHERE l.id = e.id
                    AND l.locale_source = 'createFamilyLocales'
                    AND l.language_source = p_source);

  -- ── Part A: which rows exist, from the CURATED populations ───────────────

  -- Depth of every languoid in the ISO tree. Within one source
  -- language_source_attribute.parent_language_id is single-valued, so the graph
  -- is a forest and a node's depth is unique - unlike the union across sources,
  -- which is the DAG that forced language_ancestry to take MIN(depth).
  DROP TABLE IF EXISTS _lang_depth;
  CREATE TEMP TABLE _lang_depth ON COMMIT DROP AS
  SELECT l.id AS language_id,
         COALESCE((SELECT max(a.depth) FROM language_ancestry a
                    WHERE a.source = p_source AND a.descendant_id = l.id), 0) AS depth
    FROM language l;
  CREATE INDEX ON _lang_depth (depth);
  CREATE UNIQUE INDEX ON _lang_depth (language_id);

  -- What each languoid offers its parent. Seeded with the locales it already
  -- has, which is `language.locales` at the moment the recursion starts, then
  -- grown one level at a time. Script and variant locales are excluded here
  -- rather than at the join, because createFamilyLocales.ts:41-42 drops them
  -- from the CHILD list - they neither create a family locale nor contribute to
  -- one.
  DROP TABLE IF EXISTS _family_locale;
  CREATE TEMP TABLE _family_locale (
    language_id  text NOT NULL,
    territory_id text NOT NULL,
    is_generated boolean NOT NULL,
    pop_unadjusted bigint,
    -- The same sum before the territory cap. Carried for reporting only: the
    -- CAPPED value is what propagates upward, exactly as the running total in
    -- the TypeScript does. Never stored on the locale.
    pop_uncapped   bigint,
    code         text,
    name_display text
  ) ON COMMIT DROP;

  INSERT INTO _family_locale (language_id, territory_id, is_generated, pop_unadjusted)
  SELECT l.language_id, l.territory_id, false, l.pop_speaking_unadjusted
    FROM locale l
   WHERE l.script_id IS NULL
     AND l.variant_key = ''
     AND l.territory_id IS NOT NULL
     AND l.locale_source NOT IN ('createRegionalLocales', 'createFamilyLocales');
  CREATE INDEX ON _family_locale (language_id);

  SELECT max(depth) INTO max_depth FROM _lang_depth;

  -- Bottom-up, deepest first, because a family must see finished children. One
  -- statement per level is enough: in a forest every child of a node sits at
  -- exactly depth(node) + 1, so a node's generated row is written once.
  FOR d IN REVERSE max_depth .. 1 LOOP

    INSERT INTO _family_locale (language_id, territory_id, is_generated,
                                pop_unadjusted, pop_uncapped)
    SELECT lsa.parent_language_id, f.territory_id, true,
           -- `Math.min(child, territoryPop)` on creation and a clamp back to
           -- territoryPop whenever the running percent passes 100. Applying
           -- LEAST once to the total is equivalent and order-independent:
           -- min(min(a, cap) + b, cap) = min(a + b, cap) for a <= cap. A zero
           -- total becomes `undefined` in the TypeScript, hence NULLIF.
           --
           -- COALESCE on the cap is not defensive noise: LEAST IGNORES NULLs
           -- rather than propagating them, so a territory with no UN figure
           -- would silently keep the uncapped sum instead of collapsing to
           -- NULL the way `Math.min(x, undefined)` does. No territory has one
           -- today; the day one appears this stays right.
           NULLIF(LEAST(SUM(COALESCE(f.pop_unadjusted, 0)),
                        COALESCE(t.population_from_un, 0)), 0),
           NULLIF(SUM(COALESCE(f.pop_unadjusted, 0)), 0)
      FROM _family_locale f
      JOIN _lang_depth dep             ON dep.language_id = f.language_id
                                      AND dep.depth = d
      JOIN language_source_attribute lsa ON lsa.language_id = f.language_id
                                        AND lsa.source = p_source
                                        AND lsa.parent_language_id IS NOT NULL
      JOIN territory t                 ON t.id = f.territory_id
     -- The shadowing rule. `if (newLocale == null)` tests the whole locale
     -- dictionary, so an existing curated locale stops the row being created -
     -- and because that curated row is already in this table, IT is what
     -- travels upward. Dropping this check would replace a measured
     -- macrolanguage figure with the sum of its parts.
     WHERE NOT EXISTS (
             SELECT 1 FROM locale c
              WHERE c.language_id  = lsa.parent_language_id
                AND c.territory_id = f.territory_id
                AND c.script_id IS NULL
                AND c.variant_key = ''
                AND c.locale_source NOT IN ('createRegionalLocales',
                                            'createFamilyLocales'))
     GROUP BY lsa.parent_language_id, f.territory_id, t.population_from_un;

  END LOOP;

  DELETE FROM _family_locale WHERE NOT is_generated;

  -- `${language.ID}_${territoryCode}`. No script and no variant by
  -- construction, so this is the whole code.
  UPDATE _family_locale f
     SET code = f.language_id || '_' || f.territory_id;

  -- getLocaleName(): languageName (territoryName). entity.name_display for the
  -- language is the canonical name rather than the source-specific one, because
  -- the source is a UI setting and this row is stored once. Correlated
  -- subqueries rather than a FROM with joins: a JOIN inside the FROM clause of
  -- an UPDATE cannot reference the update target. Fourth derive step, fourth
  -- time.
  UPDATE _family_locale f
     SET name_display =
           (SELECT le.name_display FROM entity le
             WHERE le.id = f.language_id AND le.type = 'Language')
        || ' ('
        || (SELECT te.name_display FROM entity te
             WHERE te.id = f.territory_id AND te.type = 'Territory')
        || ')';

  -- 'fam.' || SOURCE || '.' || code. The source is IN the id, not only in the
  -- column, because entity.id is a single primary key and the same family in
  -- two classifications is two rows: fam.ISO.inc_IN and fam.Glottolog.inc_IN
  -- can both exist and mean different things. code_display keeps the bare
  -- locale code, the same split D5 uses for reg. and the schema for
  -- org.StatCAN.
  INSERT INTO entity (id, type, code_display, name_display)
  SELECT 'fam.' || p_source::text || '.' || f.code, 'Locale', f.code,
         f.name_display
    FROM _family_locale f;

  INSERT INTO locale (
    id, language_id, territory_id, locale_source, language_source, variant_key,
    pop_speaking_unadjusted, pop_speaking_percent, pop_speaking_source_derived,
    source_ref)
  SELECT 'fam.' || p_source::text || '.' || f.code, f.language_id, f.territory_id,
         'createFamilyLocales', p_source, '',
         f.pop_unadjusted,
         -- `population * 100 / territoryPop`. LEAST guards
         -- locale_speaking_pct_range; it cannot bind, because pop_unadjusted
         -- was already capped at the same denominator, but a silent constraint
         -- violation on a later edit is worse than a redundant clamp.
         LEAST(f.pop_unadjusted * 100.0
                 / COALESCE(NULLIF(t.population_from_un, 0), 1), 100),
         'Aggregated from Languages',
         'derived: rebuild_family_locales'
    FROM _family_locale f
    JOIN territory t ON t.id = f.territory_id;

  -- A family whose children report more speakers than the territory holds
  -- people is a contradiction in the source data, not a rounding artefact. The
  -- sum had to be capped; say so rather than letting the cap look measured.
  INSERT INTO data_quality_finding (entity_id, field, severity, message, run_id)
  SELECT 'fam.' || p_source::text || '.' || f.code,
         'locale.pop_speaking_unadjusted', 'warning',
         'D6 family locale: the curated locales of the ' || p_source::text
         || ' descendants of '
         || f.language_id || ' in ' || f.territory_id || ' sum to '
         || f.pop_uncapped || ' speakers, more than the ' || t.population_from_un
         || ' people the territory holds, so the total was capped.',
         p_run_id
    FROM _family_locale f
    JOIN territory t ON t.id = f.territory_id
   WHERE f.pop_uncapped > COALESCE(t.population_from_un, 0);

  -- ── Part B: what the rows say, from the CENSUS-corrected populations ─────

  -- The parent-language edge from searchLocalesForMissingLinks.ts:34, which
  -- HARDCODES `language.ISO.parentLanguage` where part A reads its SOURCE
  -- constant. Under one source that difference is invisible; here p_source
  -- drives both, or a Glottolog pass would walk the ISO tree. The child's own
  -- script, territory and variants are carried into the lookup, so an edge
  -- exists only between locales matching on all three, and only to the DIRECT
  -- parent - the edge set never skips a level.
  --
  -- Both sides are restricted to rows this source can see: its own family
  -- locales, plus the curated rows, which belong to no source. Without that
  -- restriction a Glottolog pass would sum ISO's family locales. The two can
  -- never both match, because part A refuses to create a family locale where a
  -- curated one already exists.
  --
  -- Regional locales are excluded on both sides. The frontend does include them
  -- here, but computeRegionalLocalesPopulation overwrites the result
  -- immediately afterwards and D5 rebuilds those rows from scratch, so the only
  -- difference excluding them makes is that a re-run cannot depend on the
  -- previous run's leftovers.
  DROP TABLE IF EXISTS _lang_parent_locale;
  CREATE TEMP TABLE _lang_parent_locale ON COMMIT DROP AS
  SELECT c.id AS child_id, p.id AS parent_id, dep.depth AS parent_depth
    FROM locale c
    JOIN language_source_attribute lsa ON lsa.language_id = c.language_id
                                      AND lsa.source = p_source
                                      AND lsa.parent_language_id IS NOT NULL
    JOIN locale p ON p.language_id  = lsa.parent_language_id
                 AND p.territory_id IS NOT DISTINCT FROM c.territory_id
                 AND p.script_id    IS NOT DISTINCT FROM c.script_id
                 AND p.variant_key  = c.variant_key
                 AND p.locale_source <> 'createRegionalLocales'
                 AND (p.language_source IS NULL OR p.language_source = p_source)
                 -- Part B writes to CURATED rows on the ISO pass only. They are
                 -- shared by every source, and searchLocalesForMissingLinks
                 -- walks the ISO tree to reach them, so ISO is the one pass
                 -- that reproduces the frontend. Letting five passes each
                 -- propose a different sum for the same shared row would make
                 -- the answer depend on call order.
                 AND (p_source = 'ISO'
                      OR p.locale_source = 'createFamilyLocales')
    JOIN _lang_depth dep ON dep.language_id = p.language_id
   WHERE c.locale_source <> 'createRegionalLocales'
     AND (c.language_source IS NULL OR c.language_source = p_source)
     AND p.territory_id IS NOT NULL;
  CREATE INDEX ON _lang_parent_locale (parent_depth);
  CREATE INDEX ON _lang_parent_locale (parent_id);

  -- One level's worth of sums. A real table rather than a CTE for two reasons:
  -- the clamp report has to read exactly the rows the UPDATE wrote, and a JOIN
  -- inside the FROM clause of an UPDATE cannot reference the update target -
  -- fourth derive step, fourth time. Everything the UPDATE needs, including the
  -- target's own current value, is materialised here first so the UPDATE joins
  -- on id alone.
  DROP TABLE IF EXISTS _family_level;
  CREATE TEMP TABLE _family_level (
    pid       text PRIMARY KEY,
    new_adj   bigint,
    new_unadj bigint,
    terr_pop  bigint,
    old_adj   bigint,
    sum_adj   bigint,   -- before the cap, for the report
    maxpop    bigint
  ) ON COMMIT DROP;

  -- Bottom-up again, this time over the locale graph. The level loop is not
  -- avoidable by a single recursive statement: line 111's
  -- `if (pop.adjusted && newEstimate <= pop.adjusted) return` makes each level
  -- read what the level below just decided.
  FOR d IN REVERSE (max_depth - 1) .. 0 LOOP

    -- Speaking and writing are two independent passes in the TypeScript
    -- (sumUpPopulationFromChildLanguages is called once per use) and each has
    -- its own census guard and its own "do not lower it" test, so a locale can
    -- take a new speaking figure and keep its old writing one. Two statements
    -- per level, not one doing both.
    TRUNCATE _family_level;
    INSERT INTO _family_level (pid, new_adj, new_unadj, terr_pop, old_adj,
                               sum_adj, maxpop)
    SELECT e.parent_id,
           -- `if (newPopulationEstimate > maxPopulation) = maxPopulation`
           LEAST(SUM(c.pop_speaking_adjusted), t.population),
           -- `pop.unadjusted = sumBy(...)`, then the same cap. sumBy coalesces
           -- each term to 0 and maps a 0 total to undefined, hence NULLIF.
           NULLIF(LEAST(SUM(COALESCE(c.pop_speaking_unadjusted_derived,
                                     c.pop_speaking_unadjusted)),
                        t.population), 0),
           t.population,
           p.pop_speaking_adjusted,
           SUM(c.pop_speaking_adjusted),
           -- `territory.pop[use] || territory.pop.overall`. For speaking these
           -- are the same number: loadTerritoryGDPLiteracy.ts:27 assigns
           -- pop.speaking = pop.overall, and a group never receives one, so the
           -- fallback is what applies. No expression needed.
           t.population
      FROM _lang_parent_locale e
      JOIN locale c    ON c.id = e.child_id
      JOIN locale p    ON p.id = e.parent_id
      JOIN territory t ON t.id = p.territory_id
     WHERE e.parent_depth = d
       AND p.pop_speaking_census_id IS NULL    -- `if (pop.census) return`
       AND p.locale_source <> 'createRegionalLocales'
     GROUP BY e.parent_id, t.population, p.pop_speaking_adjusted
    -- `if (!newPopulationEstimate) return` - do nothing at all when the sum is
    -- zero or unknown, rather than storing a zero that reads as measured.
    HAVING SUM(c.pop_speaking_adjusted) > 0;

    -- `if (pop.adjusted && newPopulationEstimate <= pop.adjusted) return`. Both
    -- sides are tested for truthiness in the TypeScript, so an existing 0 does
    -- not block the update. Applied by deleting the rows that lose, so that the
    -- clamp report below sees only rows that were actually written.
    DELETE FROM _family_level
     WHERE COALESCE(old_adj, 0) <> 0 AND new_adj <= old_adj;

    UPDATE locale p
       SET pop_speaking_adjusted           = l.new_adj,
           pop_speaking_unadjusted_derived = l.new_unadj,
           pop_speaking_percent            = LEAST(l.new_unadj * 100.0
                                             / COALESCE(NULLIF(l.terr_pop, 0), 1), 100),
           pop_speaking_source_derived     = 'Aggregated from Languages'
      FROM _family_level l
     WHERE p.id = l.pid;

    INSERT INTO data_quality_finding (entity_id, field, severity, message, run_id)
    SELECT l.pid, 'locale.pop_speaking_adjusted', 'warning',
           'D6 family roll-up: the ISO child locales sum to ' || l.sum_adj
           || ' speakers, more than the ' || l.maxpop || ' people the territory '
           || 'holds, so the total was capped. Some descendant locale reports '
           || 'more speakers than its own territory has population.',
           p_run_id
      FROM _family_level l
     WHERE l.sum_adj > l.maxpop;

    TRUNCATE _family_level;
    INSERT INTO _family_level (pid, new_adj, new_unadj, terr_pop, old_adj,
                               sum_adj, maxpop)
    SELECT e.parent_id,
           LEAST(SUM(c.pop_writing_adjusted), cap.maxpop),
           NULLIF(LEAST(SUM(COALESCE(c.pop_writing_unadjusted_derived,
                                     c.pop_writing_unadjusted)),
                        cap.maxpop), 0),
           t.population,
           p.pop_writing_adjusted,
           SUM(c.pop_writing_adjusted),
           cap.maxpop
      FROM _lang_parent_locale e
      JOIN locale c    ON c.id = e.child_id
      JOIN locale p    ON p.id = e.parent_id
      JOIN territory t ON t.id = p.territory_id
      -- Here the fallback earns its place. territory.pop.writing is
      -- population * literacy / 100, which D3 fills for all 289, and
      -- `|| territory.pop.overall` catches a territory whose literacy rate is
      -- unknown or zero. The PERCENT below still divides by pop.overall, not by
      -- this: computeAggregatedLocalesPopulation.ts:122 uses pop.overall for
      -- both uses, so a writing percentage is a share of the whole population,
      -- not of the literate part.
      CROSS JOIN LATERAL (
            SELECT COALESCE(NULLIF(t.population_writing, 0), t.population) AS maxpop
           ) cap
     WHERE e.parent_depth = d
       AND p.pop_writing_census_id IS NULL
       AND p.locale_source <> 'createRegionalLocales'
     GROUP BY e.parent_id, t.population, p.pop_writing_adjusted, cap.maxpop
    HAVING SUM(c.pop_writing_adjusted) > 0;

    DELETE FROM _family_level
     WHERE COALESCE(old_adj, 0) <> 0 AND new_adj <= old_adj;

    UPDATE locale p
       SET pop_writing_adjusted           = l.new_adj,
           pop_writing_unadjusted_derived = l.new_unadj,
           pop_writing_percent            = LEAST(l.new_unadj * 100.0
                                            / COALESCE(NULLIF(l.terr_pop, 0), 1), 100),
           pop_writing_source_derived     = 'Aggregated from Languages'
      FROM _family_level l
     WHERE p.id = l.pid;

    INSERT INTO data_quality_finding (entity_id, field, severity, message, run_id)
    SELECT l.pid, 'locale.pop_writing_adjusted', 'warning',
           'D6 family roll-up: the ISO child locales sum to ' || l.sum_adj
           || ' writers, more than the ' || l.maxpop || ' literate people the '
           || 'territory holds, so the total was capped.',
           p_run_id
      FROM _family_level l
     WHERE l.sum_adj > l.maxpop;

  END LOOP;

  -- getLanguageFamilyLocalePopulation lines 79-82 assign literacyPercent for
  -- EVERY locale it visits - that is, every locale with at least one child
  -- locale - whether or not either sum was applied. So this can and does
  -- replace a rate D4 computed with NULL. Faithful, and counted below.
  UPDATE locale p
     SET literacy_percent =
           CASE WHEN COALESCE(p.pop_speaking_adjusted, 0) <> 0
                 AND COALESCE(p.pop_writing_adjusted, 0) <> 0
                THEN LEAST(p.pop_writing_adjusted * 100.0
                             / p.pop_speaking_adjusted, 100)
           END
   WHERE p.locale_source <> 'createRegionalLocales'
     AND EXISTS (SELECT 1 FROM _lang_parent_locale e WHERE e.parent_id = p.id);

  ANALYZE locale;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_family_locales(uuid, language_source) IS
  'D6. Synthesises the locale rows for language FAMILIES in ONE classification '
  'source by rolling child language locales up that source''s tree, level by '
  'level, then recomputes every affected locale from the census-corrected '
  'figures. Call once per source; run.py does, with ISO FIRST because part B '
  'updates shared curated locales on the ISO pass only. Ports '
  'src/features/data/connect/createFamilyLocales.ts together with '
  'computeLanguageFamilyLocalePopulations from '
  'computeAggregatedLocalesPopulation.ts - the first decides which rows exist, '
  'the second decides what they say, and they sum different inputs. A curated '
  'locale on a family languoid SHADOWS the sum rather than being overwritten. '
  'Generated rows carry language_source and a fam.SOURCE. id prefix, because '
  '80 languoids have a different child set in different sources and both '
  'answers are correct. Idempotent per source: deletes every row it owns for '
  'that source before rebuilding. Must run after D4 and before D5. Note D5 '
  'aggregates ISO family locales ONLY; see FP-013.';


-- ── D7  Writing system populations ─────────────────────────────────────────
-- Ports computeDescendantPopulation.ts together with the two places that
-- accumulate populationUpperBound, which is where most of the semantics live:
--
--   connectWritingSystems.ts:53-56   += language.population_rough, for every
--                                    language whose PRIMARY script this is
--   connectLocales.ts:47-53          += locale.pop_speaking_unadjusted, for
--                                    locales on a NON-primary script
--   computeDescendantPopulation.ts   walks the derivation tree
--
-- The column exists because the two questions are different. Egyptian
-- hieroglyphs have no writers at all, and the writing systems descended from
-- them have billions - the frontend's own comment on line 6. Ordering scripts
-- by their own population buries every ancestral script; ordering by
-- descendants is what surfaces them. Measured here: Egyp reads 9,679,661,074
-- against an upper bound of 0.
--
-- ═══ FOUR SEMANTICS THAT LOOK LIKE DETAIL AND ARE NOT ═══
--
-- 1. IT SEES CURATED LOCALES ONLY. connectLocales runs at connectObjects.ts:36,
--    BEFORE createFamilyLocales and createRegionalLocales on lines 41-42, so
--    the 43,585 generated rows do not exist yet and contribute nothing. The
--    filter is written as NOT IN (the two generated sources) rather than
--    = 'StableDatabase', because the frontend's rule is "whatever had been
--    loaded by then", so an IANA or census locale would be counted the day one
--    is loaded. Summing every locale instead roughly quintuples Latn.
--
-- 2. A LOCALE COUNTS ONLY WHEN ITS SCRIPT IS NOT ITS LANGUAGE'S PRIMARY ONE.
--    Otherwise the same speakers arrive twice, once through population_rough
--    on the primary-script branch and once through the locale. IS DISTINCT FROM
--    rather than <>, because the TypeScript compares with loose != against
--    `undefined`: a language with NO primary script does contribute its
--    locales. 85 locales qualify today.
--
-- 3. A SCRIPT THAT IS SOME LANGUAGE'S PRIMARY SCRIPT GETS 0, NOT NULL, even
--    when every such language has no population_rough. The TypeScript
--    initialises the field to 0 before adding, so the distinction it draws is
--    "no language writes with this" (undefined) against "languages write with
--    this and we have no figures" (0). 125 scripts are set, of which 88 exceed
--    zero. Collapsing the two loses a real statement about coverage.
--
-- 4. population_of_descendants IS NULLIF(sum, 0), the frontend's
--    `descendantPopulation || undefined`. 13 scripts are the parent of
--    something whose descendants all sum to zero, and a stored 0 there would be
--    indistinguishable from a script with no children at all.
--
-- WHY THERE IS NO LEVEL LOOP, unlike D3, D5 and D6. The recursion
-- f(ws) = sum over children c of (f(c) + bound(c)) telescopes into a flat sum
-- of bound(d) over every STRICT descendant d, because each writing system has
-- at most one parent and nothing is clamped on the way up. So one closure and
-- one grouped sum replace the level-by-level walk. That is only true here:
-- D3's coordinates are non-linear and D6's sums are clamped at each level, so
-- neither can be flattened this way.
--
-- All 225 writing systems are reachable from one of the 28 roots, so no node is
-- skipped and the closure terminates; a golden check asserts the count.
CREATE OR REPLACE FUNCTION rebuild_writing_system_populations(p_run_id uuid)
RETURNS void AS $$
BEGIN
  -- Full rebuild, like D5 and D6. Both columns are derived and nothing else
  -- writes them, so clearing first is what makes a re-run idempotent rather
  -- than cumulative - and += on a stale value is exactly how this step would
  -- go wrong quietly.
  UPDATE writing_system
     SET population_upper_bound    = NULL,
         population_of_descendants = NULL;

  -- Pass 1. The two accumulators, unioned rather than joined, so a script that
  -- appears in only one of them still gets a row.
  WITH from_primary AS (
    SELECT primary_script_id AS script_id,
           sum(COALESCE(population_rough, 0)) AS bound
      FROM language
     WHERE primary_script_id IS NOT NULL
     GROUP BY 1
  ),
  from_locale AS (
    SELECT lo.script_id,
           sum(lo.pop_speaking_unadjusted) AS bound
      FROM locale lo
      JOIN language l ON l.id = lo.language_id
     WHERE lo.locale_source NOT IN ('createRegionalLocales', 'createFamilyLocales')
       AND lo.script_id IS NOT NULL
       AND lo.pop_speaking_unadjusted IS NOT NULL
       AND l.primary_script_id IS DISTINCT FROM lo.script_id
     GROUP BY 1
  ),
  bounds AS (
    SELECT COALESCE(p.script_id, x.script_id) AS script_id,
           COALESCE(p.bound, 0) + COALESCE(x.bound, 0) AS bound
      FROM from_primary p
      FULL JOIN from_locale x ON x.script_id = p.script_id
  )
  UPDATE writing_system w
     SET population_upper_bound = b.bound
    FROM bounds b
   WHERE b.script_id = w.id;

  -- Pass 2. The derivation closure, then one grouped sum over it. Neither CTE
  -- references the UPDATE target's alias, so this does not hit the
  -- "UPDATE ... FROM cannot join to the update target" trap that has now come
  -- up in four consecutive derive steps.
  WITH RECURSIVE descent AS (
    SELECT id AS ancestor_id, id AS descendant_id
      FROM writing_system
    UNION ALL
    SELECT d.ancestor_id, c.id
      FROM writing_system c
      JOIN descent d ON c.parent_writing_system_id = d.descendant_id
  ),
  descendant_bounds AS (
    SELECT d.ancestor_id,
           sum(COALESCE(w.population_upper_bound, 0)) AS bound
      FROM descent d
      JOIN writing_system w ON w.id = d.descendant_id
     WHERE d.descendant_id <> d.ancestor_id
     GROUP BY 1
  )
  UPDATE writing_system w
     SET population_of_descendants = NULLIF(b.bound, 0)
    FROM descendant_bounds b
   WHERE b.ancestor_id = w.id;

  ANALYZE writing_system;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_writing_system_populations(uuid) IS
  'D7, first half. Fills writing_system.population_upper_bound and '
  'population_of_descendants. Ports computeDescendantPopulation.ts plus the '
  'two accumulation sites in connectWritingSystems.ts and connectLocales.ts. '
  'Source-independent and depends on no other derive step: both inputs, '
  'language.population_rough and locale.pop_speaking_unadjusted, are loaded '
  'columns. It does see CURATED locales only, because connectLocales runs '
  'before the generated rows exist. Idempotent: clears both columns first.';


-- ── D7  Descendant counts ──────────────────────────────────────────────────
-- Q1(a). This is the column that replaced the +0.01-per-node tie-breaker, and
-- it is worth knowing that the trick it replaced is ALREADY DEAD in the
-- frontend. updatePopulations.ts:55 still reads
-- `getLanguagePopulationFollowingDescendants(childLang, depth + 1) || [0.01, 0.01]`,
-- but the left operand is an array on every path - including the depth > 50
-- guard's [0, 0] - and arrays are always truthy, so the fallback can never
-- fire. The function it came from, computeLanguageDescendantPopulation, no
-- longer exists. So this column does not merely make the old ordering explicit,
-- it restores an ordering the frontend has already lost.
--
-- Sort with (population_estimate DESC NULLS LAST, descendant_count DESC).
--
-- PER SOURCE, because the tree has a different shape under each authority.
-- Measured 2026-08-06: Glottolog 182,385 ancestor edges over 8,660 ancestors,
-- Combined 12,659 over 260, ISO and BCP 12,517 over 254, UNESCO 584 over 146.
-- CLDR has 153 attribute rows and no parent edges at all, so every one of them
-- correctly reads 0; Ethnologue has no rows.
--
-- THE COPY ON `language` MIRRORS THE COMBINED ROW ONLY, like every other
-- mirrored column on that table, and it is NULL where there is no Combined row
-- to mirror - 18,957 of 27,299 languoids, almost all Glottolog dialects. Those
-- are not in the Combined tree at all, which is a different statement from
-- having no descendants in it, and 0 would erase the difference.
--
-- Nothing here needs a recursive walk: language_ancestry is the closure D1
-- already built, so the count is one grouped scan of it.
CREATE OR REPLACE FUNCTION rebuild_descendant_counts(p_run_id uuid)
RETURNS void AS $$
BEGIN
  -- 0 rather than NULL for the baseline, because every attribute row IS in its
  -- own source's tree - it just may have nothing beneath it. NULL here would
  -- mean uncounted, which after this function runs is false. Measured
  -- 2026-08-06: 0 ancestors in language_ancestry lack an attribute row for
  -- their own source, so no count is dropped by the join below.
  UPDATE language_source_attribute SET descendant_count = 0;

  WITH counts AS (
    SELECT source, ancestor_id, count(*) AS n
      FROM language_ancestry
     WHERE depth > 0
     GROUP BY 1, 2
  )
  UPDATE language_source_attribute a
     SET descendant_count = c.n
    FROM counts c
   WHERE c.source      = a.source
     AND c.ancestor_id = a.language_id;

  -- The mirror. NULL for a languoid with no Combined row, which is the honest
  -- answer for something that is not in that tree.
  UPDATE language SET descendant_count = NULL;

  UPDATE language l
     SET descendant_count = a.descendant_count
    FROM language_source_attribute a
   WHERE a.language_id = l.id
     AND a.source      = 'Combined';

  ANALYZE language_source_attribute;
  ANALYZE language;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_descendant_counts(uuid) IS
  'D7, second half. Fills language_source_attribute.descendant_count for every '
  'classification source from the D1 closure, then mirrors the Combined value '
  'onto language.descendant_count. This is the Q1(a) replacement for the '
  '+0.01-per-node tie-breaker: sort by (population_estimate DESC NULLS LAST, '
  'descendant_count DESC). Depends on D1 only. NULL on `language` means the '
  'languoid has no Combined row, so it is not in that tree at all; 0 means it '
  'is in the tree with nothing beneath it.';


-- ── D8: the language population precedence chain ───────────────────────────
--
-- Ports getLanguagePopulationFollowingDescendants + computeLanguagePopulationEstimate
-- (updatePopulations.ts:47-95). Two things about the shape of this, both of
-- which produce a plausible wrong number if ignored:
--
-- 1. DESCENDANTS AND ESTIMATE ARE ONE PASS, not two. The recursion returns a
--    child's ESTIMATE, not its descendant sum, so a parent's descendant total
--    is built from its children's finished estimates. Computing every
--    descendant sum first and every estimate afterwards gives a different,
--    entirely believable answer - the mistake §9.9.2 caught for D6.
-- 2. SPEAKING AND WRITING RECURSE INDEPENDENTLY. They cannot be derived from
--    one another: `fromLocales` reads a different column, the rough figure
--    takes a per-use modality discount, and the two precedence chains can
--    therefore select different branches for the same languoid.
--
-- The -0.01 parent discount (discountPopulationEstimatesIfSimilarToParent) is
-- deliberately NOT ported, per Q1. A child larger than its parent is a
-- source-data defect; it is written to data_quality_finding and the value is
-- left alone. That means these numbers legitimately differ from the live site
-- for the affected languoids, which is a stated deviation, not a bug.
CREATE OR REPLACE FUNCTION rebuild_language_populations(p_run_id uuid,
                                                        p_source language_source)
RETURNS void AS $$
DECLARE
  max_depth int;
  d         int;
BEGIN
  -- Depth within THIS source's tree. Single-valued parents inside one source
  -- make it a forest, so a node's depth is unique - see the note in D6.
  DROP TABLE IF EXISTS _lp_node;
  CREATE TEMP TABLE _lp_node ON COMMIT DROP AS
  SELECT lsa.language_id,
         lsa.parent_language_id,
         COALESCE((SELECT max(a.depth) FROM language_ancestry a
                    WHERE a.source = p_source
                      AND a.descendant_id = lsa.language_id), 0) AS depth
    FROM language_source_attribute lsa
   WHERE lsa.source = p_source;
  CREATE UNIQUE INDEX ON _lp_node (language_id);
  CREATE INDEX ON _lp_node (depth);
  CREATE INDEX ON _lp_node (parent_language_id);

  SELECT COALESCE(max(depth), 0) INTO max_depth FROM _lp_node;

  DROP TABLE IF EXISTS _lp_pop;
  CREATE TEMP TABLE _lp_pop (
    language_id text PRIMARY KEY,
    depth       int,
    s_desc bigint, w_desc bigint,
    s_est  bigint, w_est  bigint,
    s_src  population_source_category,
    w_src  population_source_category
  ) ON COMMIT DROP;
  INSERT INTO _lp_pop (language_id, depth)
  SELECT language_id, depth FROM _lp_node;
  CREATE INDEX ON _lp_pop (depth);

  -- Deepest level first, so a node's children are always final before it is
  -- read. At each level: sum the children, THEN apply the precedence rule.
  FOR d IN REVERSE max_depth..0 LOOP
    -- sumBy over the children's estimates. NULLIF(...,0) reproduces the
    -- TypeScript's `descendantSpeakers ? descendantSpeakers : undefined`,
    -- which is why the precedence test below can use IS NOT NULL: a zero sum
    -- must fall through to "no descendants", not stop the chain at 0.
    UPDATE _lp_pop p
       SET s_desc = c.s, w_desc = c.w
      FROM (SELECT n.parent_language_id AS pid,
                   NULLIF(sum(COALESCE(cp.s_est, 0)), 0) AS s,
                   NULLIF(sum(COALESCE(cp.w_est, 0)), 0) AS w
              FROM _lp_node n
              JOIN _lp_pop  cp ON cp.language_id = n.language_id
             WHERE n.parent_language_id IS NOT NULL
             GROUP BY n.parent_language_id) c
     WHERE p.language_id = c.pid
       AND p.depth = d;

    -- The three-way precedence, per use. Order matters and each guard is
    -- exact: `> 0` on the locale branch and `<> 0` on the rough branch are
    -- both truthiness tests in the TypeScript, so a zero falls THROUGH to the
    -- next branch rather than being selected.
    UPDATE _lp_pop p
       SET s_est = CASE
             WHEN l.pop_speaking_from_locales > 0 THEN l.pop_speaking_from_locales
             WHEN COALESCE(l.population_rough, 0) <> 0
               THEN ROUND(l.population_rough
                          * language_modality_discount(l.modality, 'speaking'))
             WHEN p.s_desc IS NOT NULL THEN p.s_desc
           END,
           s_src = CASE
             WHEN l.pop_speaking_from_locales > 0
               THEN 'Aggregated from Territories'::population_source_category
             WHEN COALESCE(l.population_rough, 0) <> 0
               THEN 'Other'::population_source_category
             WHEN p.s_desc IS NOT NULL
               THEN 'Aggregated from Languages'::population_source_category
           END,
           w_est = CASE
             WHEN l.pop_writing_from_locales > 0 THEN l.pop_writing_from_locales
             WHEN COALESCE(l.population_rough, 0) <> 0
               THEN ROUND(l.population_rough
                          * language_modality_discount(l.modality, 'writing'))
             WHEN p.w_desc IS NOT NULL THEN p.w_desc
           END,
           w_src = CASE
             WHEN l.pop_writing_from_locales > 0
               THEN 'Aggregated from Territories'::population_source_category
             WHEN COALESCE(l.population_rough, 0) <> 0
               THEN 'Other'::population_source_category
             WHEN p.w_desc IS NOT NULL
               THEN 'Aggregated from Languages'::population_source_category
           END
      FROM language l
     WHERE l.id = p.language_id
       AND p.depth = d;
  END LOOP;

  UPDATE language_source_attribute lsa
     SET pop_speaking_estimate        = p.s_est,
         pop_writing_estimate         = p.w_est,
         pop_speaking_estimate_source = p.s_src,
         pop_writing_estimate_source  = p.w_src,
         pop_speaking_of_descendants  = p.s_desc,
         pop_writing_of_descendants   = p.w_desc,
         -- The single-column mirrors, for callers that do not care about the
         -- speaking/writing split. population_estimate is pop.overall.
         population_estimate          = NULLIF(GREATEST(COALESCE(p.s_est, 0),
                                                        COALESCE(p.w_est, 0)), 0),
         population_estimate_source   = CASE
             WHEN COALESCE(p.s_est, 0) >= COALESCE(p.w_est, 0) THEN p.s_src
             ELSE p.w_src END,
         -- max(), NOT the sum: getObjectPopulationOfDescendants takes the
         -- higher of the two, because a person who both speaks and writes a
         -- descendant language must not be counted twice.
         population_of_descendants    = NULLIF(GREATEST(COALESCE(p.s_desc, 0),
                                                        COALESCE(p.w_desc, 0)), 0)
    FROM _lp_pop p
   WHERE lsa.language_id = p.language_id
     AND lsa.source = p_source;

  -- Mirror the Combined row onto `language`, the denormalised copy the main
  -- list query sorts on without a join. Same rule as D7's descendant_count
  -- mirror: `language` follows Combined and nothing else, so a languoid with
  -- no Combined row keeps NULL rather than borrowing another source's number.
  -- pop_*_from_locales is deliberately NOT touched here - it is written by
  -- rebuild_language_population_from_locales and is source-independent.
  IF p_source = 'Combined' THEN
    UPDATE language l
       SET pop_speaking_estimate        = p.s_est,
           pop_writing_estimate         = p.w_est,
           pop_speaking_estimate_source = p.s_src,
           pop_writing_estimate_source  = p.w_src,
           pop_speaking_of_descendants  = p.s_desc,
           pop_writing_of_descendants   = p.w_desc,
           population_estimate          = NULLIF(GREATEST(COALESCE(p.s_est, 0),
                                                          COALESCE(p.w_est, 0)), 0),
           population_estimate_source   = CASE
               WHEN COALESCE(p.s_est, 0) >= COALESCE(p.w_est, 0) THEN p.s_src
               ELSE p.w_src END,
           population_of_descendants    = NULLIF(GREATEST(COALESCE(p.s_desc, 0),
                                                          COALESCE(p.w_desc, 0)), 0)
      FROM _lp_pop p
     WHERE l.id = p.language_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_language_populations(uuid, language_source) IS
  'D8. Walks one classification source''s tree from the leaves up, computing '
  'each languoid''s descendant sum and then its population estimate in the '
  'same pass, per use. Precedence: a World locale figure, else the rough '
  'languages.tsv number under a modality discount, else the descendant sum. '
  'Speaking and writing recurse independently and may select different '
  'branches. Depends on D1 for the tree, D4 and D5 for the locale figures. The '
  '-0.01 parent discount is deliberately not ported; see Q1.';

-- Fills language.pop_*_from_locales from the World (001) locales, which is
-- what updateLanguagesPopulationFromLocale(world) does. Separate from the
-- recursion because it is source-independent - the World roll-up is keyed by
-- language, not by classification - and because it must run BEFORE the tree
-- walk on every source.
--
-- uniqueBy(languageCode) over locales sorted by population keeps the LARGEST
-- locale per language. sortByPopulation ranks a locale by
-- max(speaking.adjusted, writing.adjusted), so the tie-break is on that, not
-- on the speaking figure alone.
CREATE OR REPLACE FUNCTION rebuild_language_population_from_locales(p_run_id uuid)
RETURNS void AS $$
  WITH ranked AS (
    SELECT lo.language_id,
           lo.pop_speaking_adjusted,
           lo.pop_writing_adjusted,
           ROW_NUMBER() OVER (
             PARTITION BY lo.language_id
             ORDER BY GREATEST(COALESCE(lo.pop_speaking_adjusted, 0),
                               COALESCE(lo.pop_writing_adjusted, 0)) DESC,
                      lo.id
           ) AS rn
      FROM locale lo
     WHERE lo.territory_id = '001'
  )
  UPDATE language l
     SET pop_speaking_from_locales = r.pop_speaking_adjusted,
         pop_writing_from_locales  = r.pop_writing_adjusted
    FROM ranked r
   WHERE r.rn = 1
     AND l.id = r.language_id;
$$ LANGUAGE sql;

COMMENT ON FUNCTION rebuild_language_population_from_locales(uuid) IS
  'D8, first half. Ports updateLanguagesPopulationFromLocale(world): takes the '
  'largest World (001) locale for each language and copies its adjusted '
  'speaking and writing figures onto the language. Source-independent, and '
  'must run before rebuild_language_populations on any source. FP-014 bites '
  'here: D5 generates World rows for ISO families only, so a family that '
  'exists solely under another source has none and falls through to the '
  'descendants branch of the precedence rule.';


-- ── D9  Largest descendant ─────────────────────────────────────────────────
--
-- Ports computeLargestDescendant.ts. Three things decide the shape of this,
-- and only the first is visible in the TypeScript at a glance.
--
-- 1. THE RECURSION TELESCOPES, so there is no level loop - unlike D6 and D8.
--    getLargestDescendant looks bottom-up, but for every node it takes
--    max(child, largestDescendant(child)) over the children, which by
--    induction is just argmax(pop.overall) over the STRICT descendants,
--    filtered to non-Family and population > 0. Nothing is clamped on the way
--    up and no intermediate feeds the next level, so language_ancestry - the
--    closure D1 already built - answers it in one grouped scan. This is the
--    same recognition D7's writing-system sums needed, and the opposite of D6
--    and D8, whose sums ARE clamped per level. Getting it wrong here costs
--    runtime; getting it wrong there costs correctness.
--
-- 2. THE SCOPE TEST NEEDS A FALLBACK THE SCHEMA DOES NOT HOLD DIRECTLY. The
--    frontend reads child.scope, which updateObjectNamesAndCodes sets to
--    `specific.scope ?? lang.scope` - the per-source value falling back to a
--    load-time base that is ISO's scope, with Glottolog filling the gaps
--    (ISOData.tsx:125, GlottologData.tsx:138). There is no language.scope
--    column, and language_source_attribute.scope is NULL for 8,227 of the
--    8,342 Combined rows: the only 115 that are set are the ISO 639-5
--    families, which is the one place the loader writes it. Reading the raw
--    column alone would classify 48 real families as non-families. Measured
--    effect on the answer: 3 languoids (eml, kgd, tid) change side and 2
--    ancestors (itd, ncq) change from naming a family to naming nothing.
--    Recomputed here rather than materialised; see FP-016.
--
-- 3. A NULL SCOPE MEANS NON-FAMILY, NOT UNKNOWN. The TypeScript compares
--    `child.scope !== LanguageScope.Family`, and undefined passes that test,
--    so 101 Combined languoids with no scope under any source are legitimate
--    candidates. IS DISTINCT FROM, not <>, for the same reason as D7's
--    primary-script test: <> drops every NULL row silently.
--
-- The RECURSION_LIMIT = 30 in the TypeScript has no analogue here and needs
-- none. Measured maximum closure depth is 26 (Glottolog), 5 (Combined, ISO,
-- BCP), 2 (UNESCO), 0 (CLDR), so it never fires. It is worth knowing what
-- would happen if a tree ever passed it: the frontend memoises on a field it
-- checks BEFORE the depth guard, so a node first reached at depth 0 keeps its
-- full answer while one first reached at depth 30 gets undefined, making the
-- result depend on array order. The closure query stays exact.
--
-- TIE-BREAK IS A STATED DEVIATION. 12 of the 232 answered ancestors have two
-- or more descendants tied at the maximum - aym has ayc and ayr at 100,000,
-- zap has seven at 10,000. The TypeScript resolves those by childLanguages
-- array order, which is TSV load order and has no equivalent here. Ordering by
-- (population DESC, depth, id) picks the shallower node and then the lower id,
-- which is deterministic and therefore idempotent; the frontend's answer is
-- neither reproducible nor more correct.
--
-- The Q1 parent discount is not ported, and it shows here: 24 of the 232
-- ancestors have a largest descendant BIGGER than their own estimate, which
-- ReportLanguageDescendants renders as a percentage above 100. That is the
-- declared parent_child_population_contradictions gap, not a fault in this
-- step.
CREATE OR REPLACE FUNCTION rebuild_largest_descendants(p_run_id uuid,
                                                       p_source language_source)
RETURNS void AS $$
BEGIN
  -- Clear first, exactly as computeLargestDescendant.ts:10-12 does. A languoid
  -- that stops qualifying between runs must lose its answer rather than keep a
  -- stale one, and the UPDATE below only touches ancestors that have one.
  UPDATE language_source_attribute
     SET largest_descendant_id = NULL
   WHERE source = p_source;

  WITH effective AS (
    -- The base-scope reconstruction described above. ISO first, then
    -- Glottolog, mirroring the order the two loaders write lang.scope in.
    SELECT a.language_id,
           COALESCE(a.scope, iso.scope, glot.scope) AS scope,
           a.population_estimate
      FROM language_source_attribute a
      LEFT JOIN language_source_attribute iso
             ON iso.language_id = a.language_id AND iso.source = 'ISO'
      LEFT JOIN language_source_attribute glot
             ON glot.language_id = a.language_id AND glot.source = 'Glottolog'
     WHERE a.source = p_source
  ),
  ranked AS (
    SELECT an.ancestor_id,
           e.language_id,
           ROW_NUMBER() OVER (
             PARTITION BY an.ancestor_id
             ORDER BY e.population_estimate DESC, an.depth, e.language_id
           ) AS rn
      FROM language_ancestry an
      JOIN effective e ON e.language_id = an.descendant_id
     -- depth > 0 makes this STRICT descendants. The closure carries depth-0
     -- self rows, and without this every populated languoid would be its own
     -- largest descendant.
     WHERE an.source = p_source
       AND an.depth  > 0
       AND e.scope IS DISTINCT FROM 5   -- 5 = language_scope Family
       -- pop.overall is language_source_attribute.population_estimate, which
       -- D8 already stores as NULLIF(GREATEST(speaking, writing), 0). Bare
       -- `> 0` rejects NULL and 0 alike, which is what `(x || 0) > 0` does.
       AND e.population_estimate > 0
  )
  UPDATE language_source_attribute a
     SET largest_descendant_id = r.language_id
    FROM ranked r
   WHERE r.rn = 1
     AND a.language_id = r.ancestor_id
     AND a.source      = p_source;

  -- The mirror, on the same rule as D7's descendant_count and D8's estimates:
  -- `language` follows Combined and nothing else, so a languoid with no
  -- Combined row keeps NULL rather than borrowing another source's answer.
  IF p_source = 'Combined' THEN
    UPDATE language SET largest_descendant_id = NULL;

    UPDATE language l
       SET largest_descendant_id = a.largest_descendant_id
      FROM language_source_attribute a
     WHERE a.language_id = l.id
       AND a.source      = 'Combined';
  END IF;

  ANALYZE language_source_attribute;
  ANALYZE language;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_largest_descendants(uuid, language_source) IS
  'D9. Fills language_source_attribute.largest_descendant_id for one '
  'classification source, then mirrors the Combined answer onto '
  'language.largest_descendant_id. The biggest non-family, non-zero languoid '
  'strictly beneath each node, by population_estimate. One grouped scan of the '
  'D1 closure rather than a tree walk, because the frontend recursion '
  'telescopes into a plain max. Depends on D1 for the closure and D8 for the '
  'estimates, so it can only answer for a source D8 has walked. The Family '
  'test uses the per-source scope falling back to ISO then Glottolog, which is '
  'what the frontend reads; see FP-016.';


-- ── D10  Depth ─────────────────────────────────────────────────────────────
--
-- The first half of computeRecursiveLanguageData: `lang.depth = depth`, the
-- distance from the root of the tree the user is currently viewing.
--
-- NO WALK, AND FOR A DIFFERENT REASON THAN D9's. D9 avoids a loop because its
-- recursion telescopes. This one avoids a loop because the answer is already
-- materialised: every classification source's parent graph is a genuine TREE,
-- not the DAG the closure table is built to tolerate - measured on all six
-- populated sources, no languoid has two ancestors at depth 1. In a tree there
-- is exactly one path from a node to its root, so the greatest depth recorded
-- against a node in language_ancestry IS its distance to the root. One grouped
-- scan of the closure D1 already built.
--
-- That equivalence is the whole trick and it is worth stating what would break
-- it: the day any source gives a languoid two parents, MIN(depth) in
-- rebuild_language_ancestry collapses the routes and max() here starts
-- reporting the shortest path to the FURTHEST reachable ancestor rather than
-- the depth of the root. The frontend has the same exposure from the other
-- side - it would visit such a node twice and keep whichever depth it wrote
-- last. A cycle cannot cause it; assert_no_language_cycles already runs.
--
-- ALL SIX SOURCES, unlike D8 and D9. Those two are Combined-only because they
-- rank by estimates D8 has walked for Combined alone. Depth depends on nothing
-- but D1, so restricting it would be a limitation invented rather than
-- inherited. There is no `language.depth` column and none is added: depth is
-- meaningless without naming a tree.
CREATE OR REPLACE FUNCTION rebuild_language_depth(p_run_id uuid)
RETURNS void AS $$
BEGIN
  -- Cleared first, on the same rule as D9: a row the closure can no longer
  -- answer for must lose its depth rather than keep a stale one. Today every
  -- language_source_attribute row has a depth-0 self row so the second
  -- statement refills all 60,173, but that is a measurement, not a guarantee.
  UPDATE language_source_attribute SET depth = NULL WHERE depth IS NOT NULL;

  UPDATE language_source_attribute lsa
     SET depth = d.depth
    FROM (SELECT source, descendant_id, max(depth) AS depth
            FROM language_ancestry
           GROUP BY source, descendant_id) d
   WHERE d.source        = lsa.source
     AND d.descendant_id = lsa.language_id;

  ANALYZE language_source_attribute;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_language_depth(uuid) IS
  'D10, first half. Fills language_source_attribute.depth for every '
  'classification source: the distance from the root of that source''s tree. '
  'One grouped scan of the D1 closure rather than a walk, because each '
  'source''s parent graph is a tree and the deepest closure entry for a node '
  'is therefore its root distance. Depends on D1 only.';


-- ── D10  Vitality rollup and coordinates ───────────────────────────────────
--
-- The second half of computeRecursiveLanguageData (lines 23-64). Two outputs
-- that look unrelated and are computed in one pass because the FRONTEND
-- computes them in one recursion: both are bottom-up over the same tree and
-- neither reads the other, so splitting them would walk it twice.
--
-- 1. THE RECURSION DOES NOT TELESCOPE, unlike D9's. `maxBy` is taken over a
--    child's ALREADY COMPUTED vitality, and a child that declares its own
--    value STOPS the values beneath it from rising any further. So an
--    ancestor's answer is the maximum over the nearest declared descendants,
--    not over all of them - a plain max over the closure would let a vigorous
--    dialect outvote the extinct language it sits under. This is D6 and D8's
--    shape, not D9's. Fourth step where the distinction has decided the
--    algorithm, and it has to be re-asked every time rather than generalised
--    from whichever step came last.
--
-- 2. THE DECLARED AND DERIVED ISO STATUS ARE DIFFERENT COLUMNS. language.
--    iso_status is what iso-639-3.tab says; language.vitality_iso is what the
--    recursion computes. Everything user-facing reads the derived one -
--    getField.ts:181, filterByEnum.tsx:49, the vitality sort - while
--    VitalityExplanation.tsx:30 reads the declared one, to decide whether to
--    label the number on screen "Derived". Writing the rollup back over
--    iso_status would make every inherited value claim to be declared.
--
-- 3. THE COORDINATE CLEAR MUST BE SCOPED, and this is the one that destroys
--    data rather than merely reporting a wrong number. D7, D8 and D9 all clear
--    their whole target column before rebuilding, which is right for a column
--    that is purely derived. latitude is NOT: Glottolog loads 8,907 positions
--    and this step only fills the gaps above them. 1,137 of those languoids
--    have no Combined row, so `UPDATE language SET latitude = NULL` followed
--    by a Combined-only rebuild silently deletes every one of them - and the
--    run reports success, because nothing counts a column going down.
--    coords_source is the discriminator, and it exists for exactly this.
--
-- 4. IT WRITES EVERY LANGUOID, NOT ONLY THE ONES IN THE TREE, which is the
--    opposite of the D7/D8/D9 mirror rule and is deliberate.
--    computeRecursiveLanguageData iterates the whole language dictionary and
--    starts from every node with no parent IN THE CURRENT SOURCE, so a
--    languoid outside the Combined tree is simply a root with no children and
--    keeps its own declared vitality. Restricting the write to Combined rows
--    would differ from the frontend on the one languoid that has an
--    iso_status and no Combined row. Those other columns are per-source
--    quantities being mirrored; this one is the frontend's actual output.
--
-- The `depth > 50` guard in the TypeScript has no analogue and needs none:
-- measured maximum depth is 5 for Combined and 26 for Glottolog, the deepest
-- tree there is. Worth knowing what it would do if a tree ever passed it - the
-- node keeps whatever `lang.depth` was written last and its vitality is never
-- computed, so the subtree above it silently loses its inputs. The level loop
-- has no such bound.
--
-- COMBINED ONLY, and unlike D9's remainder this one is deferred rather than
-- blocked. The vitality columns live on `language`, which mirrors Combined by
-- design, so widening needs per-source columns on
-- language_source_attribute before it needs a call-site change. Coordinates
-- additionally weight by the estimates D8 has walked for Combined alone.
CREATE OR REPLACE FUNCTION rebuild_recursive_language_data(p_run_id uuid,
                                                           p_source language_source)
RETURNS void AS $$
DECLARE
  max_depth int;
  d         int;
BEGIN
  -- Clear and seed the declared values in one pass. vitality_iso starts as the
  -- ISO 639-3 status, which is `if (lang.ISO.status != null) vitality.iso =
  -- lang.ISO.status` - the branch the loop below must never overwrite.
  UPDATE language
     SET vitality_iso        = iso_status,
         vitality_eth_fine   = NULL,
         vitality_eth_coarse = NULL,
         vitality_meta       = NULL;

  -- The two Ethnologue scales, where the authority declares them. 0 rows
  -- today: sil/ethnologue2012.tsv and sil/ethnologue2025.tsv are header-only
  -- in this repository, so every languoid falls through to the ISO scale and
  -- vitality_eth_fine and vitality_eth_coarse stay empty. That is an upstream
  -- gap the live site shares, not a step that failed to run, and verify()
  -- asserts the zero deliberately rather than leaving it to be rediscovered.
  UPDATE language l
     SET vitality_eth_fine   = a.eth_vitality_2012,
         vitality_eth_coarse = a.eth_vitality_2025
    FROM language_source_attribute a
   WHERE a.language_id = l.id
     AND a.source      = 'Ethnologue';

  -- Coordinates: clear ONLY what a previous run of this step wrote. See note 3
  -- above. The frontend stamps LanguageSource.Combined unconditionally
  -- (computeRecursiveLanguageData.ts:80); p_source is used instead so that the
  -- marker keeps naming the tree actually walked if this is ever widened.
  UPDATE language
     SET latitude = NULL, longitude = NULL, coords_source = NULL
   WHERE coords_source = p_source;

  -- Depth within THIS source's tree, recomputed from the closure rather than
  -- read from the column rebuild_language_depth just filled. Deliberate: a
  -- NULL depth would COALESCE to 0, collapse the loop to a single level and
  -- produce a complete-looking result with no rollup in it. Self-contained
  -- costs one grouped scan and removes an ordering trap between two halves of
  -- the same step.
  DROP TABLE IF EXISTS _rl_node;
  CREATE TEMP TABLE _rl_node ON COMMIT DROP AS
  SELECT lsa.language_id,
         lsa.parent_language_id,
         COALESCE((SELECT max(a.depth) FROM language_ancestry a
                    WHERE a.source = p_source
                      AND a.descendant_id = lsa.language_id), 0) AS depth
    FROM language_source_attribute lsa
   WHERE lsa.source = p_source;
  CREATE UNIQUE INDEX ON _rl_node (language_id);
  CREATE INDEX ON _rl_node (depth);
  CREATE INDEX ON _rl_node (parent_language_id);

  SELECT COALESCE(max(depth), 0) INTO max_depth FROM _rl_node;

  -- Deepest level first, so every child is final before its parent reads it.
  FOR d IN REVERSE max_depth..0 LOOP
    -- maxBy over the children's computed vitality. SQL max() ignores NULL and
    -- returns NULL when every input is NULL, which is maxBy's contract exactly
    -- (setUtils.ts:60-67) - GREATEST would not be, it propagates differently
    -- across versions and takes a fixed argument list.
    --
    -- COALESCE(existing, inherited) is the `if declared ... else` branch: a
    -- languoid that carries its own value never consults its children, so a
    -- family of vigorous dialects cannot raise an extinct language.
    UPDATE language l
       SET vitality_iso        = COALESCE(l.vitality_iso,        c.iso),
           vitality_eth_fine   = COALESCE(l.vitality_eth_fine,   c.fine),
           vitality_eth_coarse = COALESCE(l.vitality_eth_coarse, c.coarse)
      FROM (SELECT cn.parent_language_id           AS pid,
                   max(cl.vitality_iso)            AS iso,
                   max(cl.vitality_eth_fine)       AS fine,
                   max(cl.vitality_eth_coarse)     AS coarse
              FROM _rl_node cn
              JOIN language cl ON cl.id = cn.language_id
             WHERE cn.parent_language_id IS NOT NULL
             GROUP BY cn.parent_language_id) c
      JOIN _rl_node n ON n.language_id = c.pid
     WHERE l.id     = n.language_id
       AND n.depth  = d;

    -- computeCoordinates + averageCoordinates. Positions are averaged in 3D
    -- Cartesian space and converted back with atan2, NOT averaged as degrees:
    -- a plain mean puts the centre of a family spanning the date line in the
    -- middle of Asia. Each child is weighted by the FOURTH ROOT of its
    -- population, which is what keeps one large language from placing the
    -- whole family on top of itself.
    --
    -- Children with no position or no population are skipped, matching
    -- averageCoordinates.ts:18-21 - `getEntityWeight(child) > 0` rejects NULL
    -- and 0 alike, and D8 already stores population_estimate as
    -- NULLIF(GREATEST(speaking, writing), 0) so a bare `> 0` is that test.
    UPDATE language l
       SET latitude  = ROUND(degrees(atan2(c.z, sqrt(c.x * c.x + c.y * c.y)))::numeric, 6),
           longitude = ROUND(degrees(atan2(c.y, c.x))::numeric, 6),
           coords_source = p_source
      FROM (SELECT cn.parent_language_id AS pid,
                   sum(cos(radians(cl.latitude::double precision))
                       * cos(radians(cl.longitude::double precision))
                       * power(cs.population_estimate::double precision, 0.25))
                     / sum(power(cs.population_estimate::double precision, 0.25)) AS x,
                   sum(cos(radians(cl.latitude::double precision))
                       * sin(radians(cl.longitude::double precision))
                       * power(cs.population_estimate::double precision, 0.25))
                     / sum(power(cs.population_estimate::double precision, 0.25)) AS y,
                   sum(sin(radians(cl.latitude::double precision))
                       * power(cs.population_estimate::double precision, 0.25))
                     / sum(power(cs.population_estimate::double precision, 0.25)) AS z
              FROM _rl_node cn
              JOIN language cl ON cl.id = cn.language_id
              JOIN language_source_attribute cs
                ON cs.language_id = cn.language_id
               AND cs.source      = p_source
             WHERE cn.parent_language_id IS NOT NULL
               AND cl.latitude  IS NOT NULL
               AND cl.longitude IS NOT NULL
               AND cs.population_estimate > 0
             GROUP BY cn.parent_language_id) c
      JOIN _rl_node n ON n.language_id = c.pid
     WHERE l.id    = n.language_id
       AND n.depth = d
       -- OR, not AND. The guard is `if (lat != null && long != null) return;`,
       -- so a half-populated position is recomputed rather than left broken.
       AND (l.latitude IS NULL OR l.longitude IS NULL);
  END LOOP;

  -- getVitalityMetascore, from the finished values. Both Ethnologue scales
  -- present means their AVERAGE, which is why the column is numeric: 5.5 is a
  -- legitimate score and the frontend renders it with toFixed(1). / 2.0, not
  -- / 2 - integer division would round it away without an error.
  --
  -- Everything NULL leaves the metascore NULL rather than 0. A 0 here reads as
  -- Extinct, which is a real value on all three scales.
  UPDATE language
     SET vitality_meta = CASE
           WHEN vitality_eth_fine IS NOT NULL AND vitality_eth_coarse IS NOT NULL
             THEN (vitality_eth_fine + vitality_eth_coarse) / 2.0
           WHEN vitality_eth_fine   IS NOT NULL THEN vitality_eth_fine
           WHEN vitality_eth_coarse IS NOT NULL THEN vitality_eth_coarse
           ELSE vitality_iso
         END;

  ANALYZE language;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_recursive_language_data(uuid, language_source) IS
  'D10, second half. Walks one classification source''s tree from the leaves '
  'up, filling language.vitality_iso, vitality_eth_fine and vitality_eth_coarse '
  'from the nearest declared descendants, then language.vitality_meta from '
  'those, then the coordinates of grouping nodes from the population-weighted '
  'average of their children. Unlike D9 this does NOT telescope: a declared '
  'value blocks the ones beneath it, so the level loop is load-bearing. '
  'Coordinates are cleared by coords_source, never wholesale - the column '
  'holds loaded Glottolog positions as well as derived ones. Depends on D1 for '
  'the tree and D8 for the coordinate weights.';


-- ───────────────────────────────────────────────────────────────────────────
--  D11  computeLanguageFamiliesModality
-- ───────────────────────────────────────────────────────────────────────────
-- Gives a grouping node the modality its children imply, when the node does
-- not declare one of its own. languages.tsv supplies 946 declared values; this
-- adds 82 derived ones on the Combined tree, for 1,028 in total.
--
-- Seven things that decided the shape, all measured rather than assumed.
--
-- 1. IT IS COMBINED ONLY, AND NOT BECAUSE A DEPENDENCY IS MISSING. The
--    frontend traverses `lang.Combined.childLanguages`
--    (computeLanguageFamiliesModality.ts:29) unconditionally, even though it is
--    called with languagesInSelectedSource and filters roots by the SELECTED
--    source's parent. So the function is per-source in its entry points and
--    Combined in its edges, and the only answer it can produce is the Combined
--    one. A Glottolog modality would be an invention, not a port. D8's
--    unfilled per-source populations block it a second time, independently.
--
-- 2. IT DOES NOT TELESCOPE, and the number says so. Of the 82 derived answers,
--    28 read at least one child whose own modality was derived, and 12 have no
--    declared-modality child at all. A single bottom-up pass loses those 12 and
--    MOVES the other 16, with nothing to show for it. Fifth step to need this
--    question asked from scratch, and it lands with D6, D8 and D10's vitality
--    rather than with D9 and D10's depth.
--
-- 3. THE AVERAGE IS OVER THE MINORITY OF CHILDREN THAT DECLARE A MODALITY,
--    not over all of them. determineCombinedModality divides by the population
--    of the children that HAVE a modality, so a child with none contributes
--    nothing to either half of the fraction. `aus` Australian is the result
--    this produces that looks most like a bug: 279 children, 5 with a
--    modality, and exactly one of those with a nonzero population - `rsm`
--    Miriwoong Sign Language, population 3 - so a 3-speaker sign language
--    takes 100% of the weight and the whole family derives to Sign. Faithful
--    to the live site. Logged as FP-019.
--
-- 4. THE FRONTEND DIVIDES BY ZERO ONCE AND JAVASCRIPT HIDES IT. `sio` Siouan
--    has one child with a declared modality and no population, so totalPop is
--    0, `pop / totalPop` is NaN, and NaN fails all five threshold comparisons
--    in turn - so the function falls out of the bottom and returns
--    SpokenAndWritten. Postgres would raise instead, which makes this the one
--    branch that has to be written down deliberately. Ported as written, with
--    a golden check naming the languoid; the fix belongs upstream (FP-020).
--
-- 5. IT WRITES language_source_attribute.modality AND NEVER language.modality.
--    Two independent reasons, either sufficient. `language.modality` holds the
--    946 values loaded from languages.tsv, so an unqualified rebuild there
--    destroys loaded data (§9.12 #1, the rule that generalises). And
--    language_modality_discount() reads that same column when D8 estimates a
--    population from a rough number, so writing derived values back into it
--    closes a cycle between two derive steps. The split column already exists
--    and the schema comment on `language` asks for exactly this: a value that
--    changes when the user switches source belongs on the per-source table.
--
-- 6. THE SCOPE FALLBACK IS NEEDED AGAIN, and the dialect guard it feeds is a
--    no-op today. `lsa.scope` is NULL for every Combined row that is not one of
--    the 115 ISO 639-5 families, so the raw column finds 0 dialects where the
--    frontend sees 40. The FP-016 reconstruction is rebuilt below. Measured
--    consequence: none, because NONE of those 40 has children, and a childless
--    node reaches the same answer down either path. The guard is therefore
--    node-level rather than subtree-level, which is exact only while that 0
--    holds - verify() asserts it, and the day it fails the TypeScript's
--    behaviour of skipping the dialect's WHOLE SUBTREE has to be implemented.
--
-- 7. THE ARITHMETIC IS numeric, NOT double precision. The scores are compared
--    against five fixed thresholds, and the tightest call in the dataset is
--    `tbq` at 0.027 below the 0.5 boundary - far too wide for float error to
--    flip. numeric is used anyway so that summation order cannot move a value
--    at all, because the idempotency check is an md5 over the written column
--    and a partial order there fails intermittently rather than never (§9.11
--    #5).
--
-- The `depth > 30` guard in the TypeScript needs no analogue: measured maximum
-- depth in the Combined tree is 5, and the level loop has no such bound. The
-- loop also visits every node rather than only those reachable from a root,
-- which is the same set - assert_no_language_cycles() guarantees the parent
-- graph is a forest.
CREATE OR REPLACE FUNCTION rebuild_language_modality(p_run_id uuid,
                                                     p_source language_source)
RETURNS void AS $$
DECLARE
  max_depth int;
  d         int;
BEGIN
  -- Clear and seed in one statement, the D10 vitality_iso idiom. The declared
  -- value is `if (lang.modality != null) return lang.modality` - the branch
  -- the loop below must never overwrite - and NULL everywhere else is the
  -- clear. Safe to clear wholesale because nothing loads this column: it is
  -- absent from registry.py's language_source_attribute column list, which is
  -- the check §9.12 #1 says to make before copying a clear from another step.
  UPDATE language_source_attribute a
     SET modality = l.modality
    FROM language l
   WHERE l.id      = a.language_id
     AND a.source  = p_source;

  -- Depth recomputed from the closure rather than read from
  -- language_source_attribute.depth, for the reason D10 gives: a NULL depth
  -- would COALESCE to 0, collapse the loop to one level and produce a
  -- complete-looking result with no rollup in it.
  DROP TABLE IF EXISTS _lm_node;
  CREATE TEMP TABLE _lm_node ON COMMIT DROP AS
  SELECT a.language_id,
         a.parent_language_id,
         -- FP-016. lang.scope is `specific.scope ?? lang.scope`, where the base
         -- is the load-time ISO value with Glottolog filling the gaps. Same
         -- reconstruction as D9, same order.
         COALESCE(a.scope, iso.scope, glot.scope) AS scope,
         -- pop.overall, which D8 stores as NULLIF(GREATEST(speaking, writing),
         -- 0). NULL is a real answer here and is treated as `?? 0` below.
         a.population_estimate,
         COALESCE((SELECT max(an.depth) FROM language_ancestry an
                    WHERE an.source        = p_source
                      AND an.descendant_id = a.language_id), 0) AS depth
    FROM language_source_attribute a
    LEFT JOIN language_source_attribute iso
           ON iso.language_id = a.language_id AND iso.source = 'ISO'
    LEFT JOIN language_source_attribute glot
           ON glot.language_id = a.language_id AND glot.source = 'Glottolog'
   WHERE a.source = p_source;
  CREATE UNIQUE INDEX ON _lm_node (language_id);
  CREATE INDEX ON _lm_node (depth);
  CREATE INDEX ON _lm_node (parent_language_id);

  SELECT COALESCE(max(depth), 0) INTO max_depth FROM _lm_node;

  -- Deepest level first, so every child is final before its parent reads it.
  -- See note 2: this loop is load-bearing, it is not a slower way to write one
  -- statement.
  FOR d IN REVERSE max_depth..0 LOOP
    UPDATE language_source_attribute a
       SET modality = CASE
             -- `langs.every(l => l.modality === langs[0].modality)` where every
             -- child is undefined returns undefined. Not 0: SpokenAndWritten is
             -- a real value and would claim knowledge nobody has.
             WHEN c.with_modality = 0 THEN NULL
             -- The same branch where they all agree on a real value. Population
             -- is never consulted, so a family of unpopulated sign languages
             -- still derives to Sign.
             WHEN c.with_modality = c.kids AND c.lo = c.hi THEN c.lo
             -- Note 4. totalPop = 0 makes every term NaN in JavaScript, NaN
             -- fails all five comparisons below, and the function returns
             -- SpokenAndWritten. One node reaches this: `sio` Siouan.
             WHEN c.total_pop = 0 THEN 0
             -- sum(modality * pop) / sum(pop) is sum(modality * pop / pop_total)
             -- rearranged to divide once. Then the thresholds, exactly as
             -- written: >= on the spoken side, <= on the written side, and
             -- SpokenAndWritten as the fall-through rather than as a band.
             ELSE CASE
               WHEN c.weighted / c.total_pop >=  2.5 THEN  3
               WHEN c.weighted / c.total_pop >=  1.5 THEN  2
               WHEN c.weighted / c.total_pop >=  0.5 THEN  1
               WHEN c.weighted / c.total_pop <= -1.5 THEN -2
               WHEN c.weighted / c.total_pop <= -0.5 THEN -1
               ELSE 0
             END
           END
      FROM (SELECT cn.parent_language_id AS pid,
                   count(*)              AS kids,
                   count(ca.modality)    AS with_modality,
                   min(ca.modality)      AS lo,
                   max(ca.modality)      AS hi,
                   -- Both sums skip the children with no modality. In the
                   -- TypeScript the numerator keeps them and multiplies by
                   -- `lang.modality ?? 0`, which is the same thing said less
                   -- directly; the denominator drops them outright.
                   sum(CASE WHEN ca.modality IS NOT NULL
                            THEN COALESCE(cn.population_estimate, 0)
                            ELSE 0 END)::numeric AS total_pop,
                   sum(CASE WHEN ca.modality IS NOT NULL
                            THEN ca.modality * COALESCE(cn.population_estimate, 0)
                            ELSE 0 END)::numeric AS weighted
              FROM _lm_node cn
              JOIN language_source_attribute ca
                ON ca.language_id = cn.language_id
               AND ca.source      = p_source
             WHERE cn.parent_language_id IS NOT NULL
             GROUP BY cn.parent_language_id) c
      JOIN _lm_node n ON n.language_id = c.pid
     WHERE a.language_id = n.language_id
       AND a.source      = p_source
       AND n.depth       = d
       -- The declared value wins and is never recomputed.
       AND a.modality    IS NULL
       -- The dialect early return, note 6. IS DISTINCT FROM, not <>: 101
       -- Combined languoids have no scope under any source and `<>` drops
       -- every one of them silently (§9.11 #7).
       AND n.scope       IS DISTINCT FROM 2;
  END LOOP;

  ANALYZE language_source_attribute;
END $$ LANGUAGE plpgsql;

COMMENT ON FUNCTION rebuild_language_modality(uuid, language_source) IS
  'D11, and the last step in the derive chain. Fills '
  'language_source_attribute.modality with the modality each languoid '
  'effectively has under one classification source: the value languages.tsv '
  'declares where there is one, otherwise the population-weighted average of '
  'the modalities of its children, mapped back onto the -2..3 axis. Combined '
  'only, because the frontend function traverses the Combined child lists '
  'whatever source is selected, so no other answer exists to port. Does NOT '
  'telescope - 28 of the 82 derived answers read a child that was itself '
  'derived - so the level loop is load-bearing. Never writes language.modality: '
  'that column holds the 946 loaded values and language_modality_discount() '
  'reads it, so writing there would destroy loaded data and close a cycle with '
  'D8. Depends on D1 for the tree and D8 for the weights.';


COMMIT;

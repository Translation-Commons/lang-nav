import { EntityType, LocaleSeparator } from '@features/params/PageParamTypes';

import { getLocaleCodeFromTags } from '@entities/locale/LocaleParsing';
import {
  LocaleData,
  LocaleSource,
  OfficialStatus,
  PopulationSourceCategory,
} from '@entities/locale/LocaleTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { fetchFromApi } from './apiConfig';

/**
 * Loads locales from the API instead of from `locales.tsv`.
 *
 * SCOPE: this replaces `parseLocaleLine` ONLY, and it deliberately returns the
 * six raw columns that file carries and nothing else.
 *
 * The `locale` table is much wider than the file, because D4-D6 write their
 * results back into it. None of those columns are selected:
 *
 * - `pop_speaking_adjusted`, `pop_*_percent`, `pop_*_census_id`,
 *   `pop_*_source_derived` and `pop_*_unadjusted_derived` are all recomputed by
 *   `computeLocalesPopulationFromCensuses`, which does not merely fill blanks -
 *   `applyPopRecord` OVERWRITES `pop.speaking.unadjusted` and `.source` from
 *   the winning census. Sending the derived figures would seed the browser with
 *   a value it is about to replace, and hide any disagreement between the two.
 * - `literacy_percent` is assigned with a plain `=` in three places
 *   (`computeLocalesPopulationFromCensuses`, and
 *   `computeAggregatedLocalesPopulation` twice), so the browser owns it.
 * - `lang_formed_here`, `historic_presence` and `ecrml_protection` are withheld
 *   because `loadIndigeneity` and `loadECRML` still run on the API path. See
 *   the note on the query below for why they cannot be skipped.
 *
 * The request count therefore does NOT drop: `locales.tsv` is the only file
 * `loadLocales` reads, so one file becomes one request. The value of this step
 * is that locale gains a field-by-field parity baseline, which the pending fix
 * to the languoid identity mismatch needs before it can remap the ~2,351
 * `locale.language_id` rows that fix has to move.
 */

/** The embedded `entity` row. `name_display` lives there rather than on
 *  `locale`, because every entity type shares one display-name column. */
type ApiEntity = {
  name_display: string;
};

export type ApiLocale = {
  id: string;
  language_id: string;
  script_id: string | null;
  territory_id: string | null;
  variant_key: string;
  name_endonym: string | null;
  official_status: string | null;
  pop_speaking_unadjusted: number | null;
  pop_speaking_source: string | null;
  entity: ApiEntity;
};

/**
 * ONLY THE 11,016 `StableDatabase` ROWS.
 *
 * `locale` holds 55,814 rows, but 44,798 of them are generated: D5 builds
 * 23,543 regional locales and D6 builds 21,255 family ones. The browser builds
 * both itself, unconditionally, in `connectEntitiesAndCreateDerivedData`
 * (`createRegionalLocales.ts` and `createFamilyLocales.ts`), from populations it
 * has just computed. Sending the database's copies would duplicate every one of
 * them under the same ids.
 *
 * The two sides do not even generate the same set: `createFamilyLocales` is
 * pinned to `LanguageSource.ISO` to bound the locale count, so the frontend
 * never makes the 17,198 Glottolog family locales D6 does.
 *
 * Measured against local PostgREST, and the filter is most of the difference:
 *
 * | Query                          |   Rows |     Raw | Gzipped |
 * | ------------------------------ | -----: | ------: | ------: |
 * | `select=*`, all rows           | 55,814 | 50.27MB | 2,145KB |
 * | named columns, all rows        | 55,814 | 14.46MB | 1,027KB |
 * | named columns, StableDatabase  | 11,016 |  2.78MB |   263KB |
 * | the `locales.tsv` it replaces  | 11,017 |  0.19MB |   165KB |
 *
 * 1.56x larger gzipped than the file it replaces, which is the expected
 * direction for one entity replacing one large file - compression has less to
 * amortise than the 172-file census case. An earlier planning estimate of
 * 13.9 MB / 1.0 MB matches the unfiltered row instead, so it was measured
 * before anyone established that the derived rows must not be sent.
 *
 * `db-max-rows` is 100,000. 11,016 parents is 11% of the cap, and there is no
 * embed that can approach it first: `entity` is 1:1.
 *
 * NO `locale_variant` EMBED. `variant_key` is a deliberate denormalisation of
 * that table - the ordered subtags joined with '.' - which exists so the
 * uniqueness constraint can see variants at all. It was verified to match
 * `locale_variant` ordered by `position` on all 26 rows that have variants, so
 * reading it avoids a second embed entirely.
 *
 * `order=id.asc` because Postgres promises nothing about row order without it.
 */
const LOCALE_QUERY =
  '/locale?select=id,language_id,script_id,territory_id,variant_key,name_endonym,' +
  'official_status,pop_speaking_unadjusted,pop_speaking_source,entity(name_display)' +
  '&locale_source=eq.StableDatabase&order=id.asc';

export async function loadLocalesFromApi(): Promise<Record<string, LocaleData> | void> {
  // Resolves to undefined on failure, never rejects. CoreData.tsx awaits every
  // loader in one Promise.all and then checks the results for null; a rejected
  // promise skips that check entirely, so the alert never runs and the loading
  // indicator sticks forever with the cause only in the console.
  try {
    const rows = await fetchFromApi<ApiLocale[]>(LOCALE_QUERY);
    return toDictionary(rows.map(parseApiLocale), (locale) => locale.ID);
  } catch (err) {
    console.error('Error loading locales from the API:', err);
    return undefined;
  }
}

/** JSON `null` means absent; the optional fields on LocaleData are `?:`, so
 *  leaving nulls in place would violate the type and change truthiness at every
 *  consumer. NOT used for `pop.speaking.source` - see `populationSource`. */
function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

/**
 * NULL becomes the EMPTY STRING here, not `undefined`, and that is the one
 * place this mapper deliberately breaks the null-to-undefined rule.
 *
 * `PopulationSourceCategory.NoSource` IS the empty string, and `parseLocaleLine`
 * stores exactly that for the 2,046 locales whose "Population Source" cell is
 * blank: `parts[3] as PopulationSourceCategory | undefined` keeps `''` because
 * `''` is a real member of the enum. The ETL stores those as SQL NULL, so the
 * two are only equivalent if the mapper puts the empty string back.
 *
 * It is user-visible. `LocaleCensusCitation` renders on `if (source != null)`,
 * so `''` reaches `PopulationSource` and shows "no citation", while `undefined`
 * falls through to "n/a". Same for the `switch` in
 * `PopulationSourceCategoryDisplay`, where `undefined` matches no case at all
 * and renders nothing. This is the census `quantity` trap in another table: a
 * database default erasing the difference between "not stated" and "stated as
 * blank".
 */
function populationSource(value: string | null): PopulationSourceCategory {
  return (value ?? PopulationSourceCategory.NoSource) as PopulationSourceCategory;
}

export function parseApiLocale(row: ApiLocale): LocaleData {
  const languageCode = row.language_id;
  const scriptCode = orUndefined(row.script_id);
  const territoryCode = orUndefined(row.territory_id);
  // '' means no variants. Splitting it would yield [''] rather than [].
  const variantCodes = row.variant_key === '' ? [] : row.variant_key.split('.');

  // THE ID IS REBUILT FROM THE PARTS, NOT READ FROM `row.id`.
  //
  // `locale.id` is the locale code exactly as it was typed in locales.tsv,
  // because the ETL stores the source string verbatim. The frontend does not:
  // `parseLocaleLine` runs the code through `parseLocaleCode`, which LOWERCASES
  // the variant subtags, and then reassembles it with `getLocaleCodeFromTags`.
  //
  // So the database holds `roh_CH_SURSILV` where the browser holds
  // `roh_CH_sursilv`. Passing `row.id` through gives eight locales - the seven
  // Romansh idioms plus `eng_basiceng` - an id no other part of the app uses,
  // and the id is the key for `ents[]` lookups, URLs and search results.
  //
  // Rebuilding through the same helper the file path uses means the two agree
  // by construction rather than by coincidence.
  const ID = getLocaleCodeFromTags(
    { languageCode, scriptCode, territoryCode, variantCodes },
    LocaleSeparator.Underscore,
  );

  const nameDisplay = row.entity.name_display;
  const nameEndonym = orUndefined(row.name_endonym);

  // Both `pop.speaking.unadjusted` and `pop.rough` come from the single
  // "Population" column, exactly as parseLocaleLine sets them.
  //
  // The column is `pop_speaking_unadjusted`, the CURATED figure, and NOT
  // `pop_speaking_unadjusted_derived` beside it. The derived one holds what the
  // winning census reported - which is what the browser will overwrite this
  // with later, in applyPopRecord - so sending it would pre-apply a computation
  // the browser is about to redo, and the file path would never match. The
  // schema comment on that column is explicit that the curated value is the
  // untouched one from locales.tsv.
  const population = orUndefined(row.pop_speaking_unadjusted);

  return {
    type: EntityType.Locale,
    ID,
    codeDisplay: ID,
    localeSource: LocaleSource.StableDatabase,

    nameDisplay,
    nameEndonym,
    names: [nameDisplay, nameEndonym].filter((s) => s != null),
    languageCode,
    territoryCode,
    scriptCode,
    variantCodes,
    officialStatus: orUndefined(row.official_status) as OfficialStatus | undefined,
    pop: {
      speaking: {
        unadjusted: population,
        source: populationSource(row.pop_speaking_source),
      },
      writing: {},
      rough: population,
    },
  };
}

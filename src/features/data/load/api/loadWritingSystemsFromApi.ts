import { EntityType } from '@features/params/PageParamTypes';

import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { fetchFromApi, orUndefined } from './apiConfig';

/**
 * Loads writing systems from the API instead of from `writingSystems.tsv`.
 *
 * One request. The grouping relation (`writing_system_contains`, e.g. Jpan
 * contains Hani + Hira + Kana) is embedded rather than fetched separately, so
 * Postgres does that join, not the browser. It needs a disambiguation hint
 * because the junction table has two foreign keys to `writing_system` -
 * `writing_system_contains_parent_id_fkey`, confirmed against the live
 * database rather than assumed from naming convention.
 *
 * `population_upper_bound` and `population_of_descendants` are withheld like
 * territory's derived figures. Two places accumulate into `populationUpperBound`
 * with `+=` behind an `if (!x)` guard - `connectWritingSystems.ts` from
 * language data and `connectLocales.ts` from locale data - so a value already
 * present from the API would not be reset to 0 first and either one would
 * double-count on top of it.
 */

/** The embedded `entity` row. name_endonym lives here, not on
 *  `writing_system` itself, even though a column of the same name exists
 *  there too - see the note on nameDisplayOriginal below for why this file
 *  doesn't read from writing_system's own copy of anything. */
type ApiEntity = {
  name_display: string;
  name_endonym: string | null;
};

type ApiContainedChild = {
  child_id: string;
};

export type ApiWritingSystem = {
  id: string;
  scope: string;
  name_full: string | null;
  unicode_version: number | null;
  sample: string | null;
  right_to_left: boolean | null;
  primary_language_id: string | null;
  territory_of_origin_id: string | null;
  parent_writing_system_id: string | null;
  entity: ApiEntity;
  writing_system_contains: ApiContainedChild[];
};

// order= is set on both levels: Postgres promises nothing about row order
// without it, embedded rows included.
const WRITING_SYSTEM_QUERY =
  '/writing_system?select=id,scope,name_full,unicode_version,sample,right_to_left,' +
  'primary_language_id,territory_of_origin_id,parent_writing_system_id,' +
  'entity(name_display,name_endonym),' +
  'writing_system_contains!writing_system_contains_parent_id_fkey(child_id)' +
  '&order=id.asc&writing_system_contains.order=child_id.asc';

export async function loadWritingSystemsFromApi(): Promise<Record<
  string,
  WritingSystemData
> | void> {
  try {
    const rows = await fetchFromApi<ApiWritingSystem[]>(WRITING_SYSTEM_QUERY);
    return toDictionary(rows.map(parseApiWritingSystem), (ws) => ws.ID);
  } catch (err) {
    console.error('Error loading writing systems from the API:', err);
    return undefined;
  }
}

export function parseApiWritingSystem(row: ApiWritingSystem): WritingSystemData {
  const nameDisplay = row.entity.name_display;
  const nameEndonym = orUndefined(row.entity.name_endonym);
  // parseWritingSystem reads this straight off the TSV column with no
  // `|| undefined` guard, so a blank cell there is '', not absent. No current
  // row has one, but matching an empty string instead of undefined here keeps
  // this mapper right if one shows up.
  const nameFull = row.name_full ?? '';

  return {
    type: EntityType.WritingSystem,

    ID: row.id,
    codeDisplay: row.id,
    scope: row.scope as WritingSystemScope,

    nameDisplay,
    // parseWritingSystem sets this to the same value as nameDisplay rather
    // than reading a separate source column - name_display_original exists on
    // the writing_system table but the ETL never writes to it, so it's always
    // NULL and can't be used here without breaking parity.
    nameDisplayOriginal: nameDisplay,
    nameFull,
    nameEndonym,
    // `!= null`, not a truthy filter, to match parseWritingSystem exactly -
    // it would keep an empty string here, not just drop null/undefined.
    names: [nameDisplay, nameFull, nameEndonym].filter((s): s is string => s != null),

    unicodeVersion: orUndefined(row.unicode_version),
    sample: orUndefined(row.sample),
    rightToLeft: orUndefined(row.right_to_left),
    primaryLanguageCode: orUndefined(row.primary_language_id),
    territoryOfOriginCode: orUndefined(row.territory_of_origin_id),
    parentWritingSystemCode: orUndefined(row.parent_writing_system_id),
    containsWritingSystemsCodes: row.writing_system_contains.map((child) => child.child_id),
  };
}

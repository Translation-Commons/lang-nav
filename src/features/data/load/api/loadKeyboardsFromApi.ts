import { EntityType } from '@features/params/PageParamTypes';

import {
  KeyboardData,
  KeyboardDictionary,
  KeyboardPlatform,
} from '@entities/keyboard/KeyboardTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { fetchFromApi, orUndefined } from './apiConfig';

/**
 * Loads keyboards from the API instead of from `google/gboards.tsv` and
 * `keyman/keyboards.tsv`.
 *
 * ONE request replaces two files. Both platforms live in the same `keyboard`
 * table and are told apart by the `platform` column, so there is no reason to
 * ask twice - which is why this exports a single loader where the file path
 * has `loadKeyboardsGBoard` and `loadKeyboardsKeyman` side by side.
 *
 * Both junctions are embedded rather than fetched separately, so Postgres does
 * those joins instead of the browser: `keyboard_language` (one row per
 * language, 1 for GBoard and 1+ for Keyman) and `keyboard_platform_support`
 * (Keyman's 'windows,macos,ios' cell, unpivoted by the ETL into one row per
 * operating system). Neither needs a disambiguation hint - unlike
 * `writing_system_contains`, each has exactly one foreign key back to
 * `keyboard`.
 *
 * The platform-specific columns are NOT filtered here, because the schema's
 * `keyboard_platform_fields` CHECK already guarantees them: a GBoard row
 * cannot carry downloads and a Keyman row cannot carry a territory or variant.
 * Mapping them unconditionally therefore yields `undefined` on the platform
 * that should not have them, which is exactly what the two TSV parsers
 * produce.
 */

/** The embedded `entity` row. The ETL writes `name_display` from the TSV's
 *  Name column, falling back to the id when it is blank. */
type ApiEntity = {
  name_display: string;
};

type ApiKeyboardLanguage = {
  language_id: string;
  position: number;
};

type ApiKeyboardPlatformSupport = {
  os: string;
  position: number;
};

export type ApiKeyboard = {
  id: string;
  platform: string;
  territory_id: string | null;
  input_script_id: string | null;
  output_script_id: string | null;
  variant_id: string | null;
  variant_code_raw: string | null;
  downloads: number | null;
  total_downloads: number | null;
  entity: ApiEntity;
  keyboard_language: ApiKeyboardLanguage[];
  keyboard_platform_support: ApiKeyboardPlatformSupport[];
};

// order= is set on all three levels: Postgres promises nothing about row order
// without it, embedded rows included.
//
// The junctions order by `position`, NOT by their own value. Both arrays are
// rendered verbatim by KeyboardDetails with .join(', '), and the source order
// is meaningful: alphabetising would change 150 of 1,085 keyboards' language
// lists and 1,021 of their platform lists. The source itself is not
// consistently ordered - 'linux,macos,windows' and 'windows,macos,linux' both
// occur - so there is no sort that reproduces it. `position` is carried
// through the ETL for exactly this reason.
const KEYBOARD_QUERY =
  '/keyboard?select=id,platform,territory_id,input_script_id,output_script_id,' +
  'variant_id,variant_code_raw,downloads,total_downloads,' +
  'entity(name_display),' +
  'keyboard_language(language_id,position),' +
  'keyboard_platform_support(os,position)' +
  '&order=id.asc&keyboard_language.order=position.asc' +
  '&keyboard_platform_support.order=position.asc';

/**
 * In flight or already resolved, so the two callers share ONE request.
 *
 * `loadKeyboardsGBoard` and `loadKeyboardsKeyman` both call this - the file
 * path needs two loaders because there are two files, and CoreData awaits them
 * in the same `Promise.all`. Without this they would issue the same query
 * twice, concurrently, and the second would not even be served from the HTTP
 * cache because it starts before the first response arrives.
 *
 * Deliberately NOT cleared on success: core data loads once per page load, and
 * a keyboard cannot change underneath a session. It IS cleared on failure, so
 * a retry is a real retry rather than a replay of the rejection.
 */
let inFlight: Promise<KeyboardDictionary | void> | undefined;

export async function loadKeyboardsFromApi(): Promise<KeyboardDictionary | void> {
  inFlight ??= fetchKeyboards();
  return await inFlight;
}

async function fetchKeyboards(): Promise<KeyboardDictionary | void> {
  try {
    const rows = await fetchFromApi<ApiKeyboard[]>(KEYBOARD_QUERY);
    return toDictionary(rows.map(parseApiKeyboard), (keyboard) => keyboard.ID);
  } catch (err) {
    console.error('Error loading keyboards from the API:', err);
    inFlight = undefined;
    return undefined;
  }
}

/** Test seam: drops the shared promise so each case starts clean. Production
 *  never calls this - core data loads once and the cache is meant to hold. */
export function resetKeyboardApiCache(): void {
  inFlight = undefined;
}

export function parseApiKeyboard(row: ApiKeyboard): KeyboardData {
  const nameDisplay = row.entity.name_display;

  return {
    type: EntityType.Keyboard,

    ID: row.id,
    codeDisplay: row.id,
    nameDisplay,
    // Both TSV parsers set this to exactly `[nameDisplay]` - the keyboard's
    // only name - so this is a one-element array, not a filtered collection.
    names: [nameDisplay],
    platform: row.platform as KeyboardPlatform,

    // The database stores RESOLVED language ids: the ETL maps the source's
    // BCP-47 codes through the 639-1 alias table, so `ak,ee,gaa,dag` is stored
    // as `aka,ewe,gaa,dag`. The file path keeps the raw two-letter codes and
    // connectKeyboards resolves them against the BCP dictionary at connect
    // time, so both paths reach the same LanguageData - this array just
    // arrives already resolved. It is only ever rendered raw when NO language
    // resolves, which cannot happen for an id that came out of the database.
    languageCodes: row.keyboard_language.map((link) => link.language_id),

    // The TSV parsers read these positionally and coerce '' to undefined;
    // the API sends JSON null for the same absence.
    territoryCode: orUndefined(row.territory_id),
    // input/output script are non-null for every current row, but the columns
    // are nullable - the ETL sets them to NULL rather than dropping the
    // keyboard when a script code is unknown. `?? ''` keeps the field a
    // string, matching the TSV parsers, which type these as required and
    // would produce '' from a blank cell.
    inputScriptCode: row.input_script_id ?? '',
    outputScriptCode: row.output_script_id ?? '',
    // `variant_code_raw`, NOT `variant_id`. Three GBoard keyboards carry
    // BCP-47 private-use subtags ('x-upper', 'x-snd') that are registered
    // nowhere, so the foreign key is NULL for them while the raw subtag is
    // kept. KeyboardDetails renders this as text whether or not it resolves to
    // a variant, so reading the foreign key here would blank a field the file
    // path shows. For every registered variant the two columns are equal.
    variantCode: orUndefined(row.variant_code_raw),

    // Keyman only. Absent on GBoard rows by schema CHECK, not by a branch here.
    downloads: orUndefined(row.downloads),
    totalDownloads: orUndefined(row.total_downloads),
    // The TSV parser leaves this undefined rather than [] when the cell is
    // blank, so an empty embed has to collapse back to undefined - otherwise
    // every GBoard row would gain an empty array the file path never gives it.
    platformSupport: row.keyboard_platform_support.length
      ? row.keyboard_platform_support.map((support) => support.os)
      : undefined,
  };
}

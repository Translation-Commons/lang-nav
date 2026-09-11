import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { KeyboardPlatform } from '@entities/keyboard/KeyboardTypes';

import {
  ApiKeyboard,
  loadKeyboardsFromApi,
  parseApiKeyboard,
  resetKeyboardApiCache,
} from '../loadKeyboardsFromApi';

/**
 * These test the mapping only, against fixtures shaped exactly like the API's
 * JSON. They need no network and no database.
 *
 * Whether the mapping AGREES with the two TSV paths is a different question,
 * and one a unit test cannot answer - see `loadKeyboardsParity.test.ts`.
 */

/** A GBoard row: one language, no downloads, no platform support. The three
 *  Keyman-only columns are NULL by the schema's keyboard_platform_fields
 *  CHECK, not by convention. */
const gboardAfar: ApiKeyboard = {
  id: 'gboard_aar_Latn',
  platform: 'GBoard',
  territory_id: null,
  input_script_id: 'Latn',
  output_script_id: 'Latn',
  variant_id: null,
  variant_code_raw: null,
  downloads: null,
  total_downloads: null,
  entity: { name_display: 'Afar' },
  keyboard_language: [{ language_id: 'aar', position: 0 }],
  keyboard_platform_support: [],
};

/** A GBoard row that DOES carry a territory and a variant, which is the half
 *  of the platform split the Afar row cannot exercise. */
const gboardValencia: ApiKeyboard = {
  id: 'gboard_cat_Latn_valencia',
  platform: 'GBoard',
  territory_id: 'ES',
  input_script_id: 'Latn',
  output_script_id: 'Latn',
  variant_id: 'valencia',
  variant_code_raw: 'valencia',
  downloads: null,
  total_downloads: null,
  entity: { name_display: 'Catalan (Valencian)' },
  keyboard_language: [{ language_id: 'cat', position: 0 }],
  keyboard_platform_support: [],
};

/**
 * Real data: a private-use variant subtag. 'x-upper' is a BCP-47 private-use
 * tag, registered nowhere, so `variant_id` is NULL while `variant_code_raw`
 * keeps what the source wrote.
 */
const gboardPrivateUse: ApiKeyboard = {
  id: 'gboard_chr_Cher_x-upper',
  platform: 'GBoard',
  territory_id: null,
  input_script_id: 'Cher',
  output_script_id: 'Cher',
  variant_id: null,
  variant_code_raw: 'x-upper',
  downloads: null,
  total_downloads: null,
  entity: { name_display: 'Cherokee, Uppercase only' },
  keyboard_language: [{ language_id: 'chr', position: 0 }],
  keyboard_platform_support: [],
};

/** A Keyman row with four languages and all seven platforms. Real data.
 *  Positions are contiguous here; see `keymanBehdini` for the gapped case. */
const keymanAdinkra: ApiKeyboard = {
  id: 'keyman_adinkra',
  platform: 'Keyman',
  territory_id: null,
  input_script_id: 'Latn',
  output_script_id: 'Latn',
  variant_id: null,
  variant_code_raw: null,
  downloads: 105,
  total_downloads: 1609,
  entity: { name_display: 'Adinkra' },
  keyboard_language: [
    { language_id: 'aka', position: 0 },
    { language_id: 'ewe', position: 1 },
    { language_id: 'gaa', position: 2 },
    { language_id: 'dag', position: 3 },
  ],
  keyboard_platform_support: [
    { os: 'windows', position: 0 },
    { os: 'macos', position: 1 },
    { os: 'linux', position: 2 },
    { os: 'desktopWeb', position: 3 },
    { os: 'ios', position: 4 },
    { os: 'android', position: 5 },
    { os: 'mobileWeb', position: 6 },
  ],
};

/**
 * Real data, and the reason `position` exists at all. The source cell is
 * `kmr,ku,ku,ckb`: `ku` is the ISO 639-1 code the ETL resolves to `kur`, and
 * its SECOND occurrence is dropped by the junction's primary key. That leaves
 * positions 0, 1 and 3 - a gap at 2 - which is why the mapper must sort by
 * position rather than assume a dense index.
 */
const keymanBehdini: ApiKeyboard = {
  id: 'keyman_behdini_arab',
  platform: 'Keyman',
  territory_id: null,
  input_script_id: 'Latn',
  output_script_id: 'Latn',
  variant_id: null,
  variant_code_raw: null,
  downloads: 54,
  total_downloads: 1255,
  entity: { name_display: 'Behdini AR' },
  keyboard_language: [
    { language_id: 'kmr', position: 0 },
    { language_id: 'kur', position: 1 },
    { language_id: 'ckb', position: 3 },
  ],
  keyboard_platform_support: [
    { os: 'windows', position: 0 },
    { os: 'macos', position: 1 },
  ],
};

describe('parseApiKeyboard', () => {
  it('maps the identity fields', () => {
    const keyboard = parseApiKeyboard(gboardAfar);
    expect(keyboard.type).toBe(EntityType.Keyboard);
    expect(keyboard.ID).toBe('gboard_aar_Latn');
    expect(keyboard.codeDisplay).toBe('gboard_aar_Latn');
    expect(keyboard.nameDisplay).toBe('Afar');
  });

  // Both TSV parsers build this as exactly `[nameDisplay]` - a keyboard has
  // one name, unlike a writing system which has three candidates to filter.
  it('builds names as the single display name', () => {
    expect(parseApiKeyboard(gboardAfar).names).toEqual(['Afar']);
    expect(parseApiKeyboard(keymanAdinkra).names).toEqual(['Adinkra']);
  });

  it('maps the platform onto the enum', () => {
    expect(parseApiKeyboard(gboardAfar).platform).toBe(KeyboardPlatform.GBoard);
    expect(parseApiKeyboard(keymanAdinkra).platform).toBe(KeyboardPlatform.Keyman);
  });

  it('maps the script codes, which both platforms share', () => {
    const keyboard = parseApiKeyboard(keymanAdinkra);
    expect(keyboard.inputScriptCode).toBe('Latn');
    expect(keyboard.outputScriptCode).toBe('Latn');
  });

  it('reads languages out of the embedded junction', () => {
    expect(parseApiKeyboard(gboardAfar).languageCodes).toEqual(['aar']);
    expect(parseApiKeyboard(keymanAdinkra).languageCodes).toEqual(['aka', 'ewe', 'gaa', 'dag']);
  });

  /**
   * The whole point of ordering the embed by `position`. `aka,ewe,gaa,dag` is
   * not alphabetical, and KeyboardDetails renders the list verbatim with
   * `.join(', ')`, so sorting it would be a visible change on 150 of the 1,085
   * Keyman keyboards.
   */
  it('preserves the source order of languages rather than sorting them', () => {
    const codes = parseApiKeyboard(keymanAdinkra).languageCodes;
    expect(codes).toEqual(['aka', 'ewe', 'gaa', 'dag']);
    expect(codes).not.toEqual([...codes].sort());
  });

  it('keeps the order when positions are not contiguous', () => {
    // 0, 1, 3 - the gap is a deduplicated repeat, not a missing language.
    expect(parseApiKeyboard(keymanBehdini).languageCodes).toEqual(['kmr', 'kur', 'ckb']);
  });

  it('preserves the source order of platform support', () => {
    const platforms = parseApiKeyboard(keymanAdinkra).platformSupport;
    expect(platforms).toEqual([
      'windows',
      'macos',
      'linux',
      'desktopWeb',
      'ios',
      'android',
      'mobileWeb',
    ]);
    expect(platforms).not.toEqual([...(platforms ?? [])].sort());
  });

  /**
   * The TSV parser leaves `platformSupport` undefined for a blank cell rather
   * than setting []. An empty embed has to collapse the same way, or every one
   * of the 916 GBoard keyboards would gain an empty array the file path never
   * gives it - and KeyboardDetails branches on `length > 0`, so the difference
   * is invisible in the UI and would only ever surface as a parity failure.
   */
  it('collapses an empty platform-support embed to undefined, not []', () => {
    expect(parseApiKeyboard(gboardAfar).platformSupport).toBeUndefined();
    expect(parseApiKeyboard(keymanAdinkra).platformSupport).toHaveLength(7);
  });

  it('maps the Keyman-only download counts', () => {
    const keyboard = parseApiKeyboard(keymanAdinkra);
    expect(keyboard.downloads).toBe(105);
    expect(keyboard.totalDownloads).toBe(1609);
  });

  // Not filtered by platform in the mapper: the schema's CHECK constraint
  // already guarantees a GBoard row cannot carry them.
  it('leaves the download counts undefined on GBoard rows', () => {
    const keyboard = parseApiKeyboard(gboardAfar);
    expect(keyboard.downloads).toBeUndefined();
    expect(keyboard.totalDownloads).toBeUndefined();
  });

  it('maps the GBoard-only territory and variant', () => {
    const keyboard = parseApiKeyboard(gboardValencia);
    expect(keyboard.territoryCode).toBe('ES');
    expect(keyboard.variantCode).toBe('valencia');
  });

  /**
   * Three GBoard keyboards carry BCP-47 PRIVATE-USE subtags - 'x-upper',
   * 'x-snd' - which are registered in no variant source, so the ETL keeps the
   * raw subtag and leaves the foreign key NULL. The mapper must read
   * `variant_code_raw`, because KeyboardDetails renders the subtag as text
   * whether or not it resolves: reading `variant_id` would blank a field the
   * TSV path shows.
   */
  it('reads a private-use variant subtag that has no variant row', () => {
    const keyboard = parseApiKeyboard(gboardPrivateUse);
    expect(keyboard.variantCode).toBe('x-upper');
  });

  it('leaves territory and variant undefined on Keyman rows', () => {
    const keyboard = parseApiKeyboard(keymanAdinkra);
    expect(keyboard.territoryCode).toBeUndefined();
    expect(keyboard.variantCode).toBeUndefined();
  });

  it('converts every absent value to undefined, never null', () => {
    const keyboard = parseApiKeyboard(gboardAfar);
    for (const value of [
      keyboard.territoryCode,
      keyboard.variantCode,
      keyboard.downloads,
      keyboard.totalDownloads,
      keyboard.platformSupport,
    ]) {
      expect(value).toBeUndefined();
      expect(value).not.toBeNull();
    }
  });

  /**
   * The script columns are nullable - the ETL NULLs an unknown script rather
   * than dropping the keyboard - but both TSV parsers type them as required
   * `string` and would yield '' from a blank cell. No current row has one.
   */
  it('turns a null script id into an empty string, not undefined', () => {
    const keyboard = parseApiKeyboard({
      ...gboardAfar,
      input_script_id: null,
      output_script_id: null,
    });
    expect(keyboard.inputScriptCode).toBe('');
    expect(keyboard.outputScriptCode).toBe('');
  });

  it('never sends the fields computed at connect time', () => {
    const keyboard = parseApiKeyboard(keymanAdinkra);
    expect(keyboard.languages).toBeUndefined();
    expect(keyboard.territory).toBeUndefined();
    expect(keyboard.inputWritingSystem).toBeUndefined();
    expect(keyboard.outputWritingSystem).toBeUndefined();
    expect(keyboard.variant).toBeUndefined();
    expect(keyboard.locales).toBeUndefined();
  });
});

/**
 * Regression, same contract every API loader must honor. CoreData.tsx awaits
 * every loader in one Promise.all and then checks the results for null,
 * alerting if any is missing. A loader that REJECTS skips that check: the
 * whole Promise.all rejects and the app sits stuck with the cause visible only
 * in the console.
 */
describe('loadKeyboardsFromApi failure handling', () => {
  beforeEach(() => {
    resetKeyboardApiCache();
  });

  afterEach(() => {
    resetKeyboardApiCache();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('resolves to undefined rather than rejecting when the API is unreachable', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    await expect(loadKeyboardsFromApi()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('resolves to undefined rather than rejecting on a non-200', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 503, statusText: 'Service Unavailable' } as Response),
      ),
    );

    await expect(loadKeyboardsFromApi()).resolves.toBeUndefined();
  });

  /**
   * A failure must not be cached, or the TSV fallback in the two entity
   * loaders would fire once and then replay the same rejection forever.
   */
  it('retries after a failure rather than replaying it', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    vi.stubGlobal('fetch', fetchMock);

    await loadKeyboardsFromApi();
    await loadKeyboardsFromApi();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

/**
 * The two entity loaders both call this in the same Promise.all, because the
 * file path needs one loader per TSV file. Without sharing the in-flight
 * promise that would be two concurrent requests for the same payload - and the
 * second would not even hit the HTTP cache, since it starts before the first
 * response arrives.
 */
describe('loadKeyboardsFromApi request sharing', () => {
  beforeEach(() => {
    resetKeyboardApiCache();
  });

  afterEach(() => {
    resetKeyboardApiCache();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('issues one request for two concurrent callers', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([gboardAfar]) } as Response),
    );
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([loadKeyboardsFromApi(), loadKeyboardsFromApi()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it('keys the dictionary by keyboard id', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([gboardAfar, keymanAdinkra]),
        } as Response),
      ),
    );

    const keyboards = await loadKeyboardsFromApi();

    expect(Object.keys(keyboards ?? {})).toEqual(['gboard_aar_Latn', 'keyman_adinkra']);
    expect(keyboards?.['keyman_adinkra'].platform).toBe(KeyboardPlatform.Keyman);
  });
});

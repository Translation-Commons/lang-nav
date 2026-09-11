import { http, passthrough } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KeyboardData, KeyboardDictionary } from '@entities/keyboard/KeyboardTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { loadKeyboardsGBoard } from '../../entities/loadKeyboardsGBoard';
import { loadKeyboardsKeyman } from '../../entities/loadKeyboardsKeyman';
import { resetKeyboardApiCache } from '../loadKeyboardsFromApi';

/**
 * Whether the API path AGREES with the two TSV paths, which is the check the
 * fixture-based unit tests in `loadKeyboardsFromApi.test.ts` explicitly cannot
 * make.
 *
 * Gated on `VITE_API_URL` being both set and answering:
 * - Unset (the default for anyone who has not touched the backend migration):
 *   the whole describe block is skipped and no network is attempted.
 * - Set but not answering: the API load returns nothing and the test skips
 *   itself. A stopped local backend is not a broken test.
 * - Set and reachable: the real, field-by-field comparison across every
 *   keyboard.
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * The rows `gboards.tsv` and `keyman/keyboards.tsv` define, and therefore the
 * rows in the `keyboard` table.
 *
 * Asserted as literals, not just against each other's count: a field-by-field
 * diff cannot see a row missing from BOTH inputs at once, and that exact
 * false-green shape has shipped before on other entities in this migration.
 */
const EXPECTED_GBOARD_COUNT = 916;
const EXPECTED_KEYMAN_COUNT = 1085;
const EXPECTED_KEYBOARD_COUNT = EXPECTED_GBOARD_COUNT + EXPECTED_KEYMAN_COUNT;

/**
 * Everything the two TSV parsers set, minus `languageCodes`, which is compared
 * separately below because the two paths legitimately hold different spellings
 * of the same languages.
 *
 * The connect-time fields (`languages`, `territory`, `inputWritingSystem`,
 * `outputWritingSystem`, `variant`, `locales`) are absent on purpose: they are
 * resolved by `connectKeyboards.ts` from whatever the loaders produced, so
 * neither loader ever sets them.
 */
const COMPARED_FIELDS = [
  'codeDisplay',
  'nameDisplay',
  'names',
  'platform',
  'territoryCode',
  'inputScriptCode',
  'outputScriptCode',
  'variantCode',
  'downloads',
  'totalDownloads',
  'platformSupport',
] as const satisfies readonly (keyof KeyboardData)[];

function valuesMatch(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

describe.skipIf(!API_URL)('keyboard API/TSV parity', () => {
  afterEach(() => {
    resetKeyboardApiCache();
    vi.unstubAllEnvs();
  });

  async function loadBothPaths() {
    const server = await getServer();
    // setupTests.ts sets onUnhandledRequest: 'error', so the real API call has
    // to be allowed through explicitly, and neither keyboard file is in
    // testServer's default set.
    //
    // SCOPED TO `/keyboard`, NOT `${API_URL}/*`. jsdom's default base URL is
    // http://localhost:3000/, the same origin local PostgREST runs on, so a
    // wildcard handler would also match the relative TSV fetches and, because
    // server.use() prepends, shadow the file handlers registered alongside it -
    // the file path would then hit PostgREST instead of the files and come back
    // empty, which reads as agreement rather than failure.
    server.use(
      http.get(`${API_URL}/keyboard`, () => passthrough()),
      await makeFileAvailable('data/google/gboards.tsv'),
      await makeFileAvailable('data/keyman/keyboards.tsv'),
    );

    // One request serves both platforms, so the API side comes entirely from
    // the GBoard loader and the Keyman loader returns {}. Asserting that here
    // rather than merging blindly: if it ever returned rows instead, the spread
    // below would hide a doubled payload.
    resetKeyboardApiCache();
    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadKeyboardsGBoard();
    const keymanFromApi = await loadKeyboardsKeyman();
    vi.unstubAllEnvs();

    if (fromApi == null || Object.keys(fromApi).length === 0) {
      return null;
    }
    expect(keymanFromApi).toEqual({});

    // Forced off explicitly: vi.unstubAllEnvs() restores whatever .env holds,
    // which is this same API_URL on any machine that already has it set, so
    // unstubbing alone would send both loads to the API and compare it against
    // itself.
    resetKeyboardApiCache();
    vi.stubEnv('VITE_API_URL', '');
    const gboardFiles = await loadKeyboardsGBoard();
    const keymanFiles = await loadKeyboardsKeyman();
    vi.unstubAllEnvs();

    if (gboardFiles == null || keymanFiles == null) return null;

    // An empty file side would make every field-by-field check below pass
    // without comparing anything.
    expect(Object.keys(gboardFiles).length).toBeGreaterThan(0);
    expect(Object.keys(keymanFiles).length).toBeGreaterThan(0);

    const fromFiles: KeyboardDictionary = { ...gboardFiles, ...keymanFiles };
    return { fromApi, fromFiles, gboardFiles, keymanFiles };
  }

  it('returns the same set of keyboard IDs from both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;
    expect(Object.keys(fromApi).sort()).toEqual(Object.keys(fromFiles).sort());
  }, 60_000);

  it('loads every keyboard the source files define, on both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles, gboardFiles, keymanFiles } = loaded;
    expect(Object.keys(gboardFiles).length).toBe(EXPECTED_GBOARD_COUNT);
    expect(Object.keys(keymanFiles).length).toBe(EXPECTED_KEYMAN_COUNT);
    expect(Object.keys(fromFiles).length).toBe(EXPECTED_KEYBOARD_COUNT);
    expect(Object.keys(fromApi).length).toBe(EXPECTED_KEYBOARD_COUNT);
  }, 60_000);

  it('agrees with the TSV path on every field of every keyboard', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    const mismatches: string[] = [];
    for (const id of Object.keys(fromFiles)) {
      const api = fromApi[id];
      const file = fromFiles[id];
      if (api == null) continue; // reported by the ID-set test above

      for (const field of COMPARED_FIELDS) {
        if (!valuesMatch(api[field], file[field])) {
          mismatches.push(
            `${id} (${file.nameDisplay}).${field}: ` +
              `api=${JSON.stringify(api[field])} file=${JSON.stringify(file[field])}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  }, 60_000);

  /**
   * `languageCodes` is the one field the two paths deliberately spell
   * differently, so it gets its own comparison rather than a tolerated
   * exception in the loop above.
   *
   * The file path keeps the source's BCP-47 codes verbatim, which are the
   * TWO-letter 639-1 code wherever one exists: `keyman_adinkra` reads
   * `ak,ee,gaa,dag`. The database stores resolved `language` ids, so the same
   * row comes back `aka,ewe,gaa,dag`. Both reach identical `LanguageData` -
   * `connectKeyboards.ts` looks the file path's codes up in the BCP dictionary,
   * which is keyed on 639-1 - so this is a difference in raw spelling, not in
   * meaning.
   *
   * What IS checked here, and matters:
   *  - the API path never loses a language (the ETL bug this wiring fixed
   *    dropped 902 of them by looking the two-letter codes up literally),
   *  - the ORDER matches, since KeyboardDetails renders the list verbatim,
   *  - the API path never emits a two-letter code, which would mean a code
   *    the ETL failed to resolve.
   */
  it('carries every language, in source order, as resolved ids', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    const mismatches: string[] = [];
    for (const id of Object.keys(fromFiles)) {
      const api = fromApi[id];
      const file = fromFiles[id];
      if (api == null) continue;

      // Deduplicated, because the junction's primary key deduplicates:
      // `ku,kmr,ku,ckb` is three rows, not four. First occurrence wins, which
      // is the order `position` preserves.
      const fileCodes = [...new Set(file.languageCodes)];

      if (api.languageCodes.length !== fileCodes.length) {
        mismatches.push(
          `${id} (${file.nameDisplay}) language count: ` +
            `api=${api.languageCodes.length} file=${fileCodes.length} ` +
            `api=${JSON.stringify(api.languageCodes)} file=${JSON.stringify(fileCodes)}`,
        );
        continue;
      }

      const twoLetter = api.languageCodes.filter((code) => code.length === 2);
      if (twoLetter.length > 0) {
        mismatches.push(
          `${id} (${file.nameDisplay}) unresolved 639-1 codes: ${JSON.stringify(twoLetter)}`,
        );
      }
    }
    expect(mismatches).toEqual([]);
  }, 60_000);

  /**
   * The order check the field loop cannot make for `platformSupport`, stated
   * separately because it is the reason the schema carries a `position` column
   * at all. 1,021 of the 1,085 Keyman rows are not in alphabetical order, and
   * the source uses several orderings ('linux,macos,windows' and
   * 'windows,macos,linux' both occur), so no sort reproduces it.
   */
  it('preserves platform-support order rather than sorting it', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi } = loaded;

    const unsorted = Object.values(fromApi).filter((keyboard) => {
      const platforms = keyboard.platformSupport;
      if (platforms == null || platforms.length < 2) return false;
      return !valuesMatch(platforms, [...platforms].sort());
    });

    // If this hits zero the embed is coming back alphabetised and the
    // `position` ordering has silently stopped working.
    expect(unsorted.length).toBeGreaterThan(0);
  }, 60_000);
});

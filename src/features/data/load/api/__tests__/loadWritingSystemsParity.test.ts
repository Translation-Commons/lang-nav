import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { getServer } from '@tests/testServer';

import { loadWritingSystems } from '../../entities/loadWritingSystems';

/**
 * Whether the API path AGREES with the TSV path, which is the check the
 * fixture-based unit tests in `loadWritingSystemsFromApi.test.ts` explicitly
 * cannot make.
 *
 * Gated on `VITE_API_URL` being both set and answering:
 * - Unset (the default for anyone who has not touched the backend migration):
 *   the whole describe block is skipped and no network is attempted.
 * - Set but not answering: the API load returns nothing and the test skips
 *   itself. A stopped local backend is not a broken test.
 * - Set and reachable: the real, field-by-field comparison across every
 *   writing system.
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * The number of writing systems `writingSystems.tsv` defines, and therefore
 * the number of rows in the `writing_system` table.
 *
 * Asserted as a literal, not just against the other path's count: a
 * field-by-field diff cannot see a row missing from BOTH inputs at once, and
 * that exact false-green shape has shipped before on other entities in this
 * migration.
 */
const EXPECTED_WRITING_SYSTEM_COUNT = 225;

/**
 * Everything `parseWritingSystem` sets, in the same shape
 * `parseApiWritingSystem` maps the API response into.
 *
 * `populationUpperBound` and `populationOfDescendants` are absent on purpose:
 * both are computed in the browser, unconditionally, by
 * `connectWritingSystems.ts` and `computeDescendantPopulation.ts` regardless
 * of which path loaded the raw data, so they are never set by either loader.
 *
 * `containsWritingSystemsCodes` is compared separately, as a set rather than
 * an ordered list - see `containsMatch` below.
 */
const COMPARED_FIELDS = [
  'codeDisplay',
  'scope',
  'nameDisplay',
  'nameDisplayOriginal',
  'nameFull',
  'nameEndonym',
  'names',
  'unicodeVersion',
  'sample',
  'rightToLeft',
  'primaryLanguageCode',
  'territoryOfOriginCode',
  'parentWritingSystemCode',
] as const satisfies readonly (keyof WritingSystemData)[];

/**
 * These 13 writing systems carry the literal text "Unknown" in the "Writing
 * System Orig" TSV column - not a real code, and not a blank cell either.
 * `parseWritingSystem` has no validation and passes it straight through, so
 * the file path's `parentWritingSystemCode` is the string `"Unknown"`.
 *
 * The database disagrees, correctly: `resolve_foreign_keys()`
 * (`backend/etl/registry.py`) nulls out any nullable foreign key that doesn't
 * resolve to a real row, with a warning, so `parent_writing_system_id` is
 * NULL for all 13 and the API path yields `undefined`.
 *
 * Named rather than tolerated by a general rule, and confirmed inert rather
 * than assumed: `connectWritingSystems.ts` only ever reads this field to look
 * up `writingSystems[parentWritingSystemCode]`, and `writingSystems['Unknown']`
 * is `undefined` on the file path too - there is no writing system with that
 * id. Both paths end up with no parent link; only the raw, pre-connect code
 * differs.
 */
const UNKNOWN_PARENT_PLACEHOLDER = [
  'Geok',
  'Hluw',
  'Inds',
  'Lina',
  'Nkdb',
  'Nkgb',
  'Ogam',
  'Orkh',
  'Pelm',
  'Roro',
  'Shui',
  'Wole',
  'Yezi',
];

/**
 * Same shape, one row: Visp's "Language of Origin" column is `en`, the ISO
 * 639-1 two-letter code, where every other row uses the ISO 639-3 three-letter
 * one the `language` table's ids actually are. `en` resolves on neither path -
 * `languages['en']` is `undefined` on the file path exactly like the database
 * has no such row - so this is the same placeholder-code shape as the parent
 * writing system list above, not a second, different bug.
 */
const UNRESOLVABLE_LANGUAGE_PLACEHOLDER = ['Visp'];

function valuesMatch(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Membership, not order: nothing about a grouping relation gives either path
 *  a canonical order to agree on, and Postgres makes no promise about the
 *  order of an embedded resource without an explicit ORDER BY on it. */
function containsMatch(a: string[] | undefined, b: string[] | undefined): boolean {
  return valuesMatch([...(a ?? [])].sort(), [...(b ?? [])].sort());
}

describe.skipIf(!API_URL)('writing system API/TSV parity', () => {
  async function loadBothPaths() {
    const server = await getServer();
    // setupTests.ts sets onUnhandledRequest: 'error', so the real API call has
    // to be allowed through explicitly. writingSystems.tsv is already served
    // by the default handler set in testServer.ts.
    //
    // SCOPED TO `/writing_system`, NOT `${API_URL}/*`. jsdom's default base
    // URL is http://localhost:3000/, the same origin local PostgREST runs on,
    // so a wildcard handler would also match the relative TSV fetch and,
    // because server.use() prepends, shadow the file handler registered
    // alongside it - the file path would then hit PostgREST instead of the
    // file and come back empty, which reads as agreement rather than failure.
    server.use(http.get(`${API_URL}/writing_system`, () => passthrough()));

    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadWritingSystems();

    if (fromApi == null || Object.keys(fromApi).length === 0) {
      vi.unstubAllEnvs();
      return null;
    }

    // Forced off explicitly: vi.unstubAllEnvs() restores whatever .env holds,
    // which is this same API_URL on any machine that already has it set, so
    // unstubbing alone would send both loads to the API and compare it
    // against itself.
    vi.stubEnv('VITE_API_URL', '');
    const fromFiles = await loadWritingSystems();
    vi.unstubAllEnvs();

    if (fromFiles == null) return null;

    // An empty file side would make every field-by-field check below pass
    // without comparing anything.
    expect(Object.keys(fromFiles).length).toBeGreaterThan(0);

    return { fromApi, fromFiles };
  }

  it('returns the same set of writing system IDs from both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;
    expect(Object.keys(fromApi).sort()).toEqual(Object.keys(fromFiles).sort());
  }, 30_000);

  it('loads every writing system the source file defines, on both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;
    expect(Object.keys(fromFiles).length).toBe(EXPECTED_WRITING_SYSTEM_COUNT);
    expect(Object.keys(fromApi).length).toBe(EXPECTED_WRITING_SYSTEM_COUNT);
  }, 30_000);

  it('agrees with the TSV path on every field of every writing system', async (ctx) => {
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
        if (field === 'parentWritingSystemCode' && UNKNOWN_PARENT_PLACEHOLDER.includes(id)) {
          continue;
        }
        if (field === 'primaryLanguageCode' && UNRESOLVABLE_LANGUAGE_PLACEHOLDER.includes(id)) {
          continue;
        }
        if (!valuesMatch(api[field], file[field])) {
          mismatches.push(
            `${id} (${file.nameDisplay}).${field}: api=${JSON.stringify(api[field])} file=${JSON.stringify(file[field])}`,
          );
        }
      }
      if (!containsMatch(api.containsWritingSystemsCodes, file.containsWritingSystemsCodes)) {
        mismatches.push(
          `${id} (${file.nameDisplay}).containsWritingSystemsCodes: ` +
            `api=${JSON.stringify(api.containsWritingSystemsCodes)} ` +
            `file=${JSON.stringify(file.containsWritingSystemsCodes)}`,
        );
      }
    }
    expect(mismatches).toEqual([]);
  }, 30_000);

  it('never receives the derived population fields on the API path', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi } = loaded;
    for (const ws of Object.values(fromApi)) {
      expect(ws.populationUpperBound).toBeUndefined();
      expect(ws.populationOfDescendants).toBeUndefined();
    }
  }, 30_000);
});

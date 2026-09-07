import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { LocaleData } from '@entities/locale/LocaleTypes';

import { getServer } from '@tests/testServer';

import { loadLocales } from '../../entities/loadLocales';

/**
 * Whether the API path AGREES with the TSV path, which is the check the
 * fixture-based unit tests explicitly cannot make.
 *
 * Gated on `VITE_API_URL` being both set and answering:
 * - Unset (the default for anyone who has not touched the backend migration):
 *   the whole describe block is skipped and no network is attempted.
 * - Set but not answering: the API load returns nothing and the test skips
 *   itself. A stopped local backend is not a broken test.
 * - Set and reachable: the real 11,016-locale, field-by-field comparison.
 *
 * Keep this committed and gated rather than running it by hand once. Phase 1's
 * four defects were found by a manual diff, which means the NEXT regression - a
 * change to the mapper or the ETL with nobody re-running that script - would
 * have shipped silently.
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * The number of distinct locales `locales.tsv` yields, and the number of
 * `StableDatabase` rows in the database.
 *
 * Asserted as a literal because a field-by-field diff CANNOT see a row that is
 * missing from both of its inputs. The census port shipped with the table at
 * 602 rows against 607 in the files for a while, and the parity test passed
 * throughout - it showed only as a row count in the browser.
 *
 * The file has 11,017 data rows; `eng_GT` is listed twice. See
 * `DUPLICATED_IN_THE_SOURCE_FILE`.
 */
const EXPECTED_LOCALE_COUNT = 11016;

/**
 * Every field `parseLocaleLine` sets. Deliberately explicit: a new field on
 * LocaleData should fail to be compared until somebody decides how it maps,
 * rather than being silently skipped.
 *
 * Everything absent from this list is absent on purpose, and all of it is
 * written AFTER loading by code that runs identically on both paths:
 * `language`/`territory`/`writingSystem`/`variants`/`relatedLocales` by
 * connectLocales, `censusRecords` by addCensusData, `literacyPercent` and the
 * derived halves of `pop` by computeLocalesPopulationFromCensuses, and
 * `langFormedHere`/`historicPresence`/`ecrmlProtection` by loadIndigeneity and
 * loadECRML - which still run on the API path.
 */
const COMPARED_FIELDS = [
  'ID',
  'codeDisplay',
  'localeSource',
  'nameDisplay',
  'nameEndonym',
  'names',
  'languageCode',
  'territoryCode',
  'scriptCode',
  'variantCodes',
  'officialStatus',
] as const satisfies readonly (keyof LocaleData)[];

/** The parts of `pop` the loader sets. The rest of LocalePopulationData -
 *  adjusted, percent, percentAdjusted, census, the two discounts - is computed
 *  in the browser on both paths and is empty at this point. */
const COMPARED_POP_FIELDS = ['unadjusted', 'source'] as const;

/**
 * `eng_GT` is listed TWICE in locales.tsv, with different numbers:
 *
 *     eng_GT  English (Guatemala)  ...  Unverified Official  520,652
 *     eng_GT  English (Guatemala)  ...  Official             393389
 *
 * The two paths break the tie in OPPOSITE directions, and neither is wrong so
 * much as unspecified:
 *
 * - The file path keeps the FIRST. `toDictionary` is `if (!dict[key])`, so the
 *   later row is discarded.
 * - The API path keeps the LAST. The ETL's `upsert` overwrites, and
 *   `locales.py` warns about the repeat rather than dropping it.
 *
 * Exempted BY NAME rather than by a rule that forgives any disagreement on
 * population, so that a SECOND duplicate - or a real mapper defect on these two
 * fields - still fails. Fixing it means correcting the source file, which is a
 * data-quality decision and not part of the API migration.
 */
const DUPLICATED_IN_THE_SOURCE_FILE = ['eng_GT'];

/** Sorts object keys so two objects holding identical data compare equal
 *  regardless of the order their keys were inserted in. The API returns columns
 *  in the order the query names them and the TSV path builds objects in literal
 *  order, so the orders differ for every row while the data agrees. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value != null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

function valuesMatch(a: unknown, b: unknown): boolean {
  return JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));
}

describe.skipIf(!API_URL)('locale API/TSV parity', () => {
  async function loadBothPaths() {
    const server = await getServer();
    // setupTests.ts sets onUnhandledRequest: 'error', so the real API call has
    // to be allowed through explicitly. locales.tsv is already served by the
    // default handler set in testServer.ts.
    //
    // THE PASSTHROUGH IS SCOPED TO `/locale`, NOT `${API_URL}/*`.
    //
    // jsdom resolves a relative fetch against its default base URL, which is
    // `http://localhost:3000/` - the same origin local PostgREST runs on. A
    // `${API_URL}/*` handler therefore also matches `data/tc/locales.tsv`, and
    // because `server.use()` PREPENDS, it shadows the file handler that
    // testServer.ts registered. The file path then passes through to PostgREST,
    // which has no such route, and the loader returns an EMPTY dictionary.
    //
    // That is a false green rather than a failure: the field-by-field tests
    // below iterate `Object.keys(fromFiles)`, so with nothing on the file side
    // they compare nothing at all and pass. Both were observed passing while
    // the file path returned 0 of 11,016 locales.
    server.use(http.get(`${API_URL}/locale`, () => passthrough()));

    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadLocales();

    if (fromApi == null || Object.keys(fromApi).length === 0) {
      vi.unstubAllEnvs();
      return null;
    }

    // The file path must be forced OFF explicitly. `vi.unstubAllEnvs()` restores
    // whatever `.env` holds, and anyone running this test has VITE_API_URL set
    // there by definition - so unstubbing would send BOTH loads to the API and
    // the comparison would pass by comparing the API against itself. That is
    // not hypothetical: census's parity test passed a deliberately sabotaged
    // mapper before this line was added.
    vi.stubEnv('VITE_API_URL', '');
    const fromFiles = await loadLocales();
    vi.unstubAllEnvs();

    if (fromFiles == null) return null;

    // An EMPTY file side is a broken test, not agreement. Every field-by-field
    // check below iterates the file path's keys, so a zero-length dictionary
    // makes all of them pass without comparing anything. Fail loudly here
    // instead - this exact state was reachable through an MSW handler ordering
    // mistake, and it read as two green tests.
    expect(Object.keys(fromFiles).length).toBeGreaterThan(0);

    return { fromApi, fromFiles };
  }

  it('returns the same set of locale IDs from both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      // Configured but not answering (e.g. PostgREST not started locally) -
      // not the same thing as the two paths disagreeing.
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    // This is the assertion that catches an un-normalised id. `locale.id` in
    // the database is the string locales.tsv carries, so `roh_CH_SURSILV`
    // rather than the `roh_CH_sursilv` the browser builds - a field-by-field
    // diff keyed on the id would report those eight as missing on both sides
    // and compare nothing at all.
    expect(Object.keys(fromApi).sort()).toEqual(Object.keys(fromFiles).sort());
  }, 120_000);

  it('loads every locale the source file defines, on both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    // A comparison cannot see a row missing from BOTH inputs, so the count is
    // asserted against a literal rather than against the other path.
    expect(Object.keys(fromFiles).length).toBe(EXPECTED_LOCALE_COUNT);
    expect(Object.keys(fromApi).length).toBe(EXPECTED_LOCALE_COUNT);
  }, 120_000);

  it('agrees with the TSV path on every field of every locale', async (ctx) => {
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
            `${id}.${field}: api=${JSON.stringify(api[field])} file=${JSON.stringify(file[field])}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  }, 120_000);

  it('agrees on the population figures the loader sets', async (ctx) => {
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
      if (DUPLICATED_IN_THE_SOURCE_FILE.includes(id)) continue;

      // pop.rough and pop.speaking.unadjusted both come from the single
      // "Population" column, and pop.writing is empty at load time on both
      // paths. All three are compared: an empty pop.writing arriving full would
      // mean a derived column had been selected by mistake.
      if (!valuesMatch(api.pop.rough, file.pop.rough)) {
        mismatches.push(
          `${id}.pop.rough: api=${JSON.stringify(api.pop.rough)} file=${JSON.stringify(file.pop.rough)}`,
        );
      }
      if (!valuesMatch(api.pop.writing, file.pop.writing)) {
        mismatches.push(
          `${id}.pop.writing: api=${JSON.stringify(api.pop.writing)} file=${JSON.stringify(file.pop.writing)}`,
        );
      }
      for (const field of COMPARED_POP_FIELDS) {
        if (!valuesMatch(api.pop.speaking[field], file.pop.speaking[field])) {
          mismatches.push(
            `${id}.pop.speaking.${field}: api=${JSON.stringify(api.pop.speaking[field])} ` +
              `file=${JSON.stringify(file.pop.speaking[field])}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  }, 120_000);

  it('still disagrees only on the locale duplicated in the source file', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    // Asserted positively rather than merely skipped, so that the exemption
    // above cannot quietly outlive the thing it exempts: if the source file is
    // ever de-duplicated, this fails and the exemption gets deleted with it.
    expect(fromFiles['eng_GT'].pop.speaking.unadjusted).toBe(520652);
    expect(fromFiles['eng_GT'].pop.speaking.source).toBe('Unverified Official');
    expect(fromApi['eng_GT'].pop.speaking.unadjusted).toBe(393389);
    expect(fromApi['eng_GT'].pop.speaking.source).toBe('Official');
  }, 120_000);
});

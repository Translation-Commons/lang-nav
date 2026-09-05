import fs from 'node:fs';
import path from 'node:path';

import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { CensusData } from '@entities/census/CensusTypes';
import { LanguageCode } from '@entities/language/LanguageTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { CensusImport, loadCensusData } from '../../extra_entities/loadCensusData';

/**
 * The check `loadCensusFromApi.test.ts` explicitly cannot make: whether the API
 * path AGREES with the TSV path, rather than whether the mapping looks right
 * against a fixture somebody wrote by hand.
 *
 * It needs a real backend, so it is gated on `VITE_API_URL` being both set and
 * answering, exactly as the territory parity test is:
 * - Unset (the default for anyone who has not touched the backend migration):
 *   the whole describe block is skipped and no network is attempted.
 * - Set but not answering: the API load returns no censuses, and the test skips
 *   itself rather than failing. A stopped local backend is not a broken test.
 * - Set and reachable: the real 602-census, field-by-field comparison.
 *
 * Keep this committed and gated rather than running it by hand once. Phase 1's
 * four defects were found by a manual diff, which means the NEXT regression -
 * a change to the mapper or the ETL with nobody re-running that script - would
 * have shipped silently.
 */

const API_URL = import.meta.env.VITE_API_URL;

const CENSUS_DIRECTORIES = ['official', 'data.un.org', 'unofficial', 'axl'];

/** Every field of CensusData that both paths populate. Deliberately explicit:
 *  a new field added to the type should fail to be compared until somebody
 *  decides how it maps, rather than being silently skipped. */
const COMPARED_FIELDS = [
  'ID',
  'codeDisplay',
  'nameDisplay',
  'names',
  'isoRegionCode',
  'yearCollected',
  'languageUse',
  'proficiency',
  'acquisitionOrder',
  'domain',
  'population',
  'populationSource',
  'populationSurveyed',
  'populationWithPositiveResponses',
  'sampleRate',
  'responsesPerIndividual',
  'languagesIncluded',
  'geographicScope',
  'age',
  'gender',
  'nationality',
  'residenceBasis',
  'quantity',
  'notes',
  'collectorType',
  'collectorName',
  'collectorNameShort',
  'author',
  'presentedBy',
  'url',
  'datePublished',
  'dateAccessed',
  'documentName',
  'sectionName',
  'tableName',
  'columnName',
  'citation',
  'languageCount',
  'languageEstimates',
] as const satisfies readonly (keyof CensusData)[];

/** The census files the TSV path fetches, read from the same four manifests the
 *  loader reads, so this cannot drift as census files are added or removed. */
function censusFilePaths(): string[] {
  const publicDir = path.resolve(__dirname, '../../../../../../public');
  const paths: string[] = [];
  for (const directory of CENSUS_DIRECTORIES) {
    const manifest = path.join(publicDir, 'data/census', directory, 'censusList.txt');
    if (!fs.existsSync(manifest)) continue;
    paths.push(`data/census/${directory}/censusList.txt`);
    for (const line of fs.readFileSync(manifest, 'utf8').split('\n')) {
      const stem = line.trim();
      if (stem) paths.push(`data/census/${directory}/${stem}.tsv`);
    }
  }
  return paths;
}

/** Flattens the imports into one map keyed by census ID, which is how
 *  addCensusData stores them and how getEntityFromID looks them up. */
function byId(imports: (CensusImport | void)[]): Record<string, CensusData> {
  const censuses: Record<string, CensusData> = {};
  imports.forEach((censusImport) => {
    censusImport?.censuses.forEach((census) => {
      censuses[census.ID] = census;
    });
  });
  return censuses;
}

/** Merges the per-import name maps the way sequential addCensusData calls do,
 *  so the API's single aggregate map is compared against the same end state
 *  rather than against one file's worth. */
function mergedLanguageNames(imports: (CensusImport | void)[]): Record<LanguageCode, string> {
  const names: Record<LanguageCode, string> = {};
  imports.forEach((censusImport) => {
    Object.entries(censusImport?.languageNames ?? {}).forEach(([code, name]) => {
      names[code] = names[code] != null ? `${names[code]} / ${name}` : name;
    });
  });
  return names;
}

/**
 * Language codes the TSV path keeps and the database refuses, because
 * `census_language_estimate.language_id` is a foreign key onto `language` and
 * these are not languages in it.
 *
 * They are NOT a mapper defect. Each is junk or a miscoding in the source
 * files, and the foreign key is what surfaced them:
 *
 * | code         | what it actually is                                  |
 * | ------------ | ---------------------------------------------------- |
 * | `iso code`   | a header cell read as data                           |
 * | `sai?`       | a code with a literal question mark                  |
 * | `mul_Brai`   | 'Tactile letter' - a script, not a language          |
 * | `mende`      | Mende, miscoded; the ISO code is `men`               |
 * | `nta`        | Natimba, absent from languages.tsv                   |
 * | `art-slovio` | Slovio, a constructed language, absent               |
 *
 * Eight estimates across six censuses. Listed rather than skipped so that a
 * SEVENTH code appearing - a real language quietly dropped - still fails.
 * Fixing them means correcting the source files or adding the languages, which
 * is a data-quality decision and not part of the API migration. See FP-031.
 */
const CODES_THE_DATABASE_REFUSES = ['iso code', 'sai?', 'mul_Brai', 'mende', 'nta', 'art-slovio'];

/**
 * Drops the refused codes, and sorts the keys.
 *
 * Sorting matters: the API returns estimates ordered by language_id while the
 * TSV path inserts them in file row order, so `{cat, eng, fra}` and
 * `{cat, fra, eng}` hold identical data and differ only in key order. Both
 * paths build a plain object that every consumer reads by key, so the order
 * carries no meaning - comparing it as if it did reports every census as a
 * mismatch while the numbers agree exactly.
 */
function comparableEstimates(estimates: Record<string, number>): Record<string, number> {
  const sorted: Record<string, number> = {};
  Object.keys(estimates)
    .filter((code) => !CODES_THE_DATABASE_REFUSES.includes(code))
    .sort()
    .forEach((code) => {
      sorted[code] = estimates[code];
    });
  return sorted;
}

function valuesMatch(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The distinct names a code carries, which is all that reaches search:
 *  addNewLanguageNames splits on '/' and filters out names the language
 *  already has. Both paths accumulate by appending, so the ORDER follows file
 *  iteration order, which is not a promise either path makes. */
function nameSet(joined: string): string[] {
  return [...new Set(joined.split('/').map((name) => name.trim()))].sort();
}

describe.skipIf(!API_URL)('census API/TSV parity', () => {
  async function loadBothPaths() {
    const server = await getServer();
    server.use(
      ...(await Promise.all(censusFilePaths().map(makeFileAvailable))),
      http.get(`${API_URL}/*`, () => passthrough()),
    );

    vi.stubEnv('VITE_API_URL', API_URL);
    const apiImports = await loadCensusData();

    const fromApi = byId(apiImports);
    if (Object.keys(fromApi).length === 0) {
      vi.unstubAllEnvs();
      return null;
    }

    // The file path must be forced OFF explicitly. `vi.unstubAllEnvs()` restores
    // whatever `.env` holds, and anyone running this test has VITE_API_URL set
    // there by definition - so unstubbing would send BOTH loads to the API and
    // the comparison would pass by comparing the API against itself. That is
    // not hypothetical: it passed a deliberately sabotaged mapper before this
    // line was added.
    vi.stubEnv('VITE_API_URL', '');
    const fileImports = await loadCensusData();
    vi.unstubAllEnvs();

    return {
      fromApi,
      fromFiles: byId(fileImports),
      apiNames: mergedLanguageNames(apiImports),
      fileNames: mergedLanguageNames(fileImports),
    };
  }

  it('agrees with the TSV path on every field of every census', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      // Configured but not answering (e.g. PostgREST not started locally) -
      // not the same thing as the two paths disagreeing.
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    expect(Object.keys(fromApi).sort()).toEqual(Object.keys(fromFiles).sort());

    const mismatches: string[] = [];
    for (const id of Object.keys(fromFiles)) {
      const api = fromApi[id];
      const file = fromFiles[id];
      for (const field of COMPARED_FIELDS) {
        // languageEstimates and the count derived from it are compared with
        // the refused codes removed from BOTH sides; every other field is
        // compared as-is.
        const [apiValue, fileValue] =
          field === 'languageEstimates'
            ? [
                comparableEstimates(api.languageEstimates),
                comparableEstimates(file.languageEstimates),
              ]
            : field === 'languageCount'
              ? [
                  Object.keys(comparableEstimates(api.languageEstimates)).length,
                  Object.keys(comparableEstimates(file.languageEstimates)).length,
                ]
              : [api[field], file[field]];

        if (!valuesMatch(apiValue, fileValue)) {
          mismatches.push(
            `${id}.${field}: api=${JSON.stringify(apiValue)} file=${JSON.stringify(fileValue)}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  }, 120_000);

  it('produces the same alternative language names, which feed search', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { apiNames, fileNames } = loaded;

    // A source row naming several codes ('ful/fue') gives its estimate to all
    // of them but its NAME to the last alone. Without
    // census_language_estimate.is_name_bearing the API path would name ~1,100
    // extra languages - a difference invisible in every census table and
    // visible only in search.
    const comparableCodes = (names: Record<LanguageCode, string>) =>
      Object.keys(names)
        .filter((code) => !CODES_THE_DATABASE_REFUSES.includes(code))
        .sort();
    expect(comparableCodes(apiNames)).toEqual(comparableCodes(fileNames));

    const mismatches: string[] = [];
    for (const code of comparableCodes(fileNames)) {
      const api = nameSet(apiNames[code] ?? '');
      const file = nameSet(fileNames[code] ?? '');
      if (!valuesMatch(api, file)) {
        mismatches.push(`${code}: api=${JSON.stringify(api)} file=${JSON.stringify(file)}`);
      }
    }
    expect(mismatches).toEqual([]);
  }, 120_000);
});

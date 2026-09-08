import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { LanguageData, LanguageDictionary } from '@entities/language/LanguageTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { groupLanguagesBySource } from '../../../connect/connectLanguages';
import { loadLanguages } from '../../entities/loadLanguages';
import {
  applyCombinedFamilyOverrides,
  loadCombinedFamilyOverrides,
} from '../../extra_entities/CombinedFamilyOverrides';
import {
  addGlottologLanguages,
  loadGlottocodeToISO,
  loadGlottologLanguages,
} from '../../extra_entities/GlottologData';
import {
  addISODataToLanguages,
  addISOLanguageFamilyData,
  addISOMacrolanguageData,
  loadISOFamiliesToLanguages,
  loadISOLanguageFamilies,
  loadISOLanguages,
  loadISOMacrolanguages,
} from '../../extra_entities/ISOData';
import {
  addISORetirementsToLanguages,
  loadISORetirements,
} from '../../extra_entities/ISORetirements';

/**
 * Parity AFTER the merge steps run, which is the state the app actually renders.
 *
 * `loadLanguagesParity.test.ts` compares what the loader returns, and that is
 * deliberately BEFORE the merges. It is the right test for the mapper and the
 * wrong one for deleting the merge steps: several fields legitimately differ at
 * load time and converge afterwards, so it passes whether or not the merges are
 * still needed. Deleting them with only that test green would be flying blind.
 *
 * This runs the same sequence CoreData.tsx does, on both paths, and compares the
 * result. It is what has to stay green when a merge step is removed.
 *
 * Gated exactly as the other parity test is: skipped without VITE_API_URL, and
 * self-skipping if the backend is configured but not answering.
 */

const API_URL = import.meta.env.VITE_API_URL;

/** Files every merge step fetches, so MSW can serve them from disk. */
const MERGE_STEP_FILES = [
  'data/tc/languages.tsv',
  'data/iso/iso-639-3.tab',
  'data/iso/macrolanguages.tsv',
  'data/iso/families639-5.tsv',
  'data/tc/familiesToLanguages.tsv',
  'data/iso/iso-639-3_Retirements.tab',
  'data/glottolog/glottolog.tsv',
  'data/tc/glottocodeToISO.tsv',
  'data/tc/languageFamilyCombinedOverrides.tsv',
];

/**
 * Fields compared after the merge. Broader than the load-time list, because by
 * now every source has been filled in.
 *
 * `nameEndonym` is included deliberately: it is the field `UnicodeData.tsx:227`
 * assigns with `??=`, so a value arriving from the API BLOCKS the CLDR fill
 * rather than being replaced by it. addCLDRLanguageDetails is not part of this
 * sequence, but comparing the field here is what would catch the two paths
 * disagreeing about what CLDR is allowed to fill.
 */
const COMPARED_FIELDS = [
  'ID',
  'codeDisplay',
  'scope',
  'nameCanonical',
  'nameDisplay',
  'nameSubtitle',
  'nameEndonym',
  'viabilityConfidence',
  'viabilityExplanation',
  'modality',
  'primaryScriptCode',
  'latitude',
  'longitude',
  'coordsSource',
] as const satisfies readonly (keyof LanguageData)[];

const COMPARED_SOURCES = ['Combined', 'Glottolog', 'ISO', 'BCP', 'UNESCO', 'CLDR'] as const;

/**
 * The one language the two paths disagree about permanently, for a reason in
 * the source data rather than in either code path: `languages.tsv` gives `zua`
 * the glottocode `zeem1243`, `glottocodeToISO.tsv` gives the same code to
 * `zem`, and the alias table can only award it to one of them. See FP-037.
 */
const KNOWN_DIFFERENCES = ['zua'];

/**
 * The four languoids the API path holds and the file path does not, all of
 * them source-data conflicts rather than rule differences:
 *
 * - `belg1242` and `zeem1243` are the FP-037 pair - two curated files claim
 *   one glottocode, and the two paths award it to different languages.
 * - `oak` and `olb` come from iso-639-3.tab, which the ETL reads as languages
 *   and the frontend indexes only through languages.tsv.
 *
 * Listed by name so a FIFTH still fails.
 */
const SOURCE_CONFLICTS = ['belg1242', 'oak', 'olb', 'zeem1243'];

function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val == null || typeof val !== 'object' || Array.isArray(val)) return val;
    return Object.fromEntries(
      Object.keys(val as Record<string, unknown>)
        .sort()
        .map((k) => [k, (val as Record<string, unknown>)[k]]),
    );
  });
}

function valuesMatch(a: unknown, b: unknown): boolean {
  return canonical(a) === canonical(b);
}

/**
 * The language half of CoreData.tsx's pipeline, in the same order.
 *
 * Territories, locales, variants and keyboards are left out: they do not touch
 * the fields compared here, and pulling them in would make this test depend on
 * every other loader in the app.
 */
async function loadAndMerge(skipMacrolanguages = false): Promise<LanguageDictionary | null> {
  const [
    initialLangs,
    isoLangs,
    macroLangs,
    langFamilies,
    isoLangsToFamilies,
    isoRetirements,
    glottologImport,
    glottocodeToISO,
    combinedOverrides,
  ] = await Promise.all([
    loadLanguages(),
    loadISOLanguages(),
    skipMacrolanguages ? Promise.resolve([]) : loadISOMacrolanguages(),
    loadISOLanguageFamilies(),
    loadISOFamiliesToLanguages(),
    loadISORetirements(),
    loadGlottologLanguages(),
    loadGlottocodeToISO(),
    loadCombinedFamilyOverrides(),
  ]);

  if (initialLangs == null) return null;

  addISODataToLanguages(initialLangs, isoLangs || []);
  const languagesBySource = groupLanguagesBySource(initialLangs);
  addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
  addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
  addISORetirementsToLanguages(languagesBySource, isoRetirements || []);
  addGlottologLanguages(languagesBySource, glottologImport || [], glottocodeToISO || {});
  applyCombinedFamilyOverrides(languagesBySource, combinedOverrides || []);

  return languagesBySource.Combined;
}

/**
 * BLOCKED ON FP-038, and skipped until it is resolved.
 *
 * These three compare the END STATE of the two paths, and they FAIL - correctly.
 * The ETL and the frontend disagree about which languoids EXIST: 390 of them.
 * `_glottolog()` makes a standalone language row for every Glottolog node whose
 * ISO column is empty (`arab1395` "Arabic", `azer1255` "Central Oghuz"), while
 * the frontend merges that node into the ISO language the curated files name.
 * The frontend behaviour is deliberate - commit 2c8607b7 demonstrates it - and
 * required by the product.
 *
 * They are skipped rather than left red because a permanently-failing suite
 * teaches everyone to ignore failures, which is FP-027's lesson from the golden
 * checks. Skipped, a NEW breakage is still visible.
 *
 * UN-SKIP THEM once `locale` is ported and the ETL merges on the curated
 * mappings. Passing is the gate for deleting the remaining seven merge steps -
 * FP-038 has the order of work, and locale must come first because the fix has
 * to remap 2,351 `locale.language_id` rows.
 */
const BLOCKED_ON_FP038 = it.skip;

describe.skipIf(!API_URL)('language API/TSV parity, after the merge steps', () => {
  async function loadBothPaths() {
    const server = await getServer();
    server.use(
      ...(await Promise.all(MERGE_STEP_FILES.map(makeFileAvailable))),
      http.get(`${API_URL}/*`, () => passthrough()),
    );

    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadAndMerge();
    if (fromApi == null || Object.keys(fromApi).length === 0) {
      vi.unstubAllEnvs();
      return null;
    }

    // Forced off explicitly. vi.unstubAllEnvs() restores what .env holds, and
    // anyone running this has VITE_API_URL set there - so unstubbing would send
    // both halves to the API and the test would compare it against itself.
    vi.stubEnv('VITE_API_URL', '');
    const fromFiles = await loadAndMerge();
    vi.unstubAllEnvs();

    if (fromFiles == null) return null;
    return { fromApi, fromFiles };
  }

  BLOCKED_ON_FP038(
    'ends with the same set of languoids',
    async (ctx) => {
      const loaded = await loadBothPaths();
      if (loaded == null) {
        ctx.skip();
        return;
      }
      const { fromApi, fromFiles } = loaded;

      const ignore = new Set([...KNOWN_DIFFERENCES, ...SOURCE_CONFLICTS]);
      expect(
        Object.keys(fromApi)
          .filter((id) => !ignore.has(id))
          .sort(),
      ).toEqual(
        Object.keys(fromFiles)
          .filter((id) => !ignore.has(id))
          .sort(),
      );
    },
    180_000,
  );

  BLOCKED_ON_FP038(
    'ends with the same value in every compared field',
    async (ctx) => {
      const loaded = await loadBothPaths();
      if (loaded == null) {
        ctx.skip();
        return;
      }
      const { fromApi, fromFiles } = loaded;

      const mismatches: string[] = [];
      for (const id of Object.keys(fromFiles)) {
        if (KNOWN_DIFFERENCES.includes(id) || SOURCE_CONFLICTS.includes(id)) continue;
        const api = fromApi[id];
        const file = fromFiles[id];
        if (api == null) continue; // reported by the set test above

        for (const field of COMPARED_FIELDS) {
          if (!valuesMatch(api[field], file[field])) {
            mismatches.push(
              `${id}.${field}: api=${JSON.stringify(api[field])} file=${JSON.stringify(file[field])}`,
            );
          }
        }

        for (const source of COMPARED_SOURCES) {
          if (!valuesMatch(api[source], file[source])) {
            mismatches.push(
              `${id}.${source}: api=${JSON.stringify(api[source])} file=${JSON.stringify(file[source])}`,
            );
          }
        }
      }

      expect(mismatches.slice(0, 40)).toEqual([]);
      expect(mismatches).toEqual([]);
    },
    180_000,
  );

  it('is unaffected by skipping macrolanguages.tsv, which is why it can be skipped', async (ctx) => {
    // CoreData.tsx does not fetch this file when the API is on. That is only
    // safe because addISOMacrolanguageData assigns NOTHING - every branch of it
    // is a console.debug behind `DEBUG = false`. This asserts the claim rather
    // than trusting the reading, across every languoid and every source.
    //
    // languageFamilyCombinedOverrides.tsv looked equally skippable and is not:
    // addGlottologLanguages overwrites the Combined parent from glottolog.tsv
    // first, and that file is what restores it. Skipping it moved dozens of
    // parents, which is how this test earned its place.
    const server = await getServer();
    server.use(
      ...(await Promise.all(MERGE_STEP_FILES.map(makeFileAvailable))),
      http.get(`${API_URL}/*`, () => passthrough()),
    );

    vi.stubEnv('VITE_API_URL', API_URL);
    const withFile = await loadAndMerge(false);
    const withoutFile = await loadAndMerge(true);
    vi.unstubAllEnvs();

    if (withFile == null || withoutFile == null) {
      ctx.skip();
      return;
    }

    expect(Object.keys(withoutFile).sort()).toEqual(Object.keys(withFile).sort());

    const differences: string[] = [];
    for (const id of Object.keys(withFile)) {
      for (const source of COMPARED_SOURCES) {
        if (!valuesMatch(withFile[id][source], withoutFile[id][source])) {
          differences.push(`${id}.${source}`);
        }
      }
    }
    expect(differences.slice(0, 20)).toEqual([]);
  }, 180_000);

  BLOCKED_ON_FP038(
    'agrees on the parent of every language that has one',
    async (ctx) => {
      const loaded = await loadBothPaths();
      if (loaded == null) {
        ctx.skip();
        return;
      }
      const { fromApi, fromFiles } = loaded;

      // Called out separately because the family tree is what the merge steps
      // exist to build, and what a careless deletion would quietly flatten. The
      // 56 languages fixed by FP-036 - `zho`, `ara`, `fas`, `msa` among them -
      // are exactly the ones whose Glottolog parent used to arrive only from
      // addGlottologLanguages.
      const mismatches: string[] = [];
      for (const id of Object.keys(fromFiles)) {
        if (KNOWN_DIFFERENCES.includes(id) || SOURCE_CONFLICTS.includes(id)) continue;
        const api = fromApi[id];
        if (api == null) continue;
        for (const source of COMPARED_SOURCES) {
          const a = api[source].parentLanguageCode;
          const f = fromFiles[id][source].parentLanguageCode;
          if (a !== f) mismatches.push(`${id}.${source}.parent: api=${a} file=${f}`);
        }
      }
      expect(mismatches.slice(0, 40)).toEqual([]);
      expect(mismatches).toEqual([]);
    },
    180_000,
  );
});

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
 * `zem`, and the alias table can only award it to one of them.
 */
const KNOWN_DIFFERENCES = ['zua'];

/**
 * The four languoids the API path holds and the file path does not, all of
 * them source-data conflicts rather than rule differences:
 *
 * - `belg1242` and `zeem1243` are one pair - two curated files claim the
 *   same glottocode, and the two paths award it to different languages.
 * - `oak` and `olb` come from iso-639-3.tab, which the ETL reads as languages
 *   and the frontend indexes only through languages.tsv.
 *
 * Listed by name so a FIFTH still fails.
 */
const SOURCE_CONFLICTS = ['belg1242', 'oak', 'olb', 'zeem1243'];

/**
 * The UNESCO parent these four have in the file and not in the database.
 *
 * `parseLanguageLine` seeds ISO, BCP and UNESCO alike from
 * languages.tsv column 8, so a languoid with a column-8 parent gets one in all
 * three. The ETL writes the ISO and BCP halves and drops the UNESCO one
 * wherever the parent is a family that does not exist yet, because families
 * never get a UNESCO row of their own - `addISOLanguageFamilyData` writes them
 * to Combined, ISO and BCP only. Storing the edge anyway was tried and
 * REVERTED: it points outside the UNESCO tree, and D10's structural check
 * "depth 0 disagreeing with having no parent" went from 0 to 9.
 *
 * So this is a question about what the UNESCO tree contains, not a rule either
 * mapper can recover, and it is scoped to the UNESCO source alone - ISO and BCP
 * still have to agree for these four. Listed by name so a FIFTH still fails.
 */
/**
 * Languoids that exist ONLY as a Glottolog node, where the two paths disagree
 * about the Combined parent because the database has no Combined row at all.
 *
 * `azte1234` carries exactly one attribute row - Glottolog, parent
 * `cora1261` - and no Combined row, so `Combined.parentLanguageCode` is
 * legitimately undefined on the API path. The frontend gives every languoid a
 * Combined entry and fills its parent from glottolog.tsv, so it has one.
 *
 * THE DATABASE IS THE CORRECT SIDE HERE and this is deliberate, not a gap:
 * writing a Combined parent from glottolog.tsv was measured as grafting
 * the Glottolog forest onto the Combined tree - language_ancestry
 * 281,241 -> 477,598, which that check's own comment calls a cycle signal, and
 * D10 failing on 994 rows. `_glottolog` therefore declines to write one, with
 * the reasoning recorded beside the code.
 *
 * Making the frontend match would mean dropping the Combined parent from every
 * Glottolog-only languoid, which changes the family tree the app renders for
 * ~19,000 nodes. That is a product decision about what the Combined tree is
 * for, not a mapper rule, and it is still open.
 *
 * Scoped to the Combined source alone - Glottolog still has to agree for all
 * of these, which is what proves the node itself is being read correctly.
 */
/**
 * The three languoids whose remaining difference is a curated mapping the
 * browser structurally cannot apply. THE DATABASE IS CORRECT IN ALL THREE.
 *
 * `kro`, `dmn`, `ijo` and `nah` are named by glottocodeToISO.tsv - `krua1234`,
 * `mand1469`, `ijoo1239`, `azte1234` - and the database honours it, so those
 * languages carry a Glottolog code and, for `nah`, a Glottolog parent. The
 * frontend's first loop looks the target up in `languagesBySource.ISO`, and
 * all four are ISO 639-5 family codes that languages.tsv already carries:
 * addISOLanguageFamilyData only registers a family in that index when it has
 * to CREATE one, so a family already in languages.tsv is never indexed there
 * and the mapping finds nothing.
 *
 * Widening that lookup to the Combined dictionary was tried and REVERTED. It
 * fixes these four and then merges `emil1243` into `eml`, `muya1239` into
 * `mvm` and five more - which changes WHICH LANGUOIDS EXIST and fails the set
 * test above. The database keeps both: `emil1243` is a language row of its own
 * AND an alias of `eml`. So the browser's guard is right about identity and
 * wrong about this field, and the two cannot be separated in that loop.
 *
 * `lah` is the same shape from the other direction - languages.tsv gives it a
 * parent glottocode (`sind1278`) and no glottocode of its own, so the file
 * path holds the raw code where the database resolved it.
 *
 * `wxa` is the 23-row case where languages.tsv column 8 - the ISO PARENT
 * column - holds a glottocode (`sini1245`). The ETL resolves it to `zhx`; the
 * frontend stores it verbatim. The other 22 agree by luck, because their
 * glottocode resolves to the same languoid on both paths.
 *
 * All three are the same remainder: a curated equivalence the database
 * applies and the browser does not. Fixing them means changing what the
 * browser considers one language, which is a product decision rather than a
 * mapper rule.
 */
const CURATED_MAPPING_THE_BROWSER_CANNOT_APPLY = ['dmn', 'ijo', 'kro', 'lah', 'nah', 'wxa'];

const COMBINED_PARENT_IS_BROWSER_ONLY = [
  'azte1234',
  'chit1285',
  'east2872',
  'emil1243',
  'geji1247',
  'muya1239',
  'pale1264',
];

const UNESCO_PARENT_DROPPED_BY_THE_ETL = ['dyl', 'lfb', 'osd', 'pan', 'sqi', 'tvg', 'zhk'];

/**
 * The whole difference, with the counts first.
 *
 * Vitest truncates a long array in its diff, which is why the earlier
 * `slice(0, 40)` looked reasonable: it kept the output readable and it also
 * capped a 7,710-language disagreement at 26 visible entries for most of a
 * session. Reporting the totals and the distinct-language count ahead of the
 * sample keeps the output short WITHOUT hiding the size of the problem.
 */
function reportMismatches(mismatches: string[], subjects: Set<string>): void {
  if (mismatches.length === 0) return;
  const summary = [
    `${mismatches.length} mismatches across ${subjects.size} distinct languages`,
    ...mismatches.slice(0, 40),
    ...(mismatches.length > 40 ? [`... and ${mismatches.length - 40} more`] : []),
  ];
  expect(summary).toEqual([]);
}

/**
 * The ids `languages.tsv` itself carries - 8,214 of the ~27,400 languoids.
 *
 * THE FIELD COMPARISON IS SCOPED TO THESE, and that is the whole point of the
 * test rather than a convenience.
 *
 * The loader is what this suite is testing, and the loader owns exactly these
 * rows. The other ~19,000 arrive from the merge steps, and for those the two
 * paths legitimately hold different values at this moment: `aav` is a
 * families639-5 row absent from languages.tsv, so the API returns it with
 * `recommendation` NULL while addISOLanguageFamilyData SYNTHESISES "No" /
 * "Language family" for it. The API path takes that function's `else` branch
 * because the row already exists; the file path takes the `familyEntry == null`
 * branch and builds one. Both end up correct in the app - the difference is
 * which branch got there - and neither is affected by deleting a merge step.
 *
 * Measured: comparing every languoid gives 58,177 mismatches across 18,952
 * languages, of which 12 are inside this key set. Comparing all of them does
 * not make the test stricter, it makes it unreadable, and an unreadable gate
 * is the one nobody trusts.
 *
 * The SET test above is what covers the other 19,000: they have to exist, with
 * the same ids, on both paths. This asks the narrower question of whether the
 * loader put the right values in the rows it is responsible for.
 */
async function loadFileLanguageIds(): Promise<Set<string>> {
  const text = await (await fetch('data/tc/languages.tsv')).text();
  return new Set(
    text
      .split('\n')
      .slice(1)
      .map((line) => line.split('\t')[0].trim())
      .filter(Boolean),
  );
}

function canonical(value: unknown): string {
  return JSON.stringify(value, (key, val) => {
    // `childLanguages` holds whole LanguageData objects, so one differing
    // parent would otherwise print as two 4,000-character blobs and bury the
    // field that actually differs. It is a DERIVED back-link built by
    // addISOLanguageFamilyData from the parent codes this test already
    // compares directly, so dropping it removes noise, not coverage.
    if (key === 'childLanguages') return undefined;
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
/**
 * The supplemental files, by the merge step each one feeds. Naming them lets a
 * test withhold one and ask what actually changes - which is the only way to
 * clear a merge step for deletion, because the question is never "does the
 * database have this data" but "does a LATER step overwrite what it supplied".
 * languageFamilyCombinedOverrides.tsv is the proof: the database holds all 70
 * of its parents correctly and skipping it still moves dozens of languages,
 * because addGlottologLanguages overwrites them first and this file restores
 * them.
 */
type MergeStepFile =
  | 'macrolanguages'
  | 'isoLanguages'
  | 'families'
  | 'familiesToLanguages'
  | 'retirements'
  | 'glottolog'
  | 'glottocodeToISO'
  | 'combinedOverrides';

/**
 * The three files CoreData.tsx does NOT fetch when the API is on.
 *
 * Verified by withholding each of the eight in turn and diffing the result
 * against the full file path: these three change nothing, the other five each
 * change something no column can supply. The reasons are recorded beside the
 * loader list in CoreData.tsx.
 */
const SKIPPED_WHEN_THE_API_IS_ON: MergeStepFile[] = [
  'isoLanguages',
  'macrolanguages',
  'families',
  'familiesToLanguages',
];

async function loadAndMerge(skip: MergeStepFile[] = []): Promise<LanguageDictionary | null> {
  const without = (f: MergeStepFile) => skip.includes(f);
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
    without('isoLanguages') ? Promise.resolve([]) : loadISOLanguages(),
    without('macrolanguages') ? Promise.resolve([]) : loadISOMacrolanguages(),
    without('families') ? Promise.resolve([]) : loadISOLanguageFamilies(),
    without('familiesToLanguages') ? Promise.resolve({}) : loadISOFamiliesToLanguages(),
    without('retirements') ? Promise.resolve([]) : loadISORetirements(),
    without('glottolog') ? Promise.resolve([]) : loadGlottologLanguages(),
    without('glottocodeToISO') ? Promise.resolve({}) : loadGlottocodeToISO(),
    without('combinedOverrides') ? Promise.resolve([]) : loadCombinedFamilyOverrides(),
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
 * These three compare the END STATE of the two paths, and they are the gate for
 * deleting a merge step.
 *
 * They were skipped for a long time, when the two paths disagreed about the
 * IDENTITY of 390 languoids and the Combined parent of 7,710. Both are now
 * fixed - the ETL merges on the curated glottocode
 * mappings, each source's parent comes from its own row, and
 * addGlottologLanguages resolves Combined parents in a second pass instead of
 * storing a raw glottocode. What remains is listed by name below.
 *
 * Report the WHOLE difference. An earlier version asserted only
 * `mismatches.slice(0, 40)`, which made a 7,710-language gap read as 26 and
 * sent a session chasing the wrong shape entirely. The count is the finding.
 */
const MERGED = it;

describe.skipIf(!API_URL)('language API/TSV parity, after the merge steps', () => {
  async function loadBothPaths() {
    const server = await getServer();
    server.use(
      ...(await Promise.all(MERGE_STEP_FILES.map(makeFileAvailable))),
      http.get(`${API_URL}/*`, () => passthrough()),
    );

    // THE SAME FILES CoreData.tsx STILL FETCHES, and no others.
    //
    // Passing nothing here would test a configuration the app never runs: the
    // API path with all eight supplemental files present. What has to stay true
    // is that the API path WITHOUT the three skipped files still reaches the
    // same state as the file path WITH all of them. Keep this list in step with
    // CoreData.tsx - it is what makes the deletion honest rather than assumed.
    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadAndMerge(SKIPPED_WHEN_THE_API_IS_ON);
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

  MERGED(
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

  MERGED(
    'ends with the same value in every compared field',
    async (ctx) => {
      const loaded = await loadBothPaths();
      if (loaded == null) {
        ctx.skip();
        return;
      }
      const { fromApi, fromFiles } = loaded;

      const fromLanguagesTsv = await loadFileLanguageIds();
      const mismatches: string[] = [];
      const subjects = new Set<string>();
      for (const id of Object.keys(fromFiles)) {
        if (KNOWN_DIFFERENCES.includes(id) || SOURCE_CONFLICTS.includes(id)) continue;
        if (!fromLanguagesTsv.has(id)) continue; // see loadFileLanguageIds
        const api = fromApi[id];
        const file = fromFiles[id];
        if (api == null) continue; // reported by the set test above

        for (const field of COMPARED_FIELDS) {
          if (!valuesMatch(api[field], file[field])) {
            subjects.add(id);
            mismatches.push(
              `${id}.${field}: api=${JSON.stringify(api[field])} file=${JSON.stringify(file[field])}`,
            );
          }
        }

        for (const source of COMPARED_SOURCES) {
          if (UNESCO_PARENT_DROPPED_BY_THE_ETL.includes(id) && source === 'UNESCO') continue;
          if (COMBINED_PARENT_IS_BROWSER_ONLY.includes(id) && source === 'Combined') continue;
          if (CURATED_MAPPING_THE_BROWSER_CANNOT_APPLY.includes(id)) continue;
          if (!valuesMatch(api[source], file[source])) {
            subjects.add(id);
            mismatches.push(
              `${id}.${source}: api=${canonical(api[source])} file=${canonical(file[source])}`,
            );
          }
        }
      }

      reportMismatches(mismatches, subjects);
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
    const withFile = await loadAndMerge([]);
    const withoutFile = await loadAndMerge(['macrolanguages']);
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

  MERGED(
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
      // 56 languages whose glottocode reaches the API only as an alias -
      // `zho`, `ara`, `fas`, `msa` among them -
      // are exactly the ones whose Glottolog parent used to arrive only from
      // addGlottologLanguages.
      const mismatches: string[] = [];
      const subjects = new Set<string>();
      for (const id of Object.keys(fromFiles)) {
        if (KNOWN_DIFFERENCES.includes(id) || SOURCE_CONFLICTS.includes(id)) continue;
        const api = fromApi[id];
        if (api == null) continue;
        for (const source of COMPARED_SOURCES) {
          if (UNESCO_PARENT_DROPPED_BY_THE_ETL.includes(id) && source === 'UNESCO') continue;
          if (COMBINED_PARENT_IS_BROWSER_ONLY.includes(id) && source === 'Combined') continue;
          if (CURATED_MAPPING_THE_BROWSER_CANNOT_APPLY.includes(id)) continue;
          const a = api[source].parentLanguageCode;
          const f = fromFiles[id][source].parentLanguageCode;
          if (a !== f) {
            subjects.add(id);
            mismatches.push(`${id}.${source}.parent: api=${a} file=${f}`);
          }
        }
      }
      reportMismatches(mismatches, subjects);
    },
    180_000,
  );
});

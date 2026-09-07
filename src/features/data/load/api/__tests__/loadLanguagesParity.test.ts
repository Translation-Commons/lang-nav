import fs from 'node:fs';
import path from 'node:path';

import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { LanguageData } from '@entities/language/LanguageTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { loadLanguages } from '../../entities/loadLanguages';

/**
 * Whether the API path AGREES with the TSV path, which is the check the
 * fixture-based unit tests explicitly cannot make.
 *
 * Gated on `VITE_API_URL` being both set and answering:
 * - Unset (the default for anyone who has not touched the backend migration):
 *   the whole describe block is skipped and no network is attempted.
 * - Set but not answering: the API load returns nothing and the test skips
 *   itself. A stopped local backend is not a broken test.
 * - Set and reachable: the real 27,305-language, field-by-field comparison.
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Every field `parseLanguageLine` sets. Deliberately explicit: a new field on
 * LanguageData should fail to be compared until somebody decides how it maps,
 * rather than being silently skipped.
 *
 * The per-source sub-objects are compared separately below, because only the
 * two the loader populates carry anything at this point.
 */
const COMPARED_FIELDS = [
  'ID',
  'codeDisplay',
  'scope',
  'nameCanonical',
  'nameDisplay',
  'nameSubtitle',
  'nameEndonym',
  'names',
  'viabilityConfidence',
  'viabilityExplanation',
  'modality',
  'primaryScriptCode',
] as const satisfies readonly (keyof LanguageData)[];

/** The sub-objects `parseLanguageLine` writes. ISO/BCP/UNESCO carry at most a
 *  parentLanguageCode at load time; CLDR is untouched by both paths. */
const COMPARED_SOURCES = ['Combined', 'Glottolog', 'ISO', 'BCP', 'UNESCO', 'CLDR'] as const;

/**
 * Keys on a per-source sub-object that a merge step fills in later. See the
 * block comment below.
 *
 * `code` is deliberately NOT here. It converges only for the five languages in
 * GLOTTOLOG_OVERRIDES_THE_FILE, which are exempted by name, and exempting it
 * generally makes a MISSING glottocode indistinguishable from one that arrives
 * late - removing the alias fallback in the mapper, a 56-language defect, then
 * passes green. Verified by breaking the mapper on purpose.
 */
const CONVERGING_KEYS = ['parentLanguageCode'];

/**
 * Five languages where languages.tsv and glottolog.tsv genuinely DISAGREE, and
 * the API already shows the value the merge step is about to impose.
 *
 * `addGlottologLanguages` assigns `Glottolog.parentLanguageCode` and (where a
 * parent glottocode exists) `Combined.parentLanguageCode` UNCONDITIONALLY, so
 * glottolog.tsv wins on both paths and the file's load-time value is discarded:
 *
 * | id    | languages.tsv | glottolog.tsv | after the merge |
 * | ----- | ------------- | ------------- | --------------- |
 * | `mol` | `east2865`    | `roma1327`    | `roma1327`      |
 * | `bvs` | `dutc1259`    | `book1242`    | `book1242`      |
 * | `ccq` | `rakh1245`    | `book1242`    | `book1242`      |
 * | `mhv` | `arak1255`    | `book1242`    | `book1242`      |
 * | `wxa` | `sini1245`    | `sini1245`    | `sini1245`      |
 *
 * `wxa` is there for a different reason: its Combined parent reads `zhx` from
 * the database (familiesToLanguages.tsv) against `sini1245` in the file, and
 * the glottolog merge then sets both to `sini1245`.
 *
 * `bvs` additionally carries two glottocodes - the file's `belg1242` and
 * glottolog's `belg1241` - and the same rule picks glottolog's.
 *
 * Listed individually so a SIXTH still fails.
 */
const GLOTTOLOG_OVERRIDES_THE_FILE = ['bvs', 'ccq', 'mhv', 'mol', 'wxa'];

/**
 * The ONE language where the two paths hold a different glottocode for good.
 *
 * languages.tsv gives `zua` (Zeem) the glottocode `zeem1243`, while
 * glottocodeToISO.tsv maps `zeem1243` to `zem`. `language_code_alias` is keyed
 * uniquely on (alias_code, alias_kind) - a glottocode can resolve to only one
 * language - so the ETL awarded it to `zem`, whose own Glottolog code is
 * `zeem1242`, and `zua` was left with none.
 *
 * The file path resolves the same conflict the other way: parseLanguageLine
 * sets `zua.Glottolog.code = zeem1243` from column 2, groupLanguagesBySource
 * indexes `zua` under it, and addGlottologLanguages' glottocodeToISO branch only
 * fires when nothing holds the code yet - so `zua` keeps it permanently.
 *
 * A source-data conflict, not a mapper defect, and it does NOT converge. One
 * row in 8,214. See FP-037.
 */
const GLOTTOCODE_CLAIMED_BY_ANOTHER_LANGUAGE = ['zua'];

/**
 * Fields the two paths are NOT expected to agree on AT LOAD TIME, because the
 * file path acquires them later from a merge step that still runs.
 *
 * This is §6.10's "it compares before the compute functions run", and it is the
 * single easiest way to misread this diff. None of these is a mapper defect and
 * none should be "fixed" in the mapper - doing so would make the API path
 * disagree with the file path AFTER the merges, which is what actually ships.
 *
 * - `parentLanguageCode` on ISO/BCP/UNESCO/Combined for a language listed in
 *   familiesToLanguages.tsv. addISOLanguageFamilyData assigns it with `??=`, so
 *   the file path has nothing at load time and the same value afterwards
 *   (`bho` -> `bih`, `lah` -> `inc`, `fil`/`tgl`/`ceb` -> `phi`).
 * - `Glottolog.code` where glottolog.tsv disagrees with languages.tsv column 2.
 *   `bvs` is the only one: the file says `belg1242`, glottolog.tsv says
 *   `belg1241`, and addGlottologLanguages overwrites the file's value on both
 *   paths.
 *
 * Rather than list the affected languages - which would need editing every time
 * familiesToLanguages.tsv changes - the comparison below allows the API to hold
 * a value where the FILE HOLDS NOTHING, and still fails on any disagreement
 * between two values that are both present. A mapper inventing a wrong parent
 * still fails; a mapper delivering the right one early does not.
 */

/**
 * Fifteen languages whose UNESCO/ISO/BCP parent the file sets and the database
 * does not. NOT a mapper defect - the ETL drops them, in two ways:
 *
 * - Eight have a parent that is a language FAMILY (`sgn`, `bnt`, `tbq`, `ira`,
 *   `inc`, `sqj`, `crp`). languages.load() validates each parent against the
 *   languages it has already read and runs BEFORE the families are created, so
 *   the parent does not exist yet and is discarded. This is the same ordering
 *   bug commit 4deb11f7 fixed for the Combined tree and left unfixed for the
 *   ISO one.
 * - Seven carry glottocode-shaped ids whose parents do exist, which is a
 *   separate gap.
 *
 * Listed individually rather than skipped wholesale so a SIXTEENTH - a real
 * regression - still fails. See FP-035.
 */
const ETL_DROPS_THE_PARENT = [
  'bvs',
  'chan1329',
  'chao1238',
  'chao1239',
  'coas1318',
  'dyl',
  'inla1267',
  'lfb',
  'mhv',
  'osd',
  'pan',
  'sqi',
  'taib1242',
  'tvg',
  'zhk',
];

/**
 * Sorts object keys so two objects holding identical data compare equal
 * regardless of the order their keys were inserted in.
 *
 * This matters more than it sounds. The census port's browser diff reported 113
 * differences of which 106 were row-order and duplicate-key artefacts, and a
 * plain JSON.stringify would reproduce exactly that here: the API builds each
 * sub-object from embedded rows, the file path from positional columns.
 */
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

/** languages.tsv's own row count, asserted rather than derived so that a file
 *  that silently loses rows fails here instead of quietly shrinking the diff. */
const TSV_LANGUAGE_COUNT = 8214;

/** Reads the first column of a TSV under `public/`, skipping the header, blank
 *  lines and comments - the same rows the merge-step loaders keep. */
function firstColumnIds(relativePath: string): string[] {
  return columnIds(relativePath, 0);
}

/** As firstColumnIds, for any column index. */
function columnIds(relativePath: string, column: number): string[] {
  const absolute = path.resolve(__dirname, '../../../../../../public', relativePath);
  if (!fs.existsSync(absolute)) return [];
  return fs
    .readFileSync(absolute, 'utf8')
    .split('\n')
    .slice(1)
    .map((line) => line.split('\t')[column]?.trim())
    .filter((id): id is string => id != null && id !== '' && !id.startsWith('#'));
}

/**
 * Every languoid id the merge steps can create, from the same files they read.
 *
 * Derived from the files rather than hardcoded so that adding a glottocode or
 * retiring a code does not need this test edited - only a languoid appearing in
 * NONE of these sources is a real finding.
 */
function idsFromMergeStepFiles(): Set<string> {
  return new Set([
    ...firstColumnIds('data/glottolog/glottolog.tsv'),
    // glottolog.tsv's ISO column, not just its glottocode column. A languoid
    // that has an ISO code is stored under THAT code, so `qbb` (Old Latin,
    // glottocode oldl1238) is a glottolog entry despite the ISO-shaped id.
    // Ten languages reach the database this way.
    ...columnIds('data/glottolog/glottolog.tsv', 3),
    ...firstColumnIds('data/iso/families639-5.tsv'),
    ...firstColumnIds('data/iso/iso-639-3_Retirements.tab'),
    ...firstColumnIds('data/iso/iso-639-3.tab'),
  ]);
}

function valuesMatch(a: unknown, b: unknown): boolean {
  return canonical(a) === canonical(b);
}

describe.skipIf(!API_URL)('language API/TSV parity', () => {
  async function loadBothPaths() {
    const server = await getServer();
    server.use(
      await makeFileAvailable('data/tc/languages.tsv'),
      // Scoped to the path this loader requests, NOT `${API_URL}/*`. jsdom's
      // base URL is also http://localhost:3000, so a wildcard here matches the
      // relative fetch of data/tc/languages.tsv too - and server.use()
      // PREPENDS, so it would shadow the file handler, send that request to
      // PostgREST, and leave the file path loading nothing. See FP-041.
      http.get(`${API_URL}/language`, () => passthrough()),
    );

    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadLanguages();
    if (fromApi == null || Object.keys(fromApi).length === 0) {
      vi.unstubAllEnvs();
      return null;
    }

    // The file path must be forced OFF explicitly. `vi.unstubAllEnvs()` restores
    // whatever `.env` holds, and anyone running this test has VITE_API_URL set
    // there by definition - so unstubbing would send BOTH loads to the API and
    // the comparison would pass by comparing the API against itself. The census
    // parity test passed a deliberately sabotaged mapper for exactly this reason.
    vi.stubEnv('VITE_API_URL', '');
    const fromFiles = await loadLanguages();
    vi.unstubAllEnvs();

    if (fromFiles == null) return null;

    // The file side must be non-empty before anything is compared. Both
    // field-by-field tests below iterate the FILE path's keys, so a file path
    // that loaded nothing compares zero pairs and passes - green against a
    // comparison that never happened. This is the general guard: it catches
    // any cause of an empty side, not just the FP-041 handler shadowing.
    expect(Object.keys(fromFiles).length).toBeGreaterThan(0);

    return { fromApi, fromFiles };
  }

  it('returns every language the TSV file holds', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    // A field-by-field diff cannot see a row missing from BOTH sides, so the
    // count is asserted against the file, which is the source of truth for the
    // languages this loader is responsible for.
    const fileIds = Object.keys(fromFiles).sort();
    expect(fileIds.filter((id) => !fromApi[id])).toEqual([]);
    expect(fileIds.length).toEqual(TSV_LANGUAGE_COUNT);
  }, 120_000);

  /**
   * The API path returns MORE languages than languages.tsv, and that is correct.
   *
   * The `language` table is the union of every authority the ETL reads, while
   * `languages.tsv` is one of its inputs. In the file path the difference
   * arrives later, from the merge steps that still run in CoreData.tsx:
   * addGlottologLanguages creates a languoid per glottocode,
   * addISOLanguageFamilyData one per ISO 639-5 family, and
   * addISORetirementsToLanguages one per retired code.
   *
   * So the extras are not compared field-by-field here - at load time the file
   * path has not created them yet. What IS asserted is that every extra traces
   * to a file some merge step reads, which is what would catch the API
   * inventing a languoid or the ETL ingesting something nobody asked for.
   */
  it('adds only languoids the merge steps would have created anyway', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    const accountedFor = idsFromMergeStepFiles();
    const unexplained = Object.keys(fromApi)
      .filter((id) => fromFiles[id] == null && !accountedFor.has(id))
      .sort();
    expect(unexplained).toEqual([]);
  }, 120_000);

  it('agrees with the TSV path on every field of every language', async (ctx) => {
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
      if (api == null) continue; // reported by the row-count test above

      for (const field of COMPARED_FIELDS) {
        if (!valuesMatch(api[field], file[field])) {
          mismatches.push(
            `${id}.${field}: api=${JSON.stringify(api[field])} file=${JSON.stringify(file[field])}`,
          );
        }
      }

      for (const source of COMPARED_SOURCES) {
        const apiValue: Record<string, unknown> = { ...api[source] };
        const fileValue: Record<string, unknown> = { ...file[source] };

        // The ETL drops these parents outright. Both sides are compared with
        // the field removed rather than the whole language being skipped, so
        // every OTHER field of an affected language is still checked.
        if (ETL_DROPS_THE_PARENT.includes(id) && source !== 'Combined' && source !== 'Glottolog') {
          delete apiValue.parentLanguageCode;
          delete fileValue.parentLanguageCode;
        }

        // A value only ONE side holds at load time converges once the merge
        // steps run; a value both hold must agree exactly.
        //
        // Both directions occur. The API leads on parents from
        // familiesToLanguages.tsv (`bho` -> `bih`), which addISOLanguageFamilyData
        // applies with `??=`. The FILE leads on Glottolog.parentLanguageCode for
        // the 56 languages whose glottocode reaches the API only as an alias
        // (`zho`, `ara`, `fas`...): languages.tsv's "Parent Glottocode" column is
        // read by the ETL solely while walking glottolog.tsv, so for these it is
        // never stored and NO query can return it. It converges because the
        // alias supplies Glottolog.code, groupLanguagesBySource indexes the
        // language under it, and addGlottologLanguages then assigns the parent
        // unconditionally on both paths - verified below, not assumed.
        for (const key of CONVERGING_KEYS) {
          if (fileValue[key] == null && apiValue[key] != null) delete apiValue[key];
          if (apiValue[key] == null && fileValue[key] != null) delete fileValue[key];
          // Both sides hold a value and glottolog.tsv is about to overrule the
          // file's. Compared as "both present" this would fail forever.
          if (GLOTTOLOG_OVERRIDES_THE_FILE.includes(id) && source !== 'ISO') {
            delete apiValue[key];
            delete fileValue[key];
          }
        }

        // `code` is compared strictly, with two named exceptions, so that a
        // MISSING glottocode still fails (see CONVERGING_KEYS):
        //  - the API leading on the 26 languoids whose glottocode reaches it
        //    from glottocodeToISO.tsv, which addGlottologLanguages applies to
        //    the file path later;
        //  - `zua`, which never converges.
        if (source === 'Glottolog') {
          if (fileValue.code == null && apiValue.code != null) delete apiValue.code;
          // `bvs` carries two glottocodes - the file's `belg1242` and
          // glottolog.tsv's `belg1241` - and the merge picks glottolog's.
          if (
            GLOTTOCODE_CLAIMED_BY_ANOTHER_LANGUAGE.includes(id) ||
            GLOTTOLOG_OVERRIDES_THE_FILE.includes(id)
          ) {
            delete apiValue.code;
            delete fileValue.code;
          }
        }

        if (!valuesMatch(apiValue, fileValue)) {
          mismatches.push(
            `${id}.${source}: api=${JSON.stringify(apiValue)} file=${JSON.stringify(fileValue)}`,
          );
        }
      }

      if (!valuesMatch(api.pop, file.pop)) {
        mismatches.push(
          `${id}.pop: api=${JSON.stringify(api.pop)} file=${JSON.stringify(file.pop)}`,
        );
      }
    }

    expect(mismatches.slice(0, 40)).toEqual([]);
    expect(mismatches).toEqual([]);
  }, 120_000);

  it('fills the ISO-family parents the ETL dropped, from the Combined parent', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi } = loaded;

    // These fifteen have NO UNESCO parent in the database - nine carry a NULL
    // and six have no UNESCO attribute row at all - because the ETL validates
    // each parent against the languages it has already read and runs before the
    // families exist. The mapper does not read that column: it derives the
    // ISO-family parents from the Combined parent whenever it is short enough
    // to be an ISO code, which is exactly what parseLanguageLine does.
    //
    // So the gap is INVISIBLE in the field-by-field diff, and this is what
    // proves the mapper is closing it rather than the database being fine. If
    // the ETL is fixed these keep passing; if the mapper stops deriving them
    // they fail immediately. See FP-035.
    const missing = ETL_DROPS_THE_PARENT.filter(
      (id) => fromApi[id] != null && fromApi[id].UNESCO.parentLanguageCode == null,
    );
    expect(missing).toEqual([]);
  }, 120_000);
});

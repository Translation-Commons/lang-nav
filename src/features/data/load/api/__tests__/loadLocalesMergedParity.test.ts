import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { groupLanguagesBySource } from '../../../connect/connectLanguages';
import { loadLanguages } from '../../entities/loadLanguages';
import { loadLocales } from '../../entities/loadLocales';
import {
  applyCombinedFamilyOverrides,
  loadCombinedFamilyOverrides,
} from '../../extra_entities/CombinedFamilyOverrides';
import {
  addGlottologLanguages,
  loadGlottocodeToISO,
  loadGlottologLanguages,
} from '../../extra_entities/GlottologData';
import { addIANAVariantLocales, loadIANAVariants } from '../../extra_entities/IANAData';
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
 * Parity for the locale DICTIONARY after `addIANAVariantLocales` has run, which
 * is a different question from the one `loadLocalesParity.test.ts` answers.
 *
 * That test compares what `loadLocales()` returns - 11,016 curated locales, and
 * the two paths agree on every field of every one of them. It cannot see this:
 * `addIANAVariantLocales` ADDS locales to the same dictionary afterwards, and
 * how many it adds depends on the LANGUAGE path, not the locale path.
 *
 * It exists because the browser check found the app-level locale total differs
 * between the two paths - 37,578 from files against 37,585 from the API - while
 * the loader-level diff was clean. A loader diff cannot see a row a later step
 * creates. The general rule, learned twice now on this migration: ask what a
 * diff's key set actually covers, and whether that is the same as what the app
 * renders.
 *
 * WHAT IT ESTABLISHED, and this is the point of keeping it: through the IANA
 * step both paths hold exactly 11,206 locales with zero key differences. So the
 * 7-locale gap is NOT created by the locale mapper, and NOT by
 * `addIANAVariantLocales` either.
 *
 * That leaves `connectEntitiesAndCreateDerivedData`, which runs next and
 * generates the ~26,000 regional and family locales.
 * `createFamilyLocales` walks `language[ISO].childLanguages` and creates one
 * locale per `${language.ID}_${territoryCode}`, so a languoid present in one
 * path's ISO tree and absent from the other's yields a family locale on one
 * side only - which is the known languoid identity mismatch between the ETL and
 * the frontend reaching locale through the language tree rather than through
 * any locale column. Confirming that precisely needs territories and
 * populations, so it is left to that fix's own gate rather than reproduced
 * here.
 *
 * This test is therefore the BOUNDARY MARKER: everything up to and including
 * the IANA step agrees, so any future divergence introduced before this point
 * fails here rather than being blamed on the generators.
 *
 * Gated exactly as the other parity tests are.
 */

const API_URL = import.meta.env.VITE_API_URL;

/** Every file this sequence fetches, so MSW can serve them from disk. */
const PIPELINE_FILES = [
  'data/tc/languages.tsv',
  'data/tc/locales.tsv',
  'data/iso/iso-639-3.tab',
  'data/iso/macrolanguages.tsv',
  'data/iso/families639-5.tsv',
  'data/tc/familiesToLanguages.tsv',
  'data/iso/iso-639-3_Retirements.tab',
  'data/glottolog/glottolog.tsv',
  'data/tc/glottocodeToISO.tsv',
  'data/tc/languageFamilyCombinedOverrides.tsv',
  'data/iana/variants.txt',
];

/**
 * CoreData.tsx's sequence, up to and including `addIANAVariantLocales`, in the
 * same order (CoreData.tsx:162-171).
 *
 * It stops there deliberately. `connectEntitiesAndCreateDerivedData` runs next
 * and creates the ~26,000 regional and family locales, but those depend on
 * territories, censuses and computed populations - pulling them in would make
 * this test depend on most of the app. The IANA step is the last one that
 * changes WHICH locales exist using only languages, locales and variants.
 */
async function loadAndMerge(): Promise<Record<string, LocaleData> | null> {
  const [
    initialLangs,
    locales,
    isoLangs,
    macroLangs,
    langFamilies,
    isoLangsToFamilies,
    isoRetirements,
    glottologImport,
    glottocodeToISO,
    combinedOverrides,
    variants,
  ] = await Promise.all([
    loadLanguages(),
    loadLocales(),
    loadISOLanguages(),
    loadISOMacrolanguages(),
    loadISOLanguageFamilies(),
    loadISOFamiliesToLanguages(),
    loadISORetirements(),
    loadGlottologLanguages(),
    loadGlottocodeToISO(),
    loadCombinedFamilyOverrides(),
    loadIANAVariants(),
  ]);

  if (initialLangs == null || locales == null) return null;

  addISODataToLanguages(initialLangs, isoLangs || []);
  const languagesBySource = groupLanguagesBySource(initialLangs);
  addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
  addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
  addISORetirementsToLanguages(languagesBySource, isoRetirements || []);
  addGlottologLanguages(languagesBySource, glottologImport || [], glottocodeToISO || {});
  applyCombinedFamilyOverrides(languagesBySource, combinedOverrides || []);
  addIANAVariantLocales(languagesBySource.BCP, locales, variants || undefined);

  return locales;
}

describe.skipIf(!API_URL)('locale API/TSV parity, after the IANA variant step', () => {
  async function loadBothPaths() {
    const server = await getServer();
    // Scoped to the API's own paths, NOT a wildcard over the whole origin.
    // jsdom resolves the relative file fetches against a base URL that is also
    // localhost:3000, so a wildcard would shadow the file handlers registered
    // here and send the file path to PostgREST, which would silently leave the
    // file side empty.
    server.use(
      ...(await Promise.all(PIPELINE_FILES.map(makeFileAvailable))),
      http.get(`${API_URL}/locale`, () => passthrough()),
      http.get(`${API_URL}/language`, () => passthrough()),
      http.get(`${API_URL}/variant`, () => passthrough()),
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

    // An empty side is a broken test, not agreement: every comparison below
    // iterates one side's keys and would pass trivially.
    expect(Object.keys(fromFiles).length).toBeGreaterThan(0);

    return { fromApi, fromFiles };
  }

  it('still agrees on the curated locales after the IANA step', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    // The mapper's own output must survive a later step writing into the same
    // dictionary - the IANA step writes into the very same object.
    const curated = Object.values(fromFiles).filter(
      (locale) => locale.localeSource === LocaleSource.StableDatabase,
    );
    expect(curated.length).toBe(11016);

    const missing = curated
      .filter((locale) => fromApi[locale.ID] == null)
      .map((locale) => locale.ID);
    expect(missing).toEqual([]);

    const changedSource = curated
      .filter((locale) => fromApi[locale.ID].localeSource !== LocaleSource.StableDatabase)
      .map((locale) => locale.ID);
    expect(changedSource).toEqual([]);
  }, 180_000);

  it('creates the same IANA variant locales on both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    const ianaIds = (locales: Record<string, LocaleData>) =>
      Object.values(locales)
        .filter((locale) => locale.localeSource === LocaleSource.IANA)
        .map((locale) => locale.ID)
        .sort();

    expect(ianaIds(fromApi)).toEqual(ianaIds(fromFiles));
  }, 180_000);

  it('ends with the same locale count on both paths', async (ctx) => {
    const loaded = await loadBothPaths();
    if (loaded == null) {
      ctx.skip();
      return;
    }
    const { fromApi, fromFiles } = loaded;

    expect(Object.keys(fromApi).length).toBe(Object.keys(fromFiles).length);
  }, 180_000);
});

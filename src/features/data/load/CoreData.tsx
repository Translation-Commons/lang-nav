import { useMemo, useState } from 'react';

import {
  addIANAVariantLocales,
  loadIANAVariants,
} from '@features/data/load/extra_entities/IANAData';
import { EntityType } from '@features/params/PageParamTypes';

import { CensusData, CensusID } from '@entities/census/CensusTypes';
import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageData, LanguagesBySource } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { connectEntitiesAndCreateDerivedData } from '../compute/connectEntities';
import { groupLanguagesBySource } from '../connect/connectLanguages';

import { isApiEnabled } from './api/apiConfig';
import { loadKeyboardsGBoard } from './entities/loadKeyboardsGBoard';
import { loadKeyboardsKeyman } from './entities/loadKeyboardsKeyman';
import { loadLanguages } from './entities/loadLanguages';
import { loadLocales } from './entities/loadLocales';
import { loadOrganizations } from './entities/loadOrganizations';
import { loadTerritories } from './entities/loadTerritories';
import { loadWritingSystems } from './entities/loadWritingSystems';
import {
  applyCombinedFamilyOverrides,
  loadCombinedFamilyOverrides,
} from './extra_entities/CombinedFamilyOverrides';
import {
  addGlottologLanguages,
  loadGlottocodeToISO,
  loadGlottologLanguages,
} from './extra_entities/GlottologData';
import {
  addISODataToLanguages,
  addISOLanguageFamilyData,
  addISOMacrolanguageData,
  getUniqueISO6392bLanguages,
  loadISOFamiliesToLanguages,
  loadISOLanguageFamilies,
  loadISOLanguages,
  loadISOMacrolanguages,
} from './extra_entities/ISOData';
import { addISORetirementsToLanguages, loadISORetirements } from './extra_entities/ISORetirements';
import { addCLDRLanguageDetails } from './supplemental/UnicodeData';

export type CoreDataArrays = {
  allLanguoids: LanguageData[]; // Using the technical term here since some of these are language groups or subsets
  locales: LocaleData[];
  territories: TerritoryData[];
  variants: VariantData[];
  writingSystems: WritingSystemData[];
  keyboards: KeyboardData[];
  censuses: Record<CensusID, CensusData>;
  organizations: OrganizationData[];
};

export type CoreData = CoreDataArrays & {
  ents: Record<string, EntityData>;
};

export const EMPTY_LANGUAGES_BY_SCHEMA: LanguagesBySource = {
  Combined: {},
  ISO: {},
  BCP: {},
  Glottolog: {},
  UNESCO: {},
  CLDR: {},
};

/**
 * Get core data needed to show the tables -- things like language codes, relationships with other languages.
 */

export function useCoreData(): {
  loadCoreData: () => Promise<void>;
  coreData: CoreData;
} {
  const [allLanguoids, setAllLanguoids] = useState<LanguageData[]>([]);
  const [ents, setEnts] = useState<Record<string, EntityData>>({});

  // Censuses are not populated here, but this seems necessary because the state affects the page.
  const [censuses, setCensuses] = useState<Record<CensusID, CensusData>>({});

  async function loadCoreData(): Promise<void> {
    const [
      initialLangs,
      isoLangs,
      macroLangs,
      langFamilies,
      isoLangsToFamilies,
      isoRetirements,
      glottologImport,
      glottocodeToISO,
      combinedFamilyOverrides,
      territories,
      locales,
      writingSystems,
      variants,
      keyboardsGBoard,
      keyboardsKeyman,
      organizations,
    ] = await Promise.all([
      loadLanguages(),
      loadISOLanguages(),
      // ONE of the eight language files is skipped when the API is on.
      //
      // macrolanguages.tsv feeds addISOMacrolanguageData, which assigns
      // NOTHING: every branch of that function is a `console.debug` behind
      // `DEBUG = false`, so it is a no-op at runtime on either path. Skipping
      // the fetch is therefore free, and it is the only one of the eight that
      // is.
      //
      // The other seven STAY, and the reasons are not the same:
      //
      //  - Five create languoids or delete them from the per-source
      //    dictionaries, and the two paths do not agree on languoid IDENTITY -
      //    390 differ. See DevLog 14_Phase2_Language_API §7.
      //  - languageFamilyCombinedOverrides.tsv looked safe and is NOT. The
      //    database holds all 70 override parents correctly, but
      //    addGlottologLanguages runs FIRST and overwrites them from
      //    glottolog.tsv - `atay1246` goes to `map` - and this file is what
      //    restores `fox` afterwards. It is load-bearing for as long as the
      //    Glottolog step runs. Measured: skipping it moved the Combined
      //    parent of dozens of languages.
      isApiEnabled() ? Promise.resolve([]) : loadISOMacrolanguages(),
      loadISOLanguageFamilies(),
      loadISOFamiliesToLanguages(),
      loadISORetirements(),
      loadGlottologLanguages(),
      loadGlottocodeToISO(),
      loadCombinedFamilyOverrides(),
      loadTerritories(),
      loadLocales(),
      loadWritingSystems(),
      loadIANAVariants(),
      loadKeyboardsGBoard(),
      loadKeyboardsKeyman(),
      loadOrganizations(),
    ]);

    if (
      initialLangs == null ||
      territories == null ||
      locales == null ||
      writingSystems == null ||
      variants == null ||
      keyboardsGBoard == null ||
      keyboardsKeyman == null ||
      organizations == null
    ) {
      alert('Error loading data. Please check the console for more details.');
      return;
    }

    const keyboards = { ...keyboardsGBoard, ...keyboardsKeyman };

    addISODataToLanguages(initialLangs, isoLangs || []);
    const languagesBySource = groupLanguagesBySource(initialLangs);
    addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
    addISORetirementsToLanguages(languagesBySource, isoRetirements || []);
    addGlottologLanguages(languagesBySource, glottologImport || [], glottocodeToISO || {});
    applyCombinedFamilyOverrides(languagesBySource, combinedFamilyOverrides || []);
    addCLDRLanguageDetails(languagesBySource);
    addIANAVariantLocales(languagesBySource.BCP, locales, variants);

    connectEntitiesAndCreateDerivedData(
      languagesBySource,
      territories,
      writingSystems,
      locales,
      variants,
      keyboards,
      organizations,
    );

    setCensuses({}); // Censuses are not loaded here, but this is needed to enable the page updates.
    setAllLanguoids(Object.values(languagesBySource.Combined));

    setEnts({
      // All combined into one big entity map for easy lookup but the ID formats are unique so its OK
      ...languagesBySource.Glottolog, // aaaa0000
      ...languagesBySource.ISO, // aaa
      ...getUniqueISO6392bLanguages(languagesBySource), // ISO 639-2b codes
      ...languagesBySource.BCP, // aa | aaa
      ...languagesBySource.Combined, // A few languages like `mol` aren't in those sets but should still be indexed
      ...territories, // AA | 000
      ...locales, // aa_Aaaa_AA... etc.
      ...writingSystems, // Aaaa
      ...variants, // These may be arbitrary, but usually 6-8 alphabetic
      ...keyboards,
      ...organizations, // These should be prefixed by org.
    });
  }

  const coreData = useMemo(
    () => ({
      allLanguoids,
      locales: Object.values(ents).filter((e): e is LocaleData => e.type === EntityType.Locale),
      territories: Object.values(ents).filter(
        (e): e is TerritoryData => e.type === EntityType.Territory,
      ),
      variants: Object.values(ents).filter((e): e is VariantData => e.type === EntityType.Variant),
      writingSystems: Object.values(ents).filter(
        (e): e is WritingSystemData => e.type === EntityType.WritingSystem,
      ),
      keyboards: Object.values(ents).filter(
        (e): e is KeyboardData => e.type === EntityType.Keyboard,
      ),
      censuses,
      organizations: Object.values(ents).filter(
        (e): e is OrganizationData => e.type === EntityType.Org,
      ),
      ents,
    }),
    [allLanguoids, ents, censuses],
  );

  return {
    loadCoreData,
    coreData,
  };
}

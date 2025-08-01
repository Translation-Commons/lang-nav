import { useState } from 'react';

import { CensusID, CensusData } from '../types/CensusTypes';
import {
  BCP47LocaleCode,
  LocaleData,
  ScriptCode,
  TerritoryCode,
  TerritoryData,
  WritingSystemData,
} from '../types/DataTypes';
import { LanguagesBySource } from '../types/LanguageTypes';

import {
  addISODataToLanguages,
  addISOLanguageFamilyData,
  addISOMacrolanguageData,
  loadISOFamiliesToLanguages,
  loadISOLanguageFamilies,
  loadISOLanguages,
  loadISOMacrolanguages,
} from './AddISOData';
import {
  computeOtherPopulationStatistics,
  connectLanguagesToParent,
  connectLocales,
  connectWritingSystems,
  groupLanguagesBySource,
} from './DataAssociations';
import { loadLanguages, loadLocales, loadWritingSystems } from './DataLoader';
import {
  addGlottologLanguages,
  loadGlottologLanguages,
  loadManualGlottocodeToISO,
} from './GlottologData';
import {
  loadIANAVariants,
  addIANAVariantLocales,
  connectVariantTags,
  VariantTagDictionary,
} from './IANAData';
import {
  connectTerritoriesToParent,
  createRegionalLocales,
  loadTerritories,
} from './TerritoryData';
import { addCLDRLanguageDetails } from './UnicodeData';

export type CoreData = {
  censuses: Record<CensusID, CensusData>;
  languagesBySource: LanguagesBySource;
  locales: Record<BCP47LocaleCode, LocaleData>;
  territories: Record<TerritoryCode, TerritoryData>;
  writingSystems: Record<ScriptCode, WritingSystemData>;
  variantTags: VariantTagDictionary;
};

export const EMPTY_LANGUAGES_BY_SCHEMA: LanguagesBySource = {
  All: {},
  ISO: {},
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
  const [languagesBySource, setLanguagesBySource] =
    useState<LanguagesBySource>(EMPTY_LANGUAGES_BY_SCHEMA);
  const [locales, setLocales] = useState<Record<BCP47LocaleCode, LocaleData>>({});
  const [territories, setTerritories] = useState<Record<TerritoryCode, TerritoryData>>({});
  const [writingSystems, setWritingSystems] = useState<Record<ScriptCode, WritingSystemData>>({});
  const [variantTags, setVariantTags] = useState<VariantTagDictionary>({});

  // Censuses are not populated here, but this seems necessary because the state affects the page.

  const [censuses, setCensuses] = useState<Record<CensusID, CensusData>>({});

  async function loadCoreData(): Promise<void> {
    const [
      initialLangs,
      isoLangs,
      macroLangs,
      langFamilies,
      isoLangsToFamilies,
      glottologImport,
      manualGlottocodeToISO,
      territories,
      locales,
      writingSystems,
      variantTags,
    ] = await Promise.all([
      loadLanguages(),
      loadISOLanguages(),
      loadISOMacrolanguages(),
      loadISOLanguageFamilies(),
      loadISOFamiliesToLanguages(),
      loadGlottologLanguages(),
      loadManualGlottocodeToISO(),
      loadTerritories(),
      loadLocales(),
      loadWritingSystems(),
      loadIANAVariants(),
    ]);

    if (
      initialLangs == null ||
      territories == null ||
      locales == null ||
      writingSystems == null ||
      variantTags == null
    ) {
      alert('Error loading data. Please check the console for more details.');
      return;
    }

    addISODataToLanguages(initialLangs, isoLangs || []);
    const languagesBySource = groupLanguagesBySource(initialLangs);
    addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
    addGlottologLanguages(languagesBySource, glottologImport || [], manualGlottocodeToISO || {});
    addCLDRLanguageDetails(languagesBySource);
    addIANAVariantLocales(languagesBySource, locales, variantTags);

    connectLanguagesToParent(languagesBySource);
    connectTerritoriesToParent(territories);
    connectWritingSystems(languagesBySource.All, territories, writingSystems);
    connectLocales(languagesBySource.All, territories, writingSystems, locales);
    connectVariantTags(variantTags, languagesBySource.CLDR, locales);
    createRegionalLocales(territories, locales); // create them after connecting them
    computeOtherPopulationStatistics(languagesBySource, writingSystems);

    setCensuses({}); // Censuses are not loaded here, but this is needed to enable the page updates.
    setLanguagesBySource(languagesBySource);
    setTerritories(territories);
    setLocales(locales);
    setWritingSystems(writingSystems);
    setVariantTags(variantTags);
  }

  return {
    loadCoreData,
    coreData: {
      censuses,
      languagesBySource,
      locales,
      territories,
      writingSystems,
      variantTags,
    },
  };
}

import { useState } from 'react';

import { CensusID, CensusData } from '../types/CensusTypes';
import {
  BCP47LocaleCode,
  VariantTagData,
  VariantIANATag,
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
import { connectVariantTags } from './connectVariantTags';
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
import { loadIANAVariants, addIANAVariantLocales, convertToVariantTagData } from './IANAData';
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
  variantTags: VariantTagData[];
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

  // Censuses are not population here, but this seems necessary because the state affects the page.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [censuses, _setCensuses] = useState<Record<CensusID, CensusData>>({});
  const [variantTags, setVariantTags] = useState<Record<VariantIANATag, VariantTagData>>({});

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
      ianaVariants,
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

    if (initialLangs == null || territories == null || locales == null || writingSystems == null) {
      alert('Error loading data. Please check the console for more details.');
      return;
    }

    addISODataToLanguages(initialLangs, isoLangs || []);
    const languagesBySource = groupLanguagesBySource(initialLangs);
    addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
    addGlottologLanguages(languagesBySource, glottologImport || [], manualGlottocodeToISO || {});
    addCLDRLanguageDetails(languagesBySource);
    addIANAVariantLocales(languagesBySource, locales, ianaVariants);
    const variantTagArray = convertToVariantTagData(ianaVariants || []);
    const variantTagMap: Record<VariantIANATag, VariantTagData> = Object.fromEntries(
      variantTagArray.map((v) => [v.ID, v]),
    );
    connectVariantTags(Object.values(variantTagMap), languagesBySource.CLDR, locales);
    setVariantTags(variantTagMap);

    connectLanguagesToParent(languagesBySource);
    connectTerritoriesToParent(territories);
    connectWritingSystems(languagesBySource.All, territories, writingSystems);
    connectLocales(languagesBySource.All, territories, writingSystems, locales);
    createRegionalLocales(territories, locales); // create them after connecting them
    computeOtherPopulationStatistics(languagesBySource, writingSystems);

    setLanguagesBySource(languagesBySource);
    setTerritories(territories);
    setLocales(locales);
    setWritingSystems(writingSystems);
  }

  return {
    loadCoreData,
    coreData: {
      censuses,
      languagesBySource,
      locales,
      territories,
      writingSystems,
      variantTags: Object.values(variantTags),
    },
  };
}

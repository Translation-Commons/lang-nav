import { useState } from 'react';

import { loadVariantTagData } from '../data/IANAData';

import { CensusID, CensusData } from '../types/CensusTypes';
import {
  BCP47LocaleCode,
  LocaleData,
  ScriptCode,
  TerritoryCode,
  TerritoryData,
  WritingSystemData,
  VariantTagData // issue 6
} from '../types/DataTypes';
import { LanguagesBySchema } from '../types/LanguageTypes';

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
  groupLanguagesBySchema,
} from './DataAssociations';
import { loadLanguages, loadLocales, loadWritingSystems } from './DataLoader';
import {
  addGlottologLanguages,
  loadGlottologLanguages,
  loadManualGlottocodeToISO,
} from './GlottologData';
import {
  connectTerritoriesToParent,
  createRegionalLocales,
  loadTerritories,
} from './TerritoryData';
import { addCLDRLanguageSchema, loadCLDRAliases } from './UnicodeData';

export type CoreData = {
  censuses: Record<CensusID, CensusData>;
  languagesBySchema: LanguagesBySchema;
  locales: Record<BCP47LocaleCode, LocaleData>;
  territories: Record<TerritoryCode, TerritoryData>;
  writingSystems: Record<ScriptCode, WritingSystemData>;
  variantTags: Record<IANAVariantTag, VariantTagData>;
};

export const EMPTY_LANGUAGES_BY_SCHEMA: LanguagesBySchema = {
  Inclusive: {},
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
  const [languagesBySchema, setLanguagesBySchema] =
    useState<LanguagesBySchema>(EMPTY_LANGUAGES_BY_SCHEMA);
  const [locales, setLocales] = useState<Record<BCP47LocaleCode, LocaleData>>({});
  const [territories, setTerritories] = useState<Record<TerritoryCode, TerritoryData>>({});
  const [writingSystems, setWritingSystems] = useState<Record<ScriptCode, WritingSystemData>>({});

  // Censuses are not population here, but this seems necessary because the state affects the page.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [censuses, _setCensuses] = useState<Record<CensusID, CensusData>>({});

  async function loadCoreData(): Promise<void> {
    const [
      initialLangs,
      isoLangs,
      macroLangs,
      langFamilies,
      isoLangsToFamilies,
      glottologImport,
      manualGlottocodeToISO,
      cldrAliases,
      territories,
      locales,
      writingSystems,
    ] = await Promise.all([
      loadLanguages(),
      loadISOLanguages(),
      loadISOMacrolanguages(),
      loadISOLanguageFamilies(),
      loadISOFamiliesToLanguages(),
      loadGlottologLanguages(),
      loadManualGlottocodeToISO(),
      loadCLDRAliases(),
      loadTerritories(),
      loadLocales(),
      loadWritingSystems(),
    ]);
    if (initialLangs == null || territories == null || locales == null || writingSystems == null) {
      alert('Error loading data. Please check the console for more details.');
      return;
    }

    addISODataToLanguages(initialLangs, isoLangs || []);
    const languagesBySchema = groupLanguagesBySchema(initialLangs);
    addISOLanguageFamilyData(languagesBySchema, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySchema.ISO, macroLangs || []);
    addGlottologLanguages(languagesBySchema, glottologImport || [], manualGlottocodeToISO || {});
    addCLDRLanguageSchema(languagesBySchema, cldrAliases || []);

    connectLanguagesToParent(languagesBySchema);
    connectTerritoriesToParent(territories);
    connectWritingSystems(languagesBySchema.Inclusive, territories, writingSystems);
    connectLocales(languagesBySchema.Inclusive, territories, writingSystems, locales);
    createRegionalLocales(territories, locales); // create them after connecting them
    computeOtherPopulationStatistics(languagesBySchema, writingSystems);

    // ISSUE 6
    // Load and parse IANA variant tags
const variantTagRaw = await fetch('./data/language-subtag-registry.txt').then(r => r.text());
const variantTags = loadVariantTagData(variantTagRaw);

// TODO: Call connectVariantTags(...) here after writing it

    setLanguagesBySchema(languagesBySchema);
    setTerritories(territories);
    setLocales(locales);
    setWritingSystems(writingSystems);
  }

  return {
    loadCoreData,
    coreData: {
      censuses,
      languagesBySchema,
      locales,
      territories,
      writingSystems,
      variantTags, // issue 6
    },
  };
}

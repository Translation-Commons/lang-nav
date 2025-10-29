import { useState } from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { LanguageData, LanguagesBySource } from '@entities/language/LanguageTypes';
import {
  LocaleData,
  ObjectData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { loadAllCensuses } from './CensusData';
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
import { loadIANAVariants, addIANAVariantLocales, connectVariantTags } from './IANAData';
import { addISORetirementsToLanguages, loadISORetirements } from './iso/ISORetirements';
import {
  addISODataToLanguages,
  addISOLanguageFamilyData,
  addISOMacrolanguageData,
  loadISOFamiliesToLanguages,
  loadISOLanguageFamilies,
  loadISOLanguages,
  loadISOMacrolanguages,
} from './ISOData';
import {
  computeLocalePopulationFromCensuses,
  computeLocaleWritingPopulation,
} from './PopulationData';
import {
  computeContainedTerritoryStats,
  connectTerritoriesToParent,
  createRegionalLocales,
  loadTerritories,
  loadTerritoryGDPLiteracy,
} from './TerritoryData';
import { addCLDRLanguageDetails, loadCLDRCoverage } from './UnicodeData';
import { loadAndApplyWikipediaData } from './WikipediaData';

export type CoreDataArrays = {
  allLanguoids: LanguageData[]; // Using the technical term here since some of these are language groups or subsets
  locales: LocaleData[];
  territories: TerritoryData[];
  variantTags: VariantTagData[];
  writingSystems: WritingSystemData[];
  censuses: CensusData[];
};

export type CoreData = CoreDataArrays & {
  objects: Record<string, ObjectData>;
};

export const EMPTY_LANGUAGES_BY_SCHEMA: LanguagesBySource = {
  All: {},
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
  const [objects, setObjects] = useState<Record<string, ObjectData>>({});

  async function loadCoreData(): Promise<void> {
    // Stage 1: Load all most data objects in parallel
    const [
      initialLangs,
      isoLangs,
      macroLangs,
      langFamilies,
      isoLangsToFamilies,
      isoRetirements,
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
      loadISORetirements(),
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

    // Stage 2: Compile objects
    addISODataToLanguages(initialLangs, isoLangs || []);
    const languagesBySource = groupLanguagesBySource(initialLangs);
    addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
    addISORetirementsToLanguages(languagesBySource, isoRetirements || []);
    addGlottologLanguages(languagesBySource, glottologImport || [], manualGlottocodeToISO || {});
    addCLDRLanguageDetails(languagesBySource);
    addIANAVariantLocales(languagesBySource.BCP, locales, variantTags);

    // Stage 3: Connect related data, eg. language.territory = territory...
    connectLanguagesToParent(languagesBySource);
    connectTerritoriesToParent(territories);
    connectWritingSystems(languagesBySource.All, territories, writingSystems);
    connectLocales(languagesBySource.All, territories, writingSystems, locales);
    connectVariantTags(variantTags, languagesBySource.BCP, locales);
    createRegionalLocales(territories, locales); // create them after connecting them
    computeOtherPopulationStatistics(languagesBySource, writingSystems);

    // Stage 4: Load census data
    const languageLookup = {
      ...languagesBySource.Glottolog, // aaaa0000
      ...languagesBySource.ISO, // aaa
      ...languagesBySource.BCP, // aa | aaa
      ...languagesBySource.All, // A few languages like `mol` aren't in those sets but should still be indexed
    };
    const censuses = await loadAllCensuses(languageLookup, locales, territories);

    // Stage 5: Load supplemental data
    await Promise.all([
      loadCLDRCoverage(languageLookup),
      loadTerritoryGDPLiteracy(territories),
      loadAndApplyWikipediaData(languageLookup, locales),
    ]);

    const world = territories['001']; // 001 is the UN code for the World
    computeContainedTerritoryStats(world);
    computeLocalePopulationFromCensuses(locales, world);
    computeLocaleWritingPopulation(locales);

    // Stage 6: Finalize state
    setAllLanguoids(Object.values(languagesBySource.All));
    setObjects({
      // All combined into one big object map for easy lookup but the ID formats are unique so its OK
      ...languageLookup, // aaaa0000 | aaa | aa
      ...territories, // AA | 000
      ...locales, // aa_Aaaa_AA... etc.
      ...writingSystems, // Aaaa
      ...variantTags, // These may be arbitrary, but usually 4-8 alphanumeric characters
      ...censuses,
    });
  }

  return {
    loadCoreData,
    coreData: {
      allLanguoids,
      locales: Object.values(objects).filter((o): o is LocaleData => o.type === ObjectType.Locale),
      territories: Object.values(objects).filter(
        (o): o is TerritoryData => o.type === ObjectType.Territory,
      ),
      variantTags: Object.values(objects).filter(
        (o): o is VariantTagData => o.type === ObjectType.VariantTag,
      ),
      writingSystems: Object.values(objects).filter(
        (o): o is WritingSystemData => o.type === ObjectType.WritingSystem,
      ),
      censuses: Object.values(objects).filter((o): o is CensusData => o.type === ObjectType.Census),
      objects,
    },
  };
}

import { useState } from 'react';

import {
  loadIANAVariants,
  addIANAVariantLocales,
  connectVariantTags,
} from '@features/data/load/extra_entities/IANAData';
import { ObjectType } from '@features/params/PageParamTypes';

import { CensusID, CensusData } from '@entities/census/CensusTypes';
import { LanguageData, LanguagesBySource } from '@entities/language/LanguageTypes';
import {
  LocaleData,
  ObjectData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { computeDescendantPopulation } from '../compute/computeDescendantPopulation';
import { computeLanguageVitality } from '../compute/computeLanguageVitality';
import { groupLanguagesBySource } from '../connect/connectLanguages';
import { connectLanguagesToParent } from '../connect/connectLanguagesToParent';
import connectLocales from '../connect/connectLocales';
import { connectTerritoriesToParent } from '../connect/connectTerritoriesToParent';
import { connectWritingSystems } from '../connect/connectWritingSystems';
import { createRegionalLocales } from '../connect/createRegionalLocales';

import { loadLanguages } from './entities/loadLanguages';
import { loadLocales } from './entities/loadLocales';
import { loadTerritories } from './entities/loadTerritories';
import { loadWritingSystems } from './entities/loadWritingSystems';
import {
  addGlottologLanguages,
  loadGlottologLanguages,
  loadManualGlottocodeToISO,
} from './extra_entities/GlottologData';
import {
  addISODataToLanguages,
  addISOLanguageFamilyData,
  addISOMacrolanguageData,
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
  variantTags: VariantTagData[];
  writingSystems: WritingSystemData[];
  censuses: Record<CensusID, CensusData>;
};

export type CoreData = CoreDataArrays & {
  objects: Record<string, ObjectData>;
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
  const [objects, setObjects] = useState<Record<string, ObjectData>>({});

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

    addISODataToLanguages(initialLangs, isoLangs || []);
    const languagesBySource = groupLanguagesBySource(initialLangs);
    addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
    addISORetirementsToLanguages(languagesBySource, isoRetirements || []);
    addGlottologLanguages(languagesBySource, glottologImport || [], manualGlottocodeToISO || {});
    addCLDRLanguageDetails(languagesBySource);
    addIANAVariantLocales(languagesBySource.BCP, locales, variantTags);

    connectLanguagesToParent(languagesBySource);
    connectTerritoriesToParent(territories);
    connectWritingSystems(languagesBySource.Combined, territories, writingSystems);
    connectLocales(languagesBySource.Combined, territories, writingSystems, locales);
    connectVariantTags(variantTags, languagesBySource.BCP, locales);
    createRegionalLocales(territories, locales); // create them after connecting them
    computeDescendantPopulation(languagesBySource, writingSystems);
    computeLanguageVitality(Object.values(languagesBySource.Combined));

    setCensuses({}); // Censuses are not loaded here, but this is needed to enable the page updates.
    setAllLanguoids(Object.values(languagesBySource.Combined));
    setObjects({
      // All combined into one big object map for easy lookup but the ID formats are unique so its OK
      ...languagesBySource.Glottolog, // aaaa0000
      ...languagesBySource.ISO, // aaa
      ...languagesBySource.BCP, // aa | aaa
      ...languagesBySource.Combined, // A few languages like `mol` aren't in those sets but should still be indexed
      ...territories, // AA | 000
      ...locales, // aa_Aaaa_AA... etc.
      ...writingSystems, // Aaaa
      ...variantTags, // These may be arbitrary, but usually 6-8 alphabetic
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
      censuses,
      objects,
    },
  };
}

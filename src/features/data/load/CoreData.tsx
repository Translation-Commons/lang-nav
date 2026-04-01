import { useState } from 'react';

import {
  addIANAVariantLocales,
  loadIANAVariants,
} from '@features/data/load/extra_entities/IANAData';
import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData, CensusID } from '@entities/census/CensusTypes';
import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageData, LanguagesBySource } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { connectObjectsAndCreateDerivedData } from '../compute/connectObjects';
import { groupLanguagesBySource } from '../connect/connectLanguages';

import { loadKeyboardsGBoard } from './entities/loadKeyboardsGBoard';
import { loadLanguages } from './entities/loadLanguages';
import { loadLocales } from './entities/loadLocales';
import { loadTerritories } from './entities/loadTerritories';
import { loadWritingSystems } from './entities/loadWritingSystems';
import {
  addGlottologLanguages,
  loadGlottocodeToISO,
  loadGlottologLanguages,
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
import { addEthnologueDataToLanguages, loadEthnologueLanguages } from './extra_entities/SILData';
import { addCLDRLanguageDetails } from './supplemental/UnicodeData';

export type CoreDataArrays = {
  allLanguoids: LanguageData[]; // Using the technical term here since some of these are language groups or subsets
  locales: LocaleData[];
  territories: TerritoryData[];
  variants: VariantData[];
  writingSystems: WritingSystemData[];
  keyboards: KeyboardData[];
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
  Ethnologue: {},
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
      ethnologueLangs,
      glottologImport,
      glottocodeToISO,
      territories,
      locales,
      writingSystems,
      variants,
      keyboards,
    ] = await Promise.all([
      loadLanguages(),
      loadISOLanguages(),
      loadISOMacrolanguages(),
      loadISOLanguageFamilies(),
      loadISOFamiliesToLanguages(),
      loadISORetirements(),
      loadEthnologueLanguages(),
      loadGlottologLanguages(),
      loadGlottocodeToISO(),
      loadTerritories(),
      loadLocales(),
      loadWritingSystems(),
      loadIANAVariants(),
      loadKeyboardsGBoard(),
    ]);

    if (
      initialLangs == null ||
      territories == null ||
      locales == null ||
      writingSystems == null ||
      variants == null ||
      keyboards == null
    ) {
      alert('Error loading data. Please check the console for more details.');
      return;
    }

    addISODataToLanguages(initialLangs, isoLangs || []);
    addEthnologueDataToLanguages(initialLangs, ethnologueLangs || []);
    const languagesBySource = groupLanguagesBySource(initialLangs);
    addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
    addISORetirementsToLanguages(languagesBySource, isoRetirements || []);
    addGlottologLanguages(languagesBySource, glottologImport || [], glottocodeToISO || {});
    addCLDRLanguageDetails(languagesBySource);
    addIANAVariantLocales(languagesBySource.BCP, locales, variants);

    connectObjectsAndCreateDerivedData(
      languagesBySource,
      territories,
      writingSystems,
      locales,
      variants,
      keyboards,
    );

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
      ...variants, // These may be arbitrary, but usually 6-8 alphabetic
      ...keyboards,
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
      variants: Object.values(objects).filter(
        (o): o is VariantData => o.type === ObjectType.Variant,
      ),
      writingSystems: Object.values(objects).filter(
        (o): o is WritingSystemData => o.type === ObjectType.WritingSystem,
      ),
      keyboards: Object.values(objects).filter(
        (o): o is KeyboardData => o.type === ObjectType.Keyboard,
      ),
      censuses,
      objects,
    },
  };
}

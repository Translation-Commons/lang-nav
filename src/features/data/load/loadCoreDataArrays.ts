import type { CensusData, CensusID } from '@entities/census/CensusTypes';
import type { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import type { LanguageData } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import type { OrthographyData } from '@entities/orthography/OrthographyTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData, EntityType } from '@entities/types/EntityTypes';
import type { VariantData } from '@entities/variant/VariantTypes';
import type { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import { connectEntitiesAndCreateDerivedData } from '../connect/connectEntities';
import { addAliasesToLanguageDictionary } from '../connect/connectLanguages';

import { loadKeyboardsGBoard } from './entities/loadKeyboardsGBoard';
import { loadKeyboardsKeyman } from './entities/loadKeyboardsKeyman';
import { loadLanguages } from './entities/loadLanguages';
import { loadLocales } from './entities/loadLocales';
import { addMacrolanguageStandards, loadMacroStandards } from './entities/loadMacroStandards';
import { loadOrganizations } from './entities/loadOrganizations';
import { loadTechnologies } from './entities/loadTechnologies';
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
import { addIANAVariantLocales, loadIANAVariants } from './extra_entities/IANAData';
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
import { loadOrthographies } from './supplemental/loadOrthographies';
import { addCLDRLanguageDetails } from './supplemental/UnicodeData';

export type CoreDataArrays = {
  languages: LanguageData[];
  locales: LocaleData[];
  territories: TerritoryData[];
  variants: VariantData[];
  orthographies: OrthographyData[];
  writingSystems: WritingSystemData[];
  keyboards: KeyboardData[];
  censuses: Record<CensusID, CensusData>;
  organizations: OrganizationData[];
  technologies: TechnologyData[];
};

export type CoreData = CoreDataArrays & {
  ents: Record<string, EntityData>;
};

export type LoadedCoreData = {
  languages: LanguageData[];
  ents: Record<string, EntityData>;
};

/**
 * Loads, parses, and connects the core data without any React state.
 * Returns undefined when a required file failed to load.
 */
export async function loadCoreDataArrays(): Promise<LoadedCoreData | undefined> {
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
    macroStandards,
    territories,
    locales,
    writingSystems,
    orthographies,
    variants,
    keyboardsGBoard,
    keyboardsKeyman,
    organizations,
    technologies,
  ] = await Promise.all([
    loadLanguages(),
    loadISOLanguages(),
    loadISOMacrolanguages(),
    loadISOLanguageFamilies(),
    loadISOFamiliesToLanguages(),
    loadISORetirements(),
    loadGlottologLanguages(),
    loadGlottocodeToISO(),
    loadCombinedFamilyOverrides(),
    loadMacroStandards(),
    loadTerritories(),
    loadLocales(),
    loadWritingSystems(),
    loadOrthographies(),
    loadIANAVariants(),
    loadKeyboardsGBoard(),
    loadKeyboardsKeyman(),
    loadOrganizations(),
    loadTechnologies(),
  ]);

  if (
    initialLangs == null ||
    territories == null ||
    locales == null ||
    writingSystems == null ||
    variants == null ||
    orthographies == null ||
    keyboardsGBoard == null ||
    keyboardsKeyman == null ||
    organizations == null ||
    technologies == null
  ) {
    return undefined;
  }

  const keyboards = { ...keyboardsGBoard, ...keyboardsKeyman };
  const languageDictionary = addAliasesToLanguageDictionary(initialLangs);
  addISODataToLanguages(languageDictionary, isoLangs || []);
  addISOLanguageFamilyData(languageDictionary, langFamilies || [], isoLangsToFamilies || {});
  addISOMacrolanguageData(languageDictionary, macroLangs || []);
  addISORetirementsToLanguages(languageDictionary, isoRetirements || []);
  addGlottologLanguages(languageDictionary, glottologImport || [], glottocodeToISO || {});
  applyCombinedFamilyOverrides(languageDictionary, combinedFamilyOverrides || []);
  addCLDRLanguageDetails(languageDictionary);
  addMacrolanguageStandards(languageDictionary, macroStandards);
  addIANAVariantLocales(languageDictionary, locales, variants);

  connectEntitiesAndCreateDerivedData(
    languageDictionary,
    territories,
    writingSystems,
    orthographies,
    locales,
    variants,
    keyboards,
    organizations,
    technologies,
  );

  return {
    languages: uniqueBy(Object.values(languageDictionary), (lang) => lang.ID),
    ents: {
      // All combined into one big entity map for easy lookup but the ID formats are unique so its OK
      ...languageDictionary, // aa | aaa | aaaa0000
      ...territories, // AA | 000
      ...locales, // aa_Aaaa_AA... etc.
      ...writingSystems, // Aaaa
      ...orthographies, // Prefixed by orth. since their codes match locale IDs (srp_Latn)
      ...variants, // These may be arbitrary, but usually 6-8 alphabetic
      ...keyboards,
      ...organizations, // These should be prefixed by org.
      ...technologies, // These should be prefixed by tech.
    },
  };
}

export function getCoreDataArrays(
  languages: LanguageData[],
  ents: Record<string, EntityData>,
  censuses: Record<CensusID, CensusData>,
): CoreData {
  const ofType = <T extends EntityData>(type: EntityType) =>
    Object.values(ents).filter((e): e is T => e.type === type);
  return {
    languages,
    locales: ofType<LocaleData>(EntityType.Locale),
    territories: ofType<TerritoryData>(EntityType.Territory),
    variants: ofType<VariantData>(EntityType.Variant),
    writingSystems: ofType<WritingSystemData>(EntityType.WritingSystem),
    orthographies: ofType<OrthographyData>(EntityType.Orthography),
    keyboards: ofType<KeyboardData>(EntityType.Keyboard),
    censuses,
    organizations: ofType<OrganizationData>(EntityType.Org),
    technologies: ofType<TechnologyData>(EntityType.Technology),
    ents,
  };
}

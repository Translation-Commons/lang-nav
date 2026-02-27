import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguagesBySource } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantTagData } from '@entities/varianttag/VariantTagTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { connectKeyboards } from '../connect/connectKeyboards';
import { connectLanguagesToParent } from '../connect/connectLanguagesToParent';
import connectLocales from '../connect/connectLocales';
import { connectTerritoriesToParent } from '../connect/connectTerritoriesToParent';
import { connectWritingSystems } from '../connect/connectWritingSystems';
import { createFamilyLocales } from '../connect/createFamilyLocales';
import { createRegionalLocales } from '../connect/createRegionalLocales';
import { connectVariantTags } from '../load/extra_entities/IANAData';

import { computeDescendantPopulation } from './computeDescendantPopulation';
import { searchLocalesForMissingLinks } from './searchLocalesForMissingLinks';

/**
 * During the core data loading process, after all objects have been loaded, this function connects them together.
 *
 * It also creates some additional derived objects, such as family locales and regional locales.
 */
export function connectObjectsAndCreateDerivedData(
  languagesBySource: LanguagesBySource,
  territories: Record<string, TerritoryData>,
  writingSystems: Record<string, WritingSystemData>,
  locales: Record<string, LocaleData>,
  variantTags: Record<string, VariantTagData>,
  keyboards: Record<string, KeyboardData>,
): void {
  connectLanguagesToParent(languagesBySource);
  connectTerritoriesToParent(territories);
  connectWritingSystems(languagesBySource.Combined, territories, writingSystems);
  connectLocales(languagesBySource.Combined, territories, writingSystems, locales);
  connectVariantTags(variantTags, languagesBySource.BCP, locales);
  createFamilyLocales(languagesBySource.Combined, locales); // create them before regional locales
  createRegionalLocales(territories, locales); // create them after connecting them
  searchLocalesForMissingLinks(locales); // try to find missing links after creating new locales
  computeDescendantPopulation(languagesBySource, writingSystems);
  connectKeyboards(keyboards, languagesBySource.Combined, territories, writingSystems, variantTags);
}

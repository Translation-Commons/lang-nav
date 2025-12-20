import { LanguagesBySource } from '@entities/language/LanguageTypes';
import {
  LocaleData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { connectLanguagesToParent } from '../connect/connectLanguagesToParent';
import connectLocales from '../connect/connectLocales';
import { connectTerritoriesToParent } from '../connect/connectTerritoriesToParent';
import { connectWritingSystems } from '../connect/connectWritingSystems';
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
): void {
  connectLanguagesToParent(languagesBySource);
  connectTerritoriesToParent(territories);
  connectWritingSystems(languagesBySource.Combined, territories, writingSystems);
  connectLocales(languagesBySource.Combined, territories, writingSystems, locales);
  connectVariantTags(variantTags, languagesBySource.BCP, locales);
  createRegionalLocales(territories, locales); // create them after connecting them
  searchLocalesForMissingLinks(locales); // try to find missing links after creating new locales
  computeDescendantPopulation(languagesBySource, writingSystems);
}

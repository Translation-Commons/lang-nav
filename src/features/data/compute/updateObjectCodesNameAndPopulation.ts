import { LocaleSeparator } from '@features/params/PageParamTypes';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';
import { getVitalityMetascore } from '@entities/language/vitality/LanguageVitalityComputation';
import { getLocaleCode, getLocaleName } from '@entities/locale/LocaleStrings';
import { LocaleData, TerritoryData } from '@entities/types/DataTypes';

import { computeLocalePopulationFromCensuses } from './computeLocalePopulationFromCensuses';
import { computeRegionalLocalePopulation } from './computeRegionalLocalePopulation';

/**
 * Languages and Locales contain values that stay put but also values that depend on
 * the data source.
 *   codeDisplay: The ID is constant, but the code in the context of a source may differ
 *     eg. ISO: eng, CLDR: en, Glottolog: stan1293
 *   nameDisplay: The canonical name is constant, but the name in the context of a source may differ
 *     eg. ISO: Chinese (macrolanguage), CLDR: Chinese, Glottolog: Sinitic
 *   scope: Some sources may consider the same entity a language or macrolanguage or dialect
 *   parents & descendants: Sources will define genetic relationships differently
 *
 *   population: There are several dependencies here:
 *     1) After we've loaded census data, we may have better estimates for locales
 *     2) After we've aggregated locale data into regional locales, we have new language population estimates from world locales like of "eng_001"
 *     3) Descendant populations may also be a factor in calculating language population estimates.
 *
 * This function recomputes those dependent values based on the current source selections.
 */
export function updateObjectCodesNameAndPopulation(
  languages: LanguageData[],
  locales: LocaleData[],
  world: TerritoryData,
  languageSource: LanguageSource,
  localeSeparator: LocaleSeparator,
): void {
  updatePopulations(locales, world);
  updateParentsAndDescendants(languages, languageSource);
  updateObjectNamesAndCodes(languages, locales, languageSource, localeSeparator);
  updateLanguageVitality(languages);
}

function updatePopulations(locales: LocaleData[], world: TerritoryData): void {
  // Update locale populations based on census data
  computeLocalePopulationFromCensuses(locales);

  // Start with the world territory (001) and then go down to groups
  // This will update regional locales AND the languages themselves
  computeRegionalLocalePopulation(world);
}

// Update parent/child relationships and the population of descendants
// TODO too many things have changed from the above steps, the population of descendants should be recomputed
function updateParentsAndDescendants(
  languages: LanguageData[],
  languageSource: LanguageSource,
): void {
  languages.forEach((lang) => {
    const specific = lang[languageSource];
    lang.populationOfDescendants = specific.populationOfDescendants ?? undefined;
    lang.populationEstimate =
      Math.max(
        lang.populationCited ?? specific.populationOfDescendants ?? 0,
        lang.populationFromLocales ?? 0,
      ) || undefined;
    lang.parentLanguage = specific.parentLanguage ?? undefined;
    lang.childLanguages = specific.childLanguages ?? [];
  });
}

function updateObjectNamesAndCodes(
  languages: LanguageData[],
  locales: LocaleData[],
  languageSource: LanguageSource,
  localeSeparator: LocaleSeparator,
): void {
  // Update language codes and other values used for filtering
  languages.forEach((lang) => {
    const specific = lang[languageSource];
    lang.codeDisplay = specific.code ?? lang.ID;
    lang.nameDisplay = specific.name ?? lang.nameCanonical;
    lang.scope = specific.scope ?? lang.scope;
  });

  // Update locales too, their codes and their names
  locales.forEach((loc) => {
    loc.codeDisplay = getLocaleCode(loc, localeSeparator);
    const localeName = getLocaleName(loc);
    loc.nameDisplay = localeName; // Set the display name

    // Add it to the names array so it can be used in search
    if (!loc.names.includes(localeName)) loc.names.push(localeName);
  });
}

/**
 * Language vitality depends on the family relationships between languages.
 * When those relationships change, we need to clear the cached vitality values
 * so they can be recomputed.
 */
function updateLanguageVitality(languages: LanguageData[]): void {
  languages.forEach((lang) => {
    // Force recomputation of family vitality by clearing cached value
    lang.vitalityMetascore = getVitalityMetascore(lang);
  });
}

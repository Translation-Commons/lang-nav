import { LocaleSeparator } from '@features/params/PageParamTypes';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';
import { precomputeLanguageVitality } from '@entities/language/vitality/LanguageVitalityComputation';
import { getLocaleCode, getLocaleName } from '@entities/locale/LocaleStrings';
import { LocaleData, PopulationSourceCategory, TerritoryData } from '@entities/types/DataTypes';

import { sumBy } from '@shared/lib/setUtils';

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
  updateParentsAndDescendants(languages, languageSource);
  updatePopulations(languages, locales, world);
  updateObjectNamesAndCodes(languages, locales, languageSource, localeSeparator);
  precomputeLanguageVitality(languages);
}

// Update parent/child relationships
function updateParentsAndDescendants(
  languages: LanguageData[],
  languageSource: LanguageSource,
): void {
  languages.forEach((lang) => {
    const specific = lang[languageSource];
    lang.parentLanguage = specific.parentLanguage ?? undefined;
    lang.childLanguages = specific.childLanguages ?? [];
  });
}

function updatePopulations(
  languages: LanguageData[],
  locales: LocaleData[],
  world: TerritoryData,
): void {
  computeLocalePopulationFromCensuses(locales);

  // Start with the world territory (001) and then go down to groups
  // This will update regional locales AND the languages themselves
  computeRegionalLocalePopulation(world);

  // Update languages with either descendant or locale populations (or cited pops if that data is trusted better)
  computeLanguagePopulations(languages);
}

function computeLanguagePopulations(languages: LanguageData[]): void {
  // For all root languages
  languages
    .filter((lang) => !lang.parentLanguage)
    .forEach((rootLang) => {
      getLanguagePopulationFollowingDescendents(rootLang);
    });

  discountPopulationEstimatesIfSimilarToParent(languages);
}

function getLanguagePopulationFollowingDescendents(lang: LanguageData): number {
  // Recompute the population of descendants first
  const descendantPopulation = sumBy(
    lang.childLanguages,
    (childLang) => getLanguagePopulationFollowingDescendents(childLang) || 0.01, // Using 0.01 as a tiebreaker
  );
  lang.populationOfDescendants = descendantPopulation > 0 ? descendantPopulation : undefined;

  // Then follow the algorithm to find the best population estimate, which may come from descendants,
  // but also from locales or cited data
  computeLanguagePopulationEstimates(lang);

  return lang.populationEstimate ?? 0;
}

function computeLanguagePopulationEstimates(lang: LanguageData): void {
  // The best source would come from the censuses
  // Locale data usually comes from censuses, or language family locales are bounded by country size
  if (lang.populationFromLocales != null) {
    lang.populationEstimate = lang.populationFromLocales;
    lang.populationEstimateSource = PopulationSourceCategory.AggregatedFromTerritories;
  } else if (lang.populationRough /* if its defined and not zero */) {
    // Otherwise, use the population from the languages.tsv file
    // They are often rough estimates, from a mixture of sources (and are missing citations)
    lang.populationEstimate = lang.populationRough;
    lang.populationEstimateSource = PopulationSourceCategory.Other;
  } else if (lang.populationOfDescendants != null) {
    // Lastly, check the population from descendants. This is useful for language families
    // that are missing locale data.
    lang.populationEstimate = lang.populationOfDescendants;
    lang.populationEstimateSource = PopulationSourceCategory.AggregatedFromLanguages;
  } else {
    lang.populationEstimate = undefined;
    lang.populationEstimateSource = undefined;
  }
}

function discountPopulationEstimatesIfSimilarToParent(languages: LanguageData[]): void {
  // Discount populations if the population is greater than or same of its parent
  languages.forEach((lang) => {
    const parent = lang.parentLanguage;
    if (parent && lang.populationEstimate != null && parent.populationEstimate != null) {
      if (lang.populationEstimateSource === PopulationSourceCategory.AggregatedFromTerritories)
        return; // Do not adjust if from locale data
      if (lang.populationEstimate >= parent.populationEstimate) {
        lang.populationEstimate = parent.populationEstimate - 0.01;
        lang.populationEstimateSource = PopulationSourceCategory.Algorithmic;
      }
    }
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

import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

import {
  computeLanguageFamilyLocalePopulations,
  computeRegionalLocalesPopulation,
} from './computeAggregatedLocalesPopulation';
import { computeLocalesPopulationFromCensuses } from './computeLocalesPopulationFromCensuses';

export function updatePopulations(
  languages: LanguageData[],
  locales: LocaleData[],
  world: TerritoryData,
): void {
  computeLocalesPopulationFromCensuses(locales);

  // Start with the world territory (001) and then go down to groups
  // This will update regional locales AND the languages themselves
  computeRegionalLocalesPopulation(world);

  computeLanguageFamilyLocalePopulations(locales);

  updateLanguagesPopulationFromLocale(world);

  computeLanguagesPopulations(languages);

  discountPopulationEstimatesIfSimilarToParent(languages);
}

function computeLanguagesPopulations(languages: LanguageData[]): void {
  // Recurse to children, starting from root languages
  languages
    .filter((lang) => !lang.parentLanguage)
    .forEach((rootLang) => {
      getLanguagePopulationFollowingDescendants(rootLang);
    });
}

function getLanguagePopulationFollowingDescendants(lang: LanguageData, depth = 0): number {
  if (depth > 40) console.debug('Potential infinite recursion for: ', lang.ID, 'depth: ', depth);
  if (depth > 50) return 0;
  // Recompute the population of descendants first
  const descendantPopulation = sumBy(
    lang.childLanguages,
    (childLang) => getLanguagePopulationFollowingDescendants(childLang, depth + 1) || 0.01, // Using 0.01 as a tiebreaker
  );
  lang.populationOfDescendants = descendantPopulation > 0 ? descendantPopulation : undefined;

  // Then follow the algorithm to find the best population estimate, which may come from descendants,
  // but also from locales or cited data
  computeLanguagePopulationEstimate(lang);

  return lang.populationEstimate ?? 0;
}

function computeLanguagePopulationEstimate(lang: LanguageData): void {
  // The best source would come from the censuses
  // Locale data usually comes from censuses, or language family locales are bounded by country size
  if (
    lang.populationFromLocales != null &&
    // If the population from locales is very small but Ethnologue is much bigger, then it is
    // better to use the Ethnologue number until we have better locale census data.
    !(lang.populationFromLocales < 10)
  ) {
    lang.populationEstimate = lang.populationFromLocales;
    lang.populationEstimateSource = PopulationSourceCategory.AggregatedFromTerritories;
  } else if (lang.Ethnologue.population != null) {
    // Next we will take the rounded population from Ethnologue
    lang.populationEstimate = lang.Ethnologue.population;
    lang.populationEstimateSource = PopulationSourceCategory.Ethnologue;
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

// Take the value for the world languages (eg. eng_001) and if higher than the current estimate,
//  update the language population estimates.
export function updateLanguagesPopulationFromLocale(territory: TerritoryData): void {
  uniqueBy(territory?.locales?.sort(sortByPopulation) ?? [], (l) => l.languageCode).forEach(
    (locale) => {
      const language = locale.language;
      if (language == null || locale.populationAdjusted == null) return;
      language.populationFromLocales = locale.populationAdjusted;
    },
  );
}

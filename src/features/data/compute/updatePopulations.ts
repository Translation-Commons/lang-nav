import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import getLanguageModalityDiscount from '@entities/language/population/getLanguageModalityDiscount';
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

  // First compute language family populations for locales
  computeLanguageFamilyLocalePopulations(locales);

  // Then compute regional locale populations
  // Start with the world territory (001) and then go down to groups
  // This will update regional locales AND the languages themselves
  computeRegionalLocalesPopulation(world);

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

// Returns a tuple of [speakingPopulation, writingPopulation]
function getLanguagePopulationFollowingDescendants(
  lang: LanguageData,
  depth = 0,
): [number, number] {
  if (depth > 40) console.debug('Potential infinite recursion for: ', lang.ID, 'depth: ', depth);
  if (depth > 50) return [0, 0];
  // Recompute the population of descendants first
  const descendantPops = lang.childLanguages.map(
    (childLang) => getLanguagePopulationFollowingDescendants(childLang, depth + 1) || [0.01, 0.01], // Using 0.01 as a tiebreaker
  );

  const descendantSpeakers = sumBy(descendantPops, (pop) => pop[0]);
  lang.pop.speaking.descendants = descendantSpeakers ? descendantSpeakers : undefined;
  const descendantWriters = sumBy(descendantPops, (pop) => pop[1]);
  lang.pop.writing.descendants = descendantWriters ? descendantWriters : undefined;

  // Then follow the algorithm to find the best population estimate, which may come from descendants,
  // but also from locales or cited data
  computeLanguagePopulationEstimate(lang, 'speaking');
  computeLanguagePopulationEstimate(lang, 'writing');
  lang.pop.overall =
    Math.max(lang.pop.speaking.estimate ?? 0, lang.pop.writing.estimate ?? 0) || undefined;

  return [lang.pop.speaking.estimate ?? 0, lang.pop.writing.estimate ?? 0];
}

function computeLanguagePopulationEstimate(lang: LanguageData, use: 'speaking' | 'writing'): void {
  const pop = lang.pop[use];
  // The best source would come from the censuses
  // Locale data usually comes from censuses, or language family locales are bounded by country size
  if (pop.fromLocales != null && pop.fromLocales > 0) {
    pop.estimate = pop.fromLocales;
    pop.source = PopulationSourceCategory.AggregatedFromTerritories;
  } else if (lang.pop.rough /* if its defined and not zero */) {
    // Otherwise, use the population from the languages.tsv file
    // They are often rough estimates, from a mixture of sources (and are missing citations)
    pop.estimate = lang.pop.rough * getLanguageModalityDiscount(lang.modality, use);
    pop.source = PopulationSourceCategory.Other;
  } else if (pop.descendants != null) {
    // Lastly, check the population from descendants. This is useful for language families
    // that are missing locale data.
    pop.estimate = pop.descendants;
    pop.source = PopulationSourceCategory.AggregatedFromLanguages;
  } else {
    pop.estimate = undefined;
    pop.source = undefined;
  }
}

// Discount populations if the population is greater than or same of its parent
function discountPopulationEstimatesIfSimilarToParent(languages: LanguageData[]): void {
  languages
    .filter((lang) => lang.parentLanguage == null)
    .forEach(discountPopulationEstimatesIfSimilarToParentRecursive);
}

function discountPopulationEstimatesIfSimilarToParentRecursive(
  lang: LanguageData,
  depth: number = 0,
): void {
  const parent = lang.parentLanguage;
  if (parent && lang.pop.overall != null && parent.pop.overall != null) {
    // Discount population if the population is greater than or same of its parent
    ['speaking', 'writing'].forEach((use) => {
      const pop = lang.pop[use as 'speaking' | 'writing'];
      const parentPop = parent.pop[use as 'speaking' | 'writing'];
      if (pop.estimate == null || parentPop.estimate == null) return;
      if (
        pop.source !== PopulationSourceCategory.AggregatedFromTerritories &&
        pop.estimate >= parentPop.estimate
      ) {
        pop.estimate = parentPop.estimate - 0.01; // Subtract a small amount to avoid ties
        pop.source = PopulationSourceCategory.Algorithmic;
      }
    });
    lang.pop.overall =
      Math.max(lang.pop.speaking.estimate ?? 0, lang.pop.writing.estimate ?? 0) || undefined;
  }

  // Now investigate contained langauges
  lang.childLanguages.forEach((child) =>
    discountPopulationEstimatesIfSimilarToParentRecursive(child, depth + 1),
  );
}

// Take the value for the world languages (eg. eng_001) and if higher than the current estimate,
//  update the language population estimates.
export function updateLanguagesPopulationFromLocale(territory: TerritoryData): void {
  uniqueBy([...(territory?.locales ?? [])].sort(sortByPopulation), (l) => l.languageCode).forEach(
    (locale) => {
      const language = locale.language;
      if (language == null) return;
      language.pop.speaking.fromLocales = locale.pop.speaking.adjusted;
      language.pop.writing.fromLocales = locale.pop.writing.adjusted;
    },
  );
}

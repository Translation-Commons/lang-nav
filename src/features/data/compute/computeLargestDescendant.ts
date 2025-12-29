import { LanguageData } from '@entities/language/LanguageTypes';

export function computeLargestDescendant(languages: LanguageData[]): void {
  // Clear the largest descendants first since it may change a lot if the schema changes.
  languages.forEach((lang) => {
    lang.largestDescendant = undefined;
  });

  // Compute the largest descendants for each language
  languages.forEach((lang) => {
    lang.largestDescendant = getLargestDescendant(lang);
  });
}

function getLargestDescendant(language: LanguageData): LanguageData | undefined {
  // If it has already been computed, return it.
  if (language.largestDescendant !== undefined) {
    return language.largestDescendant;
  }
  if (language.childLanguages.length === 0) {
    return undefined;
  }

  // We are using populationRough because we want to only use descendants that have a directly
  // sourced population (aka no language families). Dialects rarely but sometimes have directly
  // sourced populations.
  return language.childLanguages.reduce<LanguageData | undefined>((largest, child) => {
    const childsLargest = getLargestDescendant(child);
    const candidateLargest =
      (childsLargest?.populationRough || 0) > (child.populationRough || 0) ? childsLargest : child;
    if (
      candidateLargest != null &&
      candidateLargest.populationRough != null &&
      candidateLargest.populationRough > 0 &&
      (largest == null || candidateLargest.populationRough > (largest?.populationRough || 0))
    ) {
      return candidateLargest;
    }
    return largest;
  }, undefined);
}

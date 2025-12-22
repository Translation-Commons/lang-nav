import { LanguageData, LanguagesBySource } from '@entities/language/LanguageTypes';

export function computeLargestDescendants(languagesBySource: LanguagesBySource): void {
  const languages = Object.values(languagesBySource.Combined);

  // Clear first in case schema changes affect descendants.
  languages.forEach((lang) => {
    lang.largestDescendant = undefined;
  });

  // Compute the largest descendant for each language using Combined lineage.
  languages.forEach((lang) => {
    lang.largestDescendant = getLargestDescendant(lang);
  });
}

function getLargestDescendant(language: LanguageData): LanguageData | undefined {
  // If already computed, return memorized value.
  if (language.largestDescendant !== undefined) {
    return language.largestDescendant;
  }

  const children = language.Combined.childLanguages ?? [];
  if (children.length === 0) {
    return undefined;
  }

  // We are using populationRough because we want to only use descendants that have a directly
  // sourced population (aka no language families). Dialects rarely but sometimes have directly
  // sourced populations.
  return children.reduce<LanguageData | undefined>((largest, child) => {
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

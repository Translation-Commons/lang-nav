import { LanguageData, LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';

export function computeLargestDescendant(
  languages: LanguageData[],
  languageSource: LanguageSource,
): void {
  // Clear the largest descendants first since it may change a lot if the schema changes.
  languages.forEach((lang) => {
    lang.largestDescendant = undefined;
  });

  // Compute the largest descendants for each language
  languages.forEach((lang) => {
    const visiting = new Set<string>();
    lang.largestDescendant = getLargestDescendant(lang, languageSource, visiting);
  });
}

function getLargestDescendant(
  language: LanguageData,
  languageSource: LanguageSource,
  visiting: Set<string>,
): LanguageData | undefined {
  // If it has already been computed, return it.
  if (language.largestDescendant !== undefined) {
    return language.largestDescendant;
  }

  // Detect cycles: if we're already visiting this language in the current path, return undefined
  if (visiting.has(language.ID)) {
    return undefined;
  }

  const children = language[languageSource].childLanguages ?? [];
  if (children.length === 0) {
    return undefined;
  }

  // Add current language to visiting set
  visiting.add(language.ID);

  // Skip language families and use populationEstimate
  const result = children.reduce<LanguageData | undefined>((largest, child) => {
    const childsLargest = getLargestDescendant(child, languageSource, visiting);

    // Skip language families and only consider languages with population
    const isChildValid =
      child.scope !== LanguageScope.Family && (child.populationEstimate || 0) > 0;
    const isChildsLargestValid =
      childsLargest?.scope !== LanguageScope.Family && (childsLargest?.populationEstimate || 0) > 0;

    // Pick the better candidate: prefer the one with larger population
    let candidateLargest: LanguageData | undefined;
    if (isChildsLargestValid && isChildValid) {
      candidateLargest =
        (childsLargest?.populationEstimate || 0) > (child.populationEstimate || 0)
          ? childsLargest
          : child;
    } else if (isChildsLargestValid) {
      candidateLargest = childsLargest;
    } else if (isChildValid) {
      candidateLargest = child;
    }

    // Update largest if we found a better candidate
    if (
      candidateLargest &&
      (largest == null ||
        (candidateLargest.populationEstimate || 0) > (largest.populationEstimate || 0))
    ) {
      return candidateLargest;
    }
    return largest;
  }, undefined);

  // Remove current language from visiting set before returning
  visiting.delete(language.ID);

  return result;
}

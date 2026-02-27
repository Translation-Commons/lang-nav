import { LanguageData, LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';

const RECURSION_LIMIT = 30;

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
    lang.largestDescendant = getLargestDescendant(lang, languageSource, 0);
  });
}

function getLargestDescendant(
  language: LanguageData,
  languageSource: LanguageSource,
  depth: number,
): LanguageData | undefined {
  // If it has already been computed, return it.
  if (language.largestDescendant !== undefined) {
    return language.largestDescendant;
  }

  // Stop if recursion limit is reached
  if (depth >= RECURSION_LIMIT) {
    return undefined;
  }

  const children = language[languageSource].childLanguages ?? [];
  if (children.length === 0) {
    return undefined;
  }

  // Skip language families and use populationEstimate
  const result = children.reduce<LanguageData | undefined>((largest, child) => {
    const childsLargest = getLargestDescendant(child, languageSource, depth + 1);

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

  return result;
}

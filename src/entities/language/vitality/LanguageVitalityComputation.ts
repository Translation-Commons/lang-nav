import { LanguageData } from '@entities/language/LanguageTypes';

import { maxBy } from '@shared/lib/setUtils';

import { VitalitySource } from './VitalityTypes';

/**
 * Computes the vitality metascore for a language using the algorithm:
 * 1. If both Ethnologue 2013 & 2025 values exist, return the average
 * 2. If only one Ethnologue value exists, return that
 * 3. If neither Ethnologue value exists, use ISO scale
 */
export function getVitalityMetascore(lang: LanguageData): number | undefined {
  const { ethFine, ethCoarse, iso } = lang.vitality || {};

  if (ethFine != null && ethCoarse != null) {
    // Both Ethnologue values exist - return average
    return (ethFine + ethCoarse) / 2;
  } else if (ethFine != null) {
    // Only Ethnologue 2013 exists
    return ethFine;
  } else if (ethCoarse != null) {
    // Only Ethnologue 2025 exists
    return ethCoarse;
  } else if (iso != null) {
    // Use ISO as fallback
    return iso;
  }
  return undefined;
}

export function getVitalityScore(source: VitalitySource, lang: LanguageData): number | undefined {
  switch (source) {
    case VitalitySource.ISO:
      return lang.vitality?.iso;
    case VitalitySource.Eth2013:
      return lang.vitality?.ethFine;
    case VitalitySource.Eth2025:
      return lang.vitality?.ethCoarse;
    case VitalitySource.Metascore:
      return lang.vitality?.meta;
  }
}

/**
 * Compute derived vitality data for all languages, filling in gaps when it doesn't come
 * directly from a source. For example, Ethnologue doesn't provide vitality for language families
 * or macrolanguages.
 *
 * Re-run this when changing language parent/child relationships since language families may have
 * different compositions.
 */
export function precomputeLanguageVitality(languages: LanguageData[]): void {
  // For all language roots, recompute vitality scores
  languages.filter((lang) => lang.parentLanguage == null).forEach(computeLanguageFamilyVitality);
}

function computeLanguageFamilyVitality(lang: LanguageData): void {
  // Recursively compute vitality for all descendants first
  const descendants = lang.childLanguages || [];
  descendants.forEach((child) => computeLanguageFamilyVitality(child));

  // Now compute vitality for this language
  const vitality = lang.vitality || {};
  const { ethnologue2013, ethnologue2025 } = vitality;

  // If it's declared by a source use that, otherwise use its children's max vitality
  if (lang.ISO.status != null) {
    vitality.iso = lang.ISO.status;
  } else {
    vitality.iso = maxBy(descendants, (child) => child.vitality?.iso);
  }
  if (ethnologue2013 != null) {
    vitality.ethFine = ethnologue2013;
  } else {
    vitality.ethFine = maxBy(descendants, (child) => child.vitality?.ethFine);
  }
  if (ethnologue2025 != null) {
    vitality.ethCoarse = ethnologue2025;
  } else {
    vitality.ethCoarse = maxBy(descendants, (child) => child.vitality?.ethCoarse);
  }

  // Compute the meta score and store the results in the language object
  vitality.meta = getVitalityMetascore(lang);
  lang.vitality = vitality;
}

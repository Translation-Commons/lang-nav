import { LanguageData } from '@entities/language/LanguageTypes';

import { VitalitySource } from './VitalityTypes';

/**
 * Computes the vitality metascore for a language using the algorithm:
 * 1. If both Ethnologue Fine & Coarse values exist, return the average
 * 2. If only one Ethnologue value exists, return that
 * 3. If neither Ethnologue value exists, use ISO scale
 */
export function getVitalityMetascore(lang: LanguageData): number | undefined {
  const { ethFine, ethCoarse, iso } = lang.vitality || {};

  if (ethFine != null && ethCoarse != null) {
    // Both Ethnologue values exist - return average
    return (ethFine + ethCoarse) / 2;
  } else if (ethFine != null) {
    // Only Ethnologue Fine exists
    return ethFine;
  } else if (ethCoarse != null) {
    // Only Ethnologue Coarse exists
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
    case VitalitySource.Eth2012:
      return lang.vitality?.ethFine;
    case VitalitySource.Eth2025:
      return lang.vitality?.ethCoarse;
    case VitalitySource.Metascore:
      return lang.vitality?.meta;
  }
}

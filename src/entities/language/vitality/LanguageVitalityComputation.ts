import type { LanguageData } from '../LanguageTypes';

import { VitalitySource } from './VitalityTypes';

/**
 * Computes the vitality metascore for a language.
 *
 * This functionality used to be more interesting but it has been significantly scaled back because
 * of lack of other usable data sources.
 */
export function getVitalityMetascore(lang: LanguageData): number | undefined {
  const { iso, glottolog } = lang.vitality || {};

  if (glottolog != null && iso != null) return glottolog + iso / 2;
  if (glottolog != null) return glottolog;
  if (iso != null) return iso;
  return undefined;
}

export function getVitalityScore(source: VitalitySource, lang: LanguageData): number | undefined {
  switch (source) {
    case VitalitySource.Glottolog:
      return lang.vitality?.glottolog;
    case VitalitySource.ISO:
      return lang.vitality?.iso;
    case VitalitySource.Metascore:
      return lang.vitality?.meta;
  }
}

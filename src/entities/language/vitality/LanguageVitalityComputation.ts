import { sumBy } from '@shared/lib/setUtils';

import type { LanguageData } from '../LanguageTypes';

import { VitalitySource } from './VitalityTypes';

/**
 * Computes the vitality metascore for a language.
 *
 * This functionality used to be more interesting but it has been significantly scaled back because
 * of lack of other usable data sources.
 */
export function getVitalityMetascore(lang: LanguageData): number | undefined {
  const { iso, unesco, glottolog } = lang.vitality || {};
  const estimates = [iso, unesco, glottolog].filter((v) => v != null);
  if (estimates.length === 0) return undefined;
  return sumBy(estimates, (v) => v) / estimates.length;
}

export function getVitalityScore(source: VitalitySource, lang: LanguageData): number | undefined {
  switch (source) {
    case VitalitySource.UNESCO:
      return lang.vitality?.unesco;
    case VitalitySource.ISO:
      return lang.vitality?.iso;
    case VitalitySource.Glottolog:
      return lang.vitality?.glottolog;
    case VitalitySource.Metascore:
      return lang.vitality?.meta;
  }
}

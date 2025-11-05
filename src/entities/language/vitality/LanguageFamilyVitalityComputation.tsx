import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { getAllVitalityScores } from './LanguageVitalityComputation';
import {
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineLabel,
  getVitalityISOLabel,
} from './VitalityStrings';
import {
  AllVitalityInfo,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  VitalityInfo,
  VitalityISO,
  VitalitySource,
} from './VitalityTypes';

// Cache for family vitality scores to avoid recomputation during sorting
const familyVitalityCache = new Map<LanguageData, AllVitalityInfo>();

// Cache for flattened descendants to avoid repeated tree traversal
const descendantsCache = new Map<LanguageData, LanguageData[]>();

/**
 * Map a numeric score to the nearest ISO vitality enum value
 */
function mapScoreToISO(score: number): VitalityISO | undefined {
  if (score >= 6) return VitalityISO.Living; // midpoint between 9 and 3 is 6
  if (score >= 2) return VitalityISO.Constructed; // midpoint between 3 and 1 is 2
  if (score >= 0.5) return VitalityISO.Historical; // midpoint between 1 and 0 is 0.5
  if (score >= 0) return VitalityISO.Extinct; // 0
  return undefined;
}

/**
 * Map a numeric score to the nearest Ethnologue Fine (2013) enum value
 */
function mapScoreToEthnologueFine(score: number): VitalityEthnologueFine | undefined {
  const rounded = Math.round(score);
  if (rounded >= 9) return VitalityEthnologueFine.National; // 9
  if (rounded >= 8) return VitalityEthnologueFine.Regional; // 8
  if (rounded >= 7) return VitalityEthnologueFine.Trade; // 7
  if (rounded >= 6) return VitalityEthnologueFine.Educational; // 6
  if (rounded >= 5) return VitalityEthnologueFine.Developing; // 5
  if (rounded >= 4) return VitalityEthnologueFine.Threatened; // 4
  if (rounded >= 3) return VitalityEthnologueFine.Shifting; // 3
  if (rounded >= 2) return VitalityEthnologueFine.Moribund; // 2
  if (rounded >= 1) return VitalityEthnologueFine.Dormant; // 1
  if (rounded >= 0) return VitalityEthnologueFine.Extinct; // 0
  return undefined;
}

/**
 * Map a numeric score to the nearest Ethnologue Coarse (2025) enum value
 */
function mapScoreToEthnologueCoarse(score: number): VitalityEthnologueCoarse | undefined {
  if (score >= 7.5) return VitalityEthnologueCoarse.Institutional; // 9
  if (score >= 4.5) return VitalityEthnologueCoarse.Stable; // 6
  if (score >= 1.5) return VitalityEthnologueCoarse.Endangered; // 3
  if (score >= 0) return VitalityEthnologueCoarse.Extinct; // 0
  return undefined;
}

/**
 * Build label and detailed explanation for a family vitality score by source.
 */
function getFamilyVitalityLabelAndExplanation(
  src: VitalitySource,
  score: number,
): { label: string; explanation: React.ReactNode } {
  switch (src) {
    case VitalitySource.ISO: {
      const label = getVitalityISOLabel(mapScoreToISO(score));
      return {
        label,
        explanation: (
          <>
            Population-weighted average of descendant ISO vitality scores.
            <br />
            ISO Vitality: {label}
            <br />
            Average: {score.toFixed(1)} out of 9.0.
          </>
        ),
      };
    }
    case VitalitySource.Eth2013: {
      const label = getVitalityEthnologueFineLabel(mapScoreToEthnologueFine(score));
      return {
        label,
        explanation: (
          <>
            Population-weighted average of descendant Ethnologue 2013 vitality scores.
            <br />
            Ethnologue 2013 Vitality: {label}
            <br />
            Average: {score.toFixed(1)} out of 9.0.
          </>
        ),
      };
    }
    case VitalitySource.Eth2025: {
      const label = getVitalityEthnologueCoarseLabel(mapScoreToEthnologueCoarse(score));
      return {
        label,
        explanation: (
          <>
            Population-weighted average of descendant Ethnologue 2025 vitality scores.
            <br />
            Ethnologue 2025 Vitality: {label}
            <br />
            Average: {score.toFixed(1)} out of 9.0.
          </>
        ),
      };
    }
    case VitalitySource.Metascore:
    default: {
      const label = score.toFixed(1);
      return {
        label,
        explanation: (
          <>
            Population-weighted average of descendant Metascore vitality scores.
            <br />
            Average: {label} out of 9.0.
          </>
        ),
      };
    }
  }
}

/**
 * Clear the cache for all families.
 */
export function clearFamilyVitalityCache(): void {
  familyVitalityCache.clear();
  descendantsCache.clear();
}

/** Recursively collect descendant languages. */
function flattenDescendants(lang: LanguageData): LanguageData[] {
  // Check cache first
  const cached = descendantsCache.get(lang);
  if (cached !== undefined) {
    return cached;
  }

  const result: LanguageData[] = [];
  for (const child of lang.childLanguages ?? []) {
    if (!child) continue;
    if (child.scope === LanguageScope.Language) {
      result.push(child);
    }
    // Recurse further to gather all nested descendants
    if (child.childLanguages?.length) {
      result.push(...flattenDescendants(child));
    }
  }

  // Cache the result
  descendantsCache.set(lang, result);
  return result;
}

/**
 * Compute vitality for a family across all sources (ISO, Ethnologue, Metascore).
 * Returns an AllVitalityInfo object — same structure as individual languages.
 *
 * Results are memoized using Map to avoid recomputation during sorting.
 * Cache is automatically cleared when family relationships are updated via clearFamilyVitalityCache().
 */
export function getFamilyVitalityScores(family: LanguageData): AllVitalityInfo {
  // Check cache first
  const cached = familyVitalityCache.get(family);
  if (cached !== undefined) {
    return cached;
  }
  const empty: AllVitalityInfo = {
    [VitalitySource.ISO]: { score: undefined, label: undefined, explanation: undefined },
    [VitalitySource.Eth2013]: { score: undefined, label: undefined, explanation: undefined },
    [VitalitySource.Eth2025]: { score: undefined, label: undefined, explanation: undefined },
    [VitalitySource.Metascore]: { score: undefined, label: undefined, explanation: undefined },
  };

  if (family.scope !== LanguageScope.Family) {
    return empty;
  }

  const descendants = flattenDescendants(family);
  const accumulators: Record<VitalitySource, { num: number; den: number }> = {
    [VitalitySource.ISO]: { num: 0, den: 0 },
    [VitalitySource.Eth2013]: { num: 0, den: 0 },
    [VitalitySource.Eth2025]: { num: 0, den: 0 },
    [VitalitySource.Metascore]: { num: 0, den: 0 },
  };

  // Aggregate vitality scores across all descendants
  for (const lang of descendants) {
    const allScores = getAllVitalityScores(lang);
    const weight = lang.populationEstimate ?? 1;

    for (const src of Object.values(VitalitySource)) {
      const score = allScores[src]?.score;
      if (score != null) {
        accumulators[src].num += weight * score;
        accumulators[src].den += weight;
      }
    }
  }

  // Compute weighted means and return consistent VitalityInfo objects
  const results: AllVitalityInfo = {} as AllVitalityInfo;
  for (const src of Object.values(VitalitySource)) {
    const { num, den } = accumulators[src];
    const score = den > 0 ? num / den : undefined;

    let label: string | undefined;
    let explanation: React.ReactNode | undefined;

    if (score != null) {
      const res = getFamilyVitalityLabelAndExplanation(src, score);
      label = res.label;
      explanation = res.explanation;
    }

    results[src] = {
      score,
      label: label ?? '—',
      explanation: den > 0 ? explanation : 'No vitality data available for descendants.',
    } satisfies VitalityInfo;
  }

  // Cache the result before returning
  familyVitalityCache.set(family, results);
  return results;
}

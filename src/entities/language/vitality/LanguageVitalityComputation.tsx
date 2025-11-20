import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import {
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineLabel,
  getLanguageISOStatusLabel,
} from './VitalityStrings';
import { AllVitalityInfo, VitalityInfo, VitalitySource } from './VitalityTypes';

/**
 * Computes the vitality metascore for a language using the algorithm:
 * 1. If both Ethnologue 2013 & 2025 values exist, return the average
 * 2. If only one Ethnologue value exists, return that
 * 3. If neither Ethnologue value exists, use ISO scale
 */
export function getVitalityMetascore(lang: LanguageData): number | undefined {
  const { vitalityEth2013, vitalityEth2025, ISO } = lang;

  if (vitalityEth2013 != null && vitalityEth2025 != null) {
    // Both Ethnologue values exist - return average
    return (vitalityEth2013 + vitalityEth2025) / 2;
  } else if (vitalityEth2013 != null) {
    // Only Ethnologue 2013 exists
    return vitalityEth2013;
  } else if (vitalityEth2025 != null) {
    // Only Ethnologue 2025 exists
    return vitalityEth2025;
  } else if (ISO.status != null) {
    // Use ISO as fallback
    return ISO.status;
  }
  return undefined;
}

export function getVitalityScore(source: VitalitySource, lang: LanguageData): number | undefined {
  switch (source) {
    case VitalitySource.ISO:
      return lang.ISO.status;
    case VitalitySource.Eth2013:
      return lang.vitalityEth2013;
    case VitalitySource.Eth2025:
      return lang.vitalityEth2025;
    case VitalitySource.Metascore:
      return getVitalityMetascore(lang);
  }
}

/**
 * Generates ReactNode explanations for vitality scores
 */
export function getVitalityExplanation(
  source: VitalitySource,
  lang: LanguageData,
): React.ReactNode {
  const { ISO, vitalityEth2013, vitalityEth2025 } = lang;

  switch (source) {
    case VitalitySource.ISO:
      if (ISO.status == null) return <Deemphasized>No ISO status available</Deemphasized>;
      return (
        <div>
          <div>ISO Status: {getLanguageISOStatusLabel(ISO.status)}</div>
          <div>Normalized to a score of {ISO.status} out of 9.</div>
        </div>
      );

    case VitalitySource.Eth2013:
      if (vitalityEth2013 == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>
            Ethnologue 2013 Vitality: {getVitalityEthnologueFineLabel(vitalityEth2013)}
            <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
              methodology
            </LinkButton>
          </div>
          <div>Normalized to a score of {vitalityEth2013} out of 9.</div>
        </div>
      );

    case VitalitySource.Eth2025:
      if (vitalityEth2025 == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>Ethnologue 2025 Vitality: {getVitalityEthnologueCoarseLabel(vitalityEth2025)}</div>
          <div>Normalized to a score of {vitalityEth2025} out of 9.</div>
        </div>
      );

    case VitalitySource.Metascore: {
      if (vitalityEth2013 != null && vitalityEth2025 != null) {
        // Both Ethnologue values exist - return average
        const average = (vitalityEth2013 * 1 + vitalityEth2025 * 1) / 2;
        return (
          <div>
            <div>
              Ethnologue changed the methodology of its vitality scores. So we convert them to a
              normalized score and averaged the data from 2013 and 2025. Average:{' '}
              {average.toFixed(1)}.
            </div>
            <div style={{ marginLeft: '2em' }}>
              2013: {getVitalityEthnologueFineLabel(vitalityEth2013)} ({vitalityEth2013}){' '}
              <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
                methodology
              </LinkButton>
            </div>
            <div style={{ marginLeft: '2em' }}>
              2025: {getVitalityEthnologueCoarseLabel(vitalityEth2025)} ({vitalityEth2025})
            </div>
          </div>
        );
      }
    }
  }
  return (
    <Deemphasized>Vitality data not available from this source for this language</Deemphasized>
  );
}

export function computeVitalityMetascoreInfo(lang: LanguageData): VitalityInfo {
  const { vitalityEth2013, vitalityEth2025, ISO } = lang;

  if (vitalityEth2013 != null && vitalityEth2025 != null) {
    // Both Ethnologue values exist - return average
    return {
      score: (vitalityEth2013 + vitalityEth2025) / 2,
      label: ((vitalityEth2013 + vitalityEth2025) / 2).toFixed(1),
      explanation: getVitalityExplanation(VitalitySource.Metascore, lang),
    };
  } else if (vitalityEth2013 != null || vitalityEth2025 != null) {
    const info =
      vitalityEth2013 != null
        ? getVitalityInfo(VitalitySource.Eth2013, lang)
        : getVitalityInfo(VitalitySource.Eth2025, lang);
    return {
      score: info.score,
      label: info.label,
      explanation: (
        <>
          Ethnologue only has 1 value for this language:
          <br />
          {info.explanation}
        </>
      ),
    };
  } else if (ISO.status != null) {
    const info = getVitalityInfo(VitalitySource.ISO, lang);
    return {
      score: info.score,
      label: info.label,
      explanation: (
        <>
          No data from Ethnologue, so we&apos;re just using the ISO status value:
          <br />
          {info.explanation}
        </>
      ),
    };
  }

  return {
    score: undefined,
    label: '—',
    explanation: <Deemphasized>No vitality data available</Deemphasized>,
  };
}

/**
 * Gets all available vitality scores for a language
 */
export function getVitalityInfo(source: VitalitySource, lang: LanguageData): VitalityInfo {
  switch (source) {
    case VitalitySource.ISO:
      return {
        score: lang.ISO.status,
        label: getLanguageISOStatusLabel(lang.ISO.status!),
        explanation: getVitalityExplanation(VitalitySource.ISO, lang),
      };
    case VitalitySource.Eth2013:
      return {
        score: lang.vitalityEth2013,
        label: getVitalityEthnologueFineLabel(lang.vitalityEth2013!),
        explanation: getVitalityExplanation(VitalitySource.Eth2013, lang),
      };
    case VitalitySource.Eth2025:
      return {
        score: lang.vitalityEth2025,
        label: getVitalityEthnologueCoarseLabel(lang.vitalityEth2025!),
        explanation: getVitalityExplanation(VitalitySource.Eth2025, lang),
      };
    case VitalitySource.Metascore:
      return computeVitalityMetascoreInfo(lang);
  }
}

/**
 * Gets all available vitality scores for a language
 */
export function getAllVitalityScores(lang: LanguageData): AllVitalityInfo {
  return Object.values(VitalitySource).reduce<AllVitalityInfo>((acc, source) => {
    acc[source] = getVitalityInfo(source, lang);
    return acc;
  }, {} as AllVitalityInfo);
}

import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import LinkButton from '@shared/ui/LinkButton';

export enum VitalityMeterType {
  Metascore = 'Metascore',
  ISO = 'ISO',
  Eth2013 = 'Eth2013',
  Eth2025 = 'Eth2025',
}

/**
 * Maps Ethnologue 2013 vitality levels to 0-9 scale
 * Ethnologue 2013 scale: 1=National, 2=Regional, 3=Trade, 4=Educational, 5=Written, 6=Threatened, 7=Shifting, 8=Moribund, 9=Nearly Extinct, 10=Extinct
 * Our scale: 9=National, 8=Regional, 7=Trade, 6=Educational, 5=Written, 4=Threatened, 3=Shifting, 2=Moribund, 1=Nearly Extinct, 0=Extinct
 */
export function getEthnologue2013Score(vitality: string): number | null {
  if (!vitality) return null;

  switch (vitality.toLowerCase()) {
    case 'national':
      return 9;
    case 'provincial':
    case 'regional':
      return 8;
    case 'trade':
    case 'wider communication':
      return 7;
    case 'educational':
      return 6;
    case 'written':
    case 'developing':
      return 5;
    case 'vigorous':
    case 'threatened':
      return 4;
    case 'shifting':
      return 3;
    case 'moribund':
    case 'nearly extinct':
      return 2;
    case 'dormant':
      return 1;
    case 'extinct':
      return 0;
    default:
      return null;
  }
}

/**
 * Maps Ethnologue 2025 vitality levels to 0-9 scale
 * Ethnologue 2025: Institutional = 9, Stable = 6, Endangered = 3, Extinct = 0
 */
export function getEthnologue2025Score(vitality: string): number | null {
  if (!vitality) return null;

  switch (vitality.toLowerCase()) {
    case '1 institutional':
      return 9;
    case '2 stable':
      return 6;
    case '3 endangered':
      return 3;
    case '4 extinct':
      return 0;
    default:
      return null;
  }
}

/**
 * Maps ISO vitality levels to 0-9 scale
 * ISO: Living = 9, Constructed = 3, Historical = 1, Extinct = 0
 */
export function getISOScore(vitality: string): number | null {
  if (!vitality) return null;

  switch (vitality.toLowerCase()) {
    case 'living':
      return 9;
    case 'constructed':
      return 3;
    case 'historical':
    case 'historic':
      return 1;
    case 'extinct':
      return 0;
    default:
      return null;
  }
}

/**
 * Generates ReactNode explanations for vitality scores
 */
export function getVitalityExplanation(
  type: VitalityMeterType,
  lang: LanguageData,
  score: number | null,
): React.ReactNode {
  switch (type) {
    case VitalityMeterType.ISO:
      if (score === null) return 'No vitality data available';
      return (
        <div>
          <div>ISO Vitality: {lang.vitalityISO}</div>
          <div>Normalized to a score of {score} out of 9.</div>
        </div>
      );

    case VitalityMeterType.Eth2013:
      if (score === null) return 'No vitality data available';
      return (
        <div>
          <div>
            Ethnologue 2013 Vitality: {lang.vitalityEth2013}
            <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
              methodology
            </LinkButton>
          </div>
          <div>Normalized to a score of {score} out of 9.</div>
        </div>
      );

    case VitalityMeterType.Eth2025:
      if (score === null) return 'No vitality data available';
      return (
        <div>
          <div>Ethnologue 2025 Vitality: {lang.vitalityEth2025?.split(' ')[1]}</div>
          <div>Normalized to a score of {score} out of 9.</div>
        </div>
      );

    case VitalityMeterType.Metascore: {
      const eth2013Score = getEthnologue2013Score(lang.vitalityEth2013 || '');
      const eth2025Score = getEthnologue2025Score(lang.vitalityEth2025 || '');

      if (eth2013Score !== null && eth2025Score !== null) {
        // Both Ethnologue values exist - return average
        const average = (eth2013Score + eth2025Score) / 2;
        return (
          <div>
            <div>
              Ethnologue changed the methodology of its vitality scores. So we convert them to a
              normalized score and averaged the data from 2013 and 2025. Average:{' '}
              {average.toFixed(1)}.
            </div>
            <div style={{ marginLeft: '2em' }}>
              2013: {lang.vitalityEth2013} ({eth2013Score}){' '}
              <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
                methodology
              </LinkButton>
            </div>
            <div style={{ marginLeft: '2em' }}>
              2025: {lang.vitalityEth2025?.split(' ')[1]} ({eth2025Score})
            </div>
          </div>
        );
      }
      // No vitality data available
      return 'No vitality data available';
    }

    default:
      return 'Unknown vitality type';
  }
}

/**
 * Computes the vitality metascore for a language using the algorithm:
 * 1. If both Ethnologue 2013 & 2025 values exist, return the average
 * 2. If only one Ethnologue value exists, return that
 * 3. If neither Ethnologue value exists, use ISO scale
 */
export function computeVitalityMetascore(lang: LanguageData): {
  score: number | null;
  label: string | null;
  explanation: React.ReactNode;
} {
  const eth2013Score = getEthnologue2013Score(lang.vitalityEth2013 || '');
  const eth2025Score = getEthnologue2025Score(lang.vitalityEth2025 || '');
  const isoScore = getISOScore(lang.vitalityISO || '');

  let score: number | null = null;
  let label: string | null = null;
  let explanation: React.ReactNode = 'No vitality data available';

  if (eth2013Score !== null && eth2025Score !== null) {
    // Both Ethnologue values exist - return average
    score = (eth2013Score + eth2025Score) / 2;
    label = score.toFixed(1); // For metascore, use the numerical value as label
    explanation = getVitalityExplanation(VitalityMeterType.Metascore, lang, score);
  } else if (eth2013Score !== null) {
    // Only Ethnologue 2013 exists
    score = eth2013Score;
    label = lang.vitalityEth2013 || null;
    explanation = getVitalityExplanation(VitalityMeterType.Eth2013, lang, score);
  } else if (eth2025Score !== null) {
    // Only Ethnologue 2025 exists
    score = eth2025Score;
    label = lang.vitalityEth2025?.split(' ')[1] || null;
    explanation = getVitalityExplanation(VitalityMeterType.Eth2025, lang, score);
  } else if (isoScore !== null) {
    // Use ISO as fallback
    score = isoScore;
    label = lang.vitalityISO || null;
    explanation = getVitalityExplanation(VitalityMeterType.ISO, lang, score);
  }
  return { score, label, explanation };
}

/**
 * Gets all available vitality scores for a language
 */
export function getAllVitalityScores(
  lang: LanguageData,
): Record<
  VitalityMeterType,
  { score: number | null; label: string | null; explanation: React.ReactNode }
> {
  const isoScore = getISOScore(lang.vitalityISO || '');
  const eth2013Score = getEthnologue2013Score(lang.vitalityEth2013 || '');
  const eth2025Score = getEthnologue2025Score(lang.vitalityEth2025 || '');
  const metascoreResult = computeVitalityMetascore(lang);

  return {
    [VitalityMeterType.ISO]: {
      score: isoScore,
      label: lang.vitalityISO || null,
      explanation: getVitalityExplanation(VitalityMeterType.ISO, lang, isoScore),
    },
    [VitalityMeterType.Eth2013]: {
      score: eth2013Score,
      label: lang.vitalityEth2013 || null,
      explanation: getVitalityExplanation(VitalityMeterType.Eth2013, lang, eth2013Score),
    },
    [VitalityMeterType.Eth2025]: {
      score: eth2025Score,
      label: lang.vitalityEth2025?.split(' ')[1] || null,
      explanation: getVitalityExplanation(VitalityMeterType.Eth2025, lang, eth2025Score),
    },
    [VitalityMeterType.Metascore]: metascoreResult,
  } as Record<
    VitalityMeterType,
    { score: number | null; label: string | null; explanation: React.ReactNode }
  >;
}

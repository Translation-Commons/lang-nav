import React from 'react';
import { LanguageData } from '../../types/LanguageTypes';

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
    case 'regional':
      return 8;
    case 'trade':
      return 7;
    case 'educational':
      return 6;
    case 'written':
      return 5;
    case 'threatened':
      return 4;
    case 'shifting':
      return 3;
    case 'moribund':
      return 2;
    case 'nearly extinct':
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
    case 'institutional':
      return 9;
    case 'stable':
      return 6;
    case 'endangered':
      return 3;
    case 'extinct':
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
      return 1;
    case 'extinct':
      return 0;
    default:
      return null;
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
  explanation: React.ReactNode;
} {
  const eth2013Score = getEthnologue2013Score(lang.vitalityEth2013 || '');
  const eth2025Score = getEthnologue2025Score(lang.vitalityEth2025 || '');
  const isoScore = getISOScore(lang.vitalityISO || '');

  let explanation: React.ReactNode = '';

  if (eth2013Score !== null && eth2025Score !== null) {
    // Both Ethnologue values exist - return average
    const average = (eth2013Score + eth2025Score) / 2;
    explanation = (
      <div>
        <div>{average.toFixed(1)}</div>
        <div style={{ marginTop: '0.25em' }}>Average of Ethnologue 2013 and Ethnologue 2025</div>
        <div style={{ marginLeft: '2em' }}>
          Ethnologue 2013: {eth2013Score}
          {lang.vitalityEth2013 ? ` (${lang.vitalityEth2013})` : ''}
        </div>
        <div style={{ marginLeft: '2em' }}>
          Ethnologue 2025: {eth2025Score}
          {lang.vitalityEth2025 ? ` (${lang.vitalityEth2025})` : ''}
        </div>
      </div>
    );
    return { score: average, explanation };
  }

  if (eth2013Score !== null) {
    // Only Ethnologue 2013 exists
    explanation = (
      <div>
        <div>{eth2013Score}</div>
        <div style={{ marginTop: '0.25em' }}>Based on Ethnologue 2013</div>
        <div style={{ marginLeft: '2em' }}>
          Ethnologue 2013: {eth2013Score}
          {lang.vitalityEth2013 ? ` (${lang.vitalityEth2013})` : ''}
        </div>
      </div>
    );
    return { score: eth2013Score, explanation };
  }

  if (eth2025Score !== null) {
    // Only Ethnologue 2025 exists
    explanation = (
      <div>
        <div>{eth2025Score}</div>
        <div style={{ marginTop: '0.25em' }}>Based on Ethnologue 2025</div>
        <div style={{ marginLeft: '2em' }}>
          Ethnologue 2025: {eth2025Score}
          {lang.vitalityEth2025 ? ` (${lang.vitalityEth2025})` : ''}
        </div>
      </div>
    );
    return { score: eth2025Score, explanation };
  }

  if (isoScore !== null) {
    // Use ISO as fallback
    explanation = (
      <div>
        <div>{isoScore}</div>
        <div style={{ marginTop: '0.25em' }}>Based on ISO Vitality / Status</div>
        <div style={{ marginLeft: '2em' }}>
          ISO: {isoScore}
          {lang.vitalityISO ? ` (${lang.vitalityISO})` : ''}
        </div>
      </div>
    );
    return { score: isoScore, explanation };
  }

  // No vitality data available
  explanation = 'No vitality data available';
  return { score: null, explanation };
}

/**
 * Gets all available vitality scores for a language
 */
export function getAllVitalityScores(lang: LanguageData): {
  iso: { score: number | null; value: string | null; explanation: React.ReactNode };
  eth2013: { score: number | null; value: string | null; explanation: React.ReactNode };
  eth2025: { score: number | null; value: string | null; explanation: React.ReactNode };
  metascore: { score: number | null; explanation: React.ReactNode };
} {
  return {
    iso: {
      score: getISOScore(lang.vitalityISO || ''),
      value: lang.vitalityISO || null,
      explanation: (
        <div>
          <div>{getISOScore(lang.vitalityISO || '') ?? 'N/A'}</div>
          <div style={{ marginTop: '0.25em' }}>Based on ISO Vitality / Status</div>
          <div style={{ marginLeft: '2em' }}>
            ISO: {getISOScore(lang.vitalityISO || '') ?? 'N/A'}
            {lang.vitalityISO ? ` (${lang.vitalityISO})` : ''}
          </div>
        </div>
      ),
    },
    eth2013: {
      score: getEthnologue2013Score(lang.vitalityEth2013 || ''),
      value: lang.vitalityEth2013 || null,
      explanation: (
        <div>
          <div>{getEthnologue2013Score(lang.vitalityEth2013 || '') ?? 'N/A'}</div>
          <div style={{ marginTop: '0.25em' }}>Based on Ethnologue 2013</div>
          <div style={{ marginLeft: '2em' }}>
            Ethnologue 2013: {getEthnologue2013Score(lang.vitalityEth2013 || '') ?? 'N/A'}
            {lang.vitalityEth2013 ? ` (${lang.vitalityEth2013})` : ''}
          </div>
        </div>
      ),
    },
    eth2025: {
      score: getEthnologue2025Score(lang.vitalityEth2025 || ''),
      value: lang.vitalityEth2025 || null,
      explanation: (
        <div>
          <div>{getEthnologue2025Score(lang.vitalityEth2025 || '') ?? 'N/A'}</div>
          <div style={{ marginTop: '0.25em' }}>Based on Ethnologue 2025</div>
          <div style={{ marginLeft: '2em' }}>
            Ethnologue 2025: {getEthnologue2025Score(lang.vitalityEth2025 || '') ?? 'N/A'}
            {lang.vitalityEth2025 ? ` (${lang.vitalityEth2025})` : ''}
          </div>
        </div>
      ),
    },
    metascore: computeVitalityMetascore(lang),
  };
}

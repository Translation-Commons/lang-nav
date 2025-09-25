import { LanguageData } from '../../types/LanguageTypes';

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
  explanation: string;
  sources: string[];
} {
  const eth2013Score = getEthnologue2013Score(lang.vitalityEth2013 || '');
  const eth2025Score = getEthnologue2025Score(lang.vitalityEth2025 || '');
  const isoScore = getISOScore(lang.vitalityISO || '');

  const sources: string[] = [];
  let explanation = '';

  if (eth2013Score !== null && eth2025Score !== null) {
    // Both Ethnologue values exist - return average
    const average = (eth2013Score + eth2025Score) / 2;
    sources.push('Ethnologue 2013', 'Ethnologue 2025');
    explanation = `Average of Ethnologue 2013 (${eth2013Score}) and Ethnologue 2025 (${eth2025Score}) = ${average}`;
    return { score: average, explanation, sources };
  }

  if (eth2013Score !== null) {
    // Only Ethnologue 2013 exists
    sources.push('Ethnologue 2013');
    explanation = `Ethnologue 2013 score: ${eth2013Score}`;
    return { score: eth2013Score, explanation, sources };
  }

  if (eth2025Score !== null) {
    // Only Ethnologue 2025 exists
    sources.push('Ethnologue 2025');
    explanation = `Ethnologue 2025 score: ${eth2025Score}`;
    return { score: eth2025Score, explanation, sources };
  }

  if (isoScore !== null) {
    // Use ISO as fallback
    sources.push('ISO');
    explanation = `ISO score: ${isoScore}`;
    return { score: isoScore, explanation, sources };
  }

  // No vitality data available
  explanation = 'No vitality data available';
  return { score: null, explanation, sources };
}

/**
 * Gets all available vitality scores for a language
 */
export function getAllVitalityScores(lang: LanguageData): {
  iso: { score: number | null; value: string | null };
  eth2013: { score: number | null; value: string | null };
  eth2025: { score: number | null; value: string | null };
  metascore: { score: number | null; explanation: string; sources: string[] };
} {
  return {
    iso: {
      score: getISOScore(lang.vitalityISO || ''),
      value: lang.vitalityISO || null,
    },
    eth2013: {
      score: getEthnologue2013Score(lang.vitalityEth2013 || ''),
      value: lang.vitalityEth2013 || null,
    },
    eth2025: {
      score: getEthnologue2025Score(lang.vitalityEth2025 || ''),
      value: lang.vitalityEth2025 || null,
    },
    metascore: computeVitalityMetascore(lang),
  };
}

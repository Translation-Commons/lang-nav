import { describe, it, expect } from 'vitest';

import { getBaseLanguageData } from '../../../types/LanguageTypes';
import {
  computeVitalityMetascore,
  getEthnologue2013Score,
  getEthnologue2025Score,
  getISOScore,
} from '../LanguageVitalityComputation';

describe('getISOScore', () => {
  it('returns 9 for Living', () => {
    expect(getISOScore('Living')).toBe(9);
    expect(getISOScore('living')).toBe(9); // case-insensitive
  });

  it('returns 3 for Constructed', () => {
    expect(getISOScore('Constructed')).toBe(3);
  });

  it('returns 1 for Historical', () => {
    expect(getISOScore('Historical')).toBe(1);
    expect(getISOScore('historic')).toBe(1);
  });

  it('returns 0 for Extinct', () => {
    expect(getISOScore('Extinct')).toBe(0);
  });

  it('returns null for empty or unknown values', () => {
    expect(getISOScore('')).toBe(null);
    expect(getISOScore('unknown')).toBe(null);
  });
});

describe('getEthnologue2013Score', () => {
  it('returns correct scores for all levels', () => {
    expect(getEthnologue2013Score('National')).toBe(9);
    expect(getEthnologue2013Score('Regional')).toBe(8);
    expect(getEthnologue2013Score('Trade')).toBe(7);
    expect(getEthnologue2013Score('Educational')).toBe(6);
    expect(getEthnologue2013Score('Written')).toBe(5);
    expect(getEthnologue2013Score('Vigorous')).toBe(4);
    expect(getEthnologue2013Score('Shifting')).toBe(3);
    expect(getEthnologue2013Score('Moribund')).toBe(2);
    expect(getEthnologue2013Score('Dormant')).toBe(1);
    expect(getEthnologue2013Score('Extinct')).toBe(0);
  });

  it('returns null for unknown values', () => {
    expect(getEthnologue2013Score('')).toBe(null);
    expect(getEthnologue2013Score('unknown')).toBe(null);
  });
});

describe('getEthnologue2025Score', () => {
  it('returns correct scores for all levels', () => {
    expect(getEthnologue2025Score('1 Institutional')).toBe(9);
    expect(getEthnologue2025Score('2 Stable')).toBe(6);
    expect(getEthnologue2025Score('3 Endangered')).toBe(3);
    expect(getEthnologue2025Score('4 Extinct')).toBe(0);
  });

  it('returns null for unknown values', () => {
    expect(getEthnologue2025Score('')).toBe(null);
  });
});

describe('computeVitalityMetascore', () => {
  it('returns average when both Ethnologue values exist', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityEth2013 = 'National'; // 9
    lang.vitalityEth2025 = '2 Stable'; // 6
    const result = computeVitalityMetascore(lang);
    expect(result.score).toBe(7.5); // (9 + 6) / 2
  });

  it('uses Ethnologue 2013 when only it exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityEth2013 = 'Vigorous'; // 4
    const result = computeVitalityMetascore(lang);
    expect(result.score).toBe(4);
  });

  it('uses Ethnologue 2025 when only it exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityEth2025 = '3 Endangered'; // 3
    const result = computeVitalityMetascore(lang);
    expect(result.score).toBe(3);
  });

  it('falls back to ISO when no Ethnologue data exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityISO = 'Living'; // 9
    const result = computeVitalityMetascore(lang);
    expect(result.score).toBe(9);
  });

  it('returns null when no vitality data exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    const result = computeVitalityMetascore(lang);
    expect(result.score).toBe(null);
  });
});
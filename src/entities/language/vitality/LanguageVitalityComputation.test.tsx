import { describe, it, expect } from 'vitest';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import { getVitalityMetascore } from './LanguageVitalityComputation';
import {
  parseVitalityEthnologue2013,
  parseVitalityEthnologue2025,
  parseVitalityISO,
} from './VitalityParsing';
import { VitalityEthnologueCoarse, VitalityEthnologueFine, VitalityISO } from './VitalityTypes';

describe('parseVitalityISO', () => {
  it('returns 9 for Living', () => {
    expect(parseVitalityISO('Living')).toBe(9);
    expect(parseVitalityISO('living')).toBe(9); // case-insensitive
  });

  it('returns 3 for Constructed', () => {
    expect(parseVitalityISO('Constructed')).toBe(3);
  });

  it('returns 1 for Historical', () => {
    expect(parseVitalityISO('Historical')).toBe(1);
    expect(parseVitalityISO('historic')).toBe(1);
  });

  it('returns 0 for Extinct', () => {
    expect(parseVitalityISO('Extinct')).toBe(0);
  });

  it('returns undefined for empty or unknown values', () => {
    expect(parseVitalityISO('')).toBeUndefined();
    expect(parseVitalityISO('unknown')).toBeUndefined();
  });
});

describe('parseVitalityEthnologue2013', () => {
  it('returns correct scores for all levels', () => {
    expect(parseVitalityEthnologue2013('National')).toBe(9);
    expect(parseVitalityEthnologue2013('Regional')).toBe(8);
    expect(parseVitalityEthnologue2013('Trade')).toBe(7);
    expect(parseVitalityEthnologue2013('Educational')).toBe(6);
    expect(parseVitalityEthnologue2013('Written')).toBe(5);
    expect(parseVitalityEthnologue2013('Vigorous')).toBe(4);
    expect(parseVitalityEthnologue2013('Shifting')).toBe(3);
    expect(parseVitalityEthnologue2013('Moribund')).toBe(2);
    expect(parseVitalityEthnologue2013('Dormant')).toBe(1);
    expect(parseVitalityEthnologue2013('Extinct')).toBe(0);
  });

  it('returns undefined for unknown values', () => {
    expect(parseVitalityEthnologue2013('')).toBeUndefined();
    expect(parseVitalityEthnologue2013('unknown')).toBeUndefined();
  });
});

describe('parseVitalityEthnologue2025', () => {
  it('returns correct scores for all levels', () => {
    expect(parseVitalityEthnologue2025('Institutional')).toBe(9);
    expect(parseVitalityEthnologue2025('Stable')).toBe(6);
    expect(parseVitalityEthnologue2025('Endangered')).toBe(3);
    expect(parseVitalityEthnologue2025('Extinct')).toBe(0);
  });

  it('returns undefined for unknown values', () => {
    expect(parseVitalityEthnologue2025('')).toBeUndefined();
    expect(parseVitalityEthnologue2025('1 Institutional')).toBeUndefined();
  });
});

describe('computeVitalityMetascore', () => {
  it('returns average when both Ethnologue values exist', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityEth2013 = VitalityEthnologueFine.National; // 9
    lang.vitalityEth2025 = VitalityEthnologueCoarse.Stable; // 6
    const result = getVitalityMetascore(lang);
    expect(result).toBe(7.5); // (9 + 6) / 2
  });

  it('uses Ethnologue 2013 when only it exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityEth2013 = VitalityEthnologueFine.Threatened; // 4
    const result = getVitalityMetascore(lang);
    expect(result).toBe(4);
  });

  it('uses Ethnologue 2025 when only it exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityEth2025 = VitalityEthnologueCoarse.Endangered; // 3
    const result = getVitalityMetascore(lang);
    expect(result).toBe(3);
  });

  it('falls back to ISO when no Ethnologue data exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitalityISO = VitalityISO.Living; // 9
    const result = getVitalityMetascore(lang);
    expect(result).toBe(9);
  });

  it('returns undefined when no vitality data exists', () => {
    const lang = getBaseLanguageData('en', 'English');
    const result = getVitalityMetascore(lang);
    expect(result).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';

import {
  getBaseLanguageData,
  LanguageData,
  LanguageVitality,
} from '@entities/language/LanguageTypes';

import { getVitalityMetascore, precomputeLanguageVitality } from '../LanguageVitalityComputation';
import {
  parseVitalityEthnologue2013,
  parseVitalityEthnologue2025,
  parseLanguageISOStatus,
} from '../VitalityParsing';
import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  LanguageISOStatus,
} from '../VitalityTypes';

describe('parseLanguageISOStatus', () => {
  it('returns 9 for Living', () => {
    expect(parseLanguageISOStatus('Living')).toBe(9);
    expect(parseLanguageISOStatus('living')).toBe(9); // case-insensitive
  });

  it('returns 3 for Constructed', () => {
    expect(parseLanguageISOStatus('Constructed')).toBe(3);
  });

  it('returns 1 for Historical', () => {
    expect(parseLanguageISOStatus('Historical')).toBe(1);
    expect(parseLanguageISOStatus('historic')).toBe(1);
  });

  it('returns 0 for Extinct', () => {
    expect(parseLanguageISOStatus('Extinct')).toBe(0);
  });

  it('returns undefined for empty or unknown values', () => {
    expect(parseLanguageISOStatus('')).toBeUndefined();
    expect(parseLanguageISOStatus('unknown')).toBeUndefined();
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
  function generateLanguage(vitality: LanguageVitality): LanguageData {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitality = vitality;
    return lang;
  }

  it('returns average when both Ethnologue values exist', () => {
    const lang = generateLanguage({
      ethFine: VitalityEthnologueFine.National, // 9
      ethCoarse: VitalityEthnologueCoarse.Stable, // 6
    });
    const result = getVitalityMetascore(lang);
    expect(result).toBe(7.5); // (9 + 6) / 2
  });

  it('uses Ethnologue 2013 when only it exists', () => {
    const lang = generateLanguage({
      ethFine: VitalityEthnologueFine.Threatened, // 4
    });
    const result = getVitalityMetascore(lang);
    expect(result).toBe(4);
  });

  it('uses Ethnologue 2025 when only it exists', () => {
    const lang = generateLanguage({
      ethCoarse: VitalityEthnologueCoarse.Endangered, // 3
    });
    const result = getVitalityMetascore(lang);
    expect(result).toBe(3);
  });

  it('falls back to ISO when no Ethnologue data exists', () => {
    const lang = generateLanguage({ iso: LanguageISOStatus.Living }); // 9
    const result = getVitalityMetascore(lang);
    expect(result).toBe(9);
  });

  it('returns undefined when no vitality data exists', () => {
    const lang = generateLanguage({});
    const result = getVitalityMetascore(lang);
    expect(result).toBeUndefined();
  });

  it('needs to be precomputed to have a metascore', () => {
    const lang = generateLanguage({
      ethnologue2013: VitalityEthnologueFine.Developing, // 5
      ethnologue2025: VitalityEthnologueCoarse.Stable, // 6
    });
    const metascoreBefore = getVitalityMetascore(lang);
    expect(lang.vitality?.meta).toBeUndefined();
    expect(metascoreBefore).toBeUndefined();

    // Simulate precomputation
    precomputeLanguageVitality([lang]);
    const metascoreAfter = getVitalityMetascore(lang);
    expect(metascoreAfter).toBe(5.5); // (5 + 6) / 2
    expect(lang.vitality?.meta).toBe(5.5);
  });
});

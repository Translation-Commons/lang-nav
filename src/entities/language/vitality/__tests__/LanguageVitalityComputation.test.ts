import { describe, expect, it } from 'vitest';

import {
  getBaseLanguageData,
  LanguageData,
  LanguageVitality,
} from '@entities/language/LanguageTypes';

import { getVitalityMetascore, precomputeLanguageVitality } from '../LanguageVitalityComputation';
import {
  parseLanguageISOStatus,
  parseVitalityEthnologue2012,
  parseVitalityEthnologue2025,
} from '../VitalityParsing';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
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

describe('parseVitalityEthnologue2012', () => {
  it('returns correct scores for all levels', () => {
    expect(parseVitalityEthnologue2012('National')).toBe(9);
    expect(parseVitalityEthnologue2012('Regional')).toBe(8);
    expect(parseVitalityEthnologue2012('Trade')).toBe(7);
    expect(parseVitalityEthnologue2012('Educational')).toBe(6);
    expect(parseVitalityEthnologue2012('Written')).toBe(5);
    expect(parseVitalityEthnologue2012('Vigorous')).toBe(4);
    expect(parseVitalityEthnologue2012('Shifting')).toBe(3);
    expect(parseVitalityEthnologue2012('Moribund')).toBe(2);
    expect(parseVitalityEthnologue2012('Dormant')).toBe(1);
    expect(parseVitalityEthnologue2012('Extinct')).toBe(0);
  });

  it('returns undefined for unknown values', () => {
    expect(parseVitalityEthnologue2012('')).toBeUndefined();
    expect(parseVitalityEthnologue2012('unknown')).toBeUndefined();
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

  it('uses fine Ethnologue vitality estimates when only it exists', () => {
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
      ethnologue2012: VitalityEthnologueFine.Developing, // 5
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

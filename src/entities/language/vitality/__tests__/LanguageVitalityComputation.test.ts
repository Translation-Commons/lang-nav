import { describe, expect, it } from 'vitest';

import {
  getBaseLanguageData,
  LanguageData,
  LanguageVitality,
} from '@entities/language/LanguageTypes';

import { getVitalityMetascore } from '../LanguageVitalityComputation';
import { parseLanguageISOStatus } from '../VitalityParsing';
import { LanguageISOStatus } from '../VitalityTypes';

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

describe('computeVitalityMetascore', () => {
  function generateLanguage(vitality: LanguageVitality): LanguageData {
    const lang = getBaseLanguageData('en', 'English');
    lang.vitality = vitality;
    return lang;
  }

  it('uses ISO data', () => {
    const lang = generateLanguage({ iso: LanguageISOStatus.Living }); // 9
    const result = getVitalityMetascore(lang);
    expect(result).toBe(9);
  });

  it('returns undefined when no vitality data exists', () => {
    const lang = generateLanguage({});
    const result = getVitalityMetascore(lang);
    expect(result).toBeUndefined();
  });
});

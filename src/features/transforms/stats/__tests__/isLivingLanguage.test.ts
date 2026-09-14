import { describe, expect, it } from 'vitest';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

import isLivingLanguage from '../isLivingLanguage';

describe('isLivingLanguage', () => {
  it('returns true for a living Language-scope entry', () => {
    const lang = {
      ...getBaseLanguageData('eng', 'English'),
      scope: LanguageScope.Language,
      ISO: { status: LanguageISOStatus.Living },
    };
    expect(isLivingLanguage(lang)).toBe(true);
  });

  it('returns true for a living Macrolanguage-scope entry', () => {
    const lang = {
      ...getBaseLanguageData('ara', 'Arabic'),
      scope: LanguageScope.Macrolanguage,
      ISO: { status: LanguageISOStatus.Living },
    };
    expect(isLivingLanguage(lang)).toBe(true);
  });

  it('returns false for a Family-scope entry even if marked Living', () => {
    const lang = {
      ...getBaseLanguageData('ine', 'Indo-European'),
      scope: LanguageScope.Family,
      ISO: { status: LanguageISOStatus.Living },
    };
    expect(isLivingLanguage(lang)).toBe(false);
  });

  it('returns false for an Extinct language', () => {
    const lang = {
      ...getBaseLanguageData('xxx', 'Extinct Tongue'),
      scope: LanguageScope.Language,
      ISO: { status: LanguageISOStatus.Extinct },
    };
    expect(isLivingLanguage(lang)).toBe(false);
  });

  it('returns false when ISO status is missing', () => {
    const lang = {
      ...getBaseLanguageData('yyy', 'Unknown Status'),
      scope: LanguageScope.Language,
    };
    expect(isLivingLanguage(lang)).toBe(false);
  });
});

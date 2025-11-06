import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { VitalityEthnologueFine } from '@entities/language/vitality/VitalityTypes';
import { LocaleData, LocaleSource, TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

export function getMockLanguages() {
  const US: TerritoryData = {
    ID: 'US',
    codeDisplay: 'US',
    nameDisplay: 'United States',
    names: ['United States', 'USA', 'US'],
    type: ObjectType.Territory,
    scope: TerritoryScope.Country,
    population: 331002651,
    populationFromUN: 331000000,
  };
  // To simplify, all languages share the same locale for the US
  const mul_US: LocaleData = {
    ID: 'mul_US',
    codeDisplay: 'mul_US',
    languageCode: 'mul',
    territoryCode: 'US',
    territory: US,
    nameDisplay: 'Multiple Languages (USA)',
    names: ['Multiple Languages'],
    type: ObjectType.Locale,
    localeSource: LocaleSource.CreateRegionalLocales,
  };

  const ine = getBaseLanguageData('ine', 'Indo-European languages');
  ine.scope = LanguageScope.Family;
  ine.locales = [mul_US];
  const eng = getBaseLanguageData('eng', 'English');
  eng.scope = LanguageScope.Language;
  eng.locales = [mul_US];
  eng.vitalityEth2013 = VitalityEthnologueFine.National;
  const spa = getBaseLanguageData('spa', 'Spanish');
  spa.scope = LanguageScope.Language;
  spa.locales = [mul_US];
  spa.vitalityEth2013 = VitalityEthnologueFine.National;
  const fra = getBaseLanguageData('fra', 'French');
  fra.scope = LanguageScope.Language;
  fra.locales = [mul_US];
  fra.vitalityEth2013 = VitalityEthnologueFine.Regional;
  const deu = getBaseLanguageData('deu', 'German');
  deu.scope = LanguageScope.Language;
  const ita = getBaseLanguageData('ita', 'Italian');
  ita.scope = LanguageScope.Language;
  const zho = getBaseLanguageData('zho', 'Chinese');
  zho.scope = LanguageScope.Macrolanguage;
  return [ine, eng, spa, fra, deu, ita, zho];
}

describe('Mock Languages for Filter Tests', () => {
  it('provides mock languages with expected properties', () => {
    const languages = getMockLanguages();
    expect(languages.length).toBe(7);
  });
});

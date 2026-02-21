import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { VitalityEthnologueFine } from '@entities/language/vitality/VitalityTypes';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

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
  const Latn: WritingSystemData = {
    ID: 'Latn',
    codeDisplay: 'Latn',
    nameDisplay: 'Latin',
    names: ['Latin'],
    type: ObjectType.WritingSystem,
    scope: WritingSystemScope.IndividualScript,
  };
  const Cyrl: WritingSystemData = {
    ID: 'Cyrl',
    codeDisplay: 'Cyrl',
    nameDisplay: 'Cyrillic',
    names: ['Cyrillic'],
    type: ObjectType.WritingSystem,
    scope: WritingSystemScope.IndividualScript,
  };

  const ine = getBaseLanguageData('ine', 'Indo-European languages');
  ine.scope = LanguageScope.Family;
  ine.locales = [mul_US];
  ine.writingSystems = { Latn, Cyrl };
  const gem = getBaseLanguageData('gem', 'Germanic');
  gem.scope = LanguageScope.Family;
  gem.locales = [mul_US];
  gem.writingSystems = { Latn };
  gem.parentLanguage = ine;
  const eng = getBaseLanguageData('eng', 'English');
  eng.scope = LanguageScope.Language;
  eng.locales = [mul_US];
  eng.writingSystems = { Latn };
  eng.primaryWritingSystem = Latn;
  eng.vitality = { ethFine: VitalityEthnologueFine.National };
  eng.parentLanguage = gem;
  const spa = getBaseLanguageData('spa', 'Spanish');
  spa.scope = LanguageScope.Language;
  spa.locales = [mul_US];
  spa.vitality = { ethFine: VitalityEthnologueFine.National };
  spa.writingSystems = { Latn };
  spa.parentLanguage = ine;
  const fra = getBaseLanguageData('fra', 'French');
  fra.scope = LanguageScope.Language;
  fra.locales = [mul_US];
  fra.vitality = { ethFine: VitalityEthnologueFine.Regional };
  fra.writingSystems = { Latn };
  fra.parentLanguage = ine;
  const deu = getBaseLanguageData('deu', 'German');
  deu.scope = LanguageScope.Language;
  deu.writingSystems = { Latn };
  deu.parentLanguage = gem;
  const ita = getBaseLanguageData('ita', 'Italian');
  ita.scope = LanguageScope.Language;
  ita.writingSystems = { Latn };
  ita.parentLanguage = ine;
  const rus = getBaseLanguageData('rus', 'Russian');
  rus.scope = LanguageScope.Language;
  rus.writingSystems = { Cyrl };
  rus.locales = [mul_US];
  rus.parentLanguage = ine;

  // Non Indo-European languages
  const nav = getBaseLanguageData('nav', 'Navajo');
  nav.scope = LanguageScope.Language;
  nav.writingSystems = { Latn };
  nav.locales = [mul_US];
  nav.vitality = { ethFine: VitalityEthnologueFine.Threatened };
  const zho = getBaseLanguageData('zho', 'Chinese');
  zho.scope = LanguageScope.Macrolanguage;

  return [ine, gem, eng, spa, fra, deu, ita, rus, nav, zho];
}

describe('Mock Languages for Filter Tests', () => {
  it('provides mock languages with expected properties', () => {
    const languages = getMockLanguages();
    expect(languages.length).toBe(10);
  });
});

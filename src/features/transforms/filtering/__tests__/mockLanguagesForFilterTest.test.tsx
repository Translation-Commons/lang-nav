import { describe, expect, it } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

export function getMockLanguages() {
  const US: TerritoryData = {
    ID: 'US',
    codeDisplay: 'US',
    nameDisplay: 'United States',
    names: ['United States', 'USA', 'US'],
    type: EntityType.Territory,
    scope: TerritoryScope.Country,
    pop: { overall: 331002651, fromUN: 331000000 },
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
    type: EntityType.Locale,
    localeSource: LocaleSource.CreateRegionalLocales,
    pop: { speaking: {}, writing: {} },
  };
  const Latn: WritingSystemData = {
    ID: 'Latn',
    codeDisplay: 'Latn',
    nameDisplay: 'Latin',
    names: ['Latin'],
    type: EntityType.WritingSystem,
    scope: WritingSystemScope.IndividualScript,
  };
  const Cyrl: WritingSystemData = {
    ID: 'Cyrl',
    codeDisplay: 'Cyrl',
    nameDisplay: 'Cyrillic',
    names: ['Cyrillic'],
    type: EntityType.WritingSystem,
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
  eng.vitality = { iso: LanguageISOStatus.Living };
  eng.parentLanguage = gem;
  const spa = getBaseLanguageData('spa', 'Spanish');
  spa.scope = LanguageScope.Language;
  spa.locales = [mul_US];
  spa.vitality = { iso: LanguageISOStatus.Living };
  spa.writingSystems = { Latn };
  spa.parentLanguage = ine;
  const fra = getBaseLanguageData('fra', 'French');
  fra.scope = LanguageScope.Language;
  fra.locales = [mul_US];
  fra.vitality = { iso: LanguageISOStatus.Historical };
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
  const epo = getBaseLanguageData('epo', 'Esperanto');
  epo.scope = LanguageScope.Language;
  epo.writingSystems = { Latn };
  epo.locales = [mul_US];
  epo.vitality = { iso: LanguageISOStatus.Constructed };
  const zho = getBaseLanguageData('zho', 'Chinese');
  zho.scope = LanguageScope.Macrolanguage;

  return [ine, gem, eng, spa, fra, deu, ita, rus, epo, zho];
}

describe('Mock Languages for Filter Tests', () => {
  it('provides mock languages with expected properties', () => {
    const languages = getMockLanguages();
    expect(languages.length).toBe(10);
  });
});

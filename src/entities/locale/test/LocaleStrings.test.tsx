import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { getLocaleName } from '../LocaleStrings';
import { LocaleData, LocaleSource, PopulationSourceCategory } from '../LocaleTypes';

describe('getLocaleName', () => {
  it('Language with tags but no linked objects', () => {
    const locale: LocaleData = {
      type: ObjectType.Locale,
      ID: 'zh_Latn_CN_pinyin',
      codeDisplay: 'zh_Latn_CN_pinyin',
      populationSource: PopulationSourceCategory.NoSource,
      populationSpeaking: 0,
      censusRecords: [],
      localeSource: LocaleSource.StableDatabase,
      nameDisplay: 'Chinese (Pinyin)',
      names: ['Chinese (Pinyin)'],
      languageCode: 'zh',
      territoryCode: 'CN',
      scriptCode: 'Latn',
      variantTagCodes: ['pinyin'],
    };
    expect(getLocaleName(locale)).toBe('zh (CN, Latn, pinyin)');
  });

  it('Language with tags and linked objects', () => {
    const locale: LocaleData = {
      type: ObjectType.Locale,
      ID: 'zh_Latn_CN_pinyin',
      codeDisplay: 'zh_Latn_CN_pinyin',
      populationSource: PopulationSourceCategory.NoSource,
      populationSpeaking: 0,
      censusRecords: [],
      localeSource: LocaleSource.StableDatabase,
      nameDisplay: 'Chinese (Pinyin)',
      names: ['Chinese (Pinyin)'],
      languageCode: 'zh',
      territoryCode: 'CN',
      scriptCode: 'Latn',
      variantTagCodes: ['pinyin'],

      language: getBaseLanguageData('zh', 'Chinese'),
      territory: {
        type: ObjectType.Territory,
        ID: 'CN',
        codeDisplay: 'CN',
        nameDisplay: 'China',
        scope: TerritoryScope.Country,
        population: 1e9,
        populationFromUN: 1e9,
        names: ['China'],
      },
      writingSystem: {
        type: ObjectType.WritingSystem,
        ID: 'Latn',
        scope: WritingSystemScope.IndividualScript,
        codeDisplay: 'Latn',
        nameDisplay: 'Latin',
        names: ['Latin'],
      },
    };
    expect(getLocaleName(locale)).toBe('Chinese (China, Latin, pinyin)');
  });
});

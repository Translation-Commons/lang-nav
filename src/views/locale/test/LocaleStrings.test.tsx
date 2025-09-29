import { describe, expect, it } from 'vitest';

import {
  LocaleData,
  PopulationSourceCategory,
  TerritoryScope,
  WritingSystemScope,
} from '../../../types/DataTypes';
import { getBaseLanguageData } from '../../../types/LanguageTypes';
import { ObjectType } from '../../../types/PageParamTypes';
import { getLocaleName } from '../LocaleStrings';

describe('getLocaleName', () => {
  it('Language with tags but no linked objects', () => {
    const locale: LocaleData = {
      type: ObjectType.Locale,
      ID: 'zh_Latn_CN_pinyin',
      codeDisplay: 'zh_Latn_CN_pinyin',
      populationSource: PopulationSourceCategory.NoSource,
      populationSpeaking: 0,
      censusRecords: [],
      localeSource: 'regularInput',
      nameDisplay: 'Chinese (Pinyin)',
      names: ['Chinese (Pinyin)'],
      languageCode: 'zh',
      territoryCode: 'CN',
      explicitScriptCode: 'Latn',
      variantTagCode: 'pinyin',
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
      localeSource: 'regularInput',
      nameDisplay: 'Chinese (Pinyin)',
      names: ['Chinese (Pinyin)'],
      languageCode: 'zh',
      territoryCode: 'CN',
      explicitScriptCode: 'Latn',
      variantTagCode: 'pinyin',

      language: getBaseLanguageData('zh', 'Chinese'),
      territory: {
        type: ObjectType.Territory,
        ID: 'CN',
        codeDisplay: 'CN',
        nameDisplay: 'China',
        scope: TerritoryScope.Country,
        population: 1e9,
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

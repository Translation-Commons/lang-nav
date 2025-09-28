import { describe, expect, it } from 'vitest';

import {
  LocaleData,
  PopulationSourceCategory,
  TerritoryScope,
  WritingSystemScope,
} from '../../../types/DataTypes';
import { getBaseLanguageData } from '../../../types/LanguageTypes';
import { ObjectType } from '../../../types/PageParamTypes';
import { getLocaleName, parseLocaleCode } from '../LocaleStrings';

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
      localeSource: 'regularInput',
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

describe('parseLocaleCode', () => {
  it('Handles language tag with just language "fr"', () => {
    const result = parseLocaleCode('fr');
    expect(result).toEqual({
      languageCode: 'fr',
      scriptCode: undefined,
      territoryCode: undefined,
      variantTagCodes: [],
    });
  });

  it('Handles language tag with variant "en_US"', () => {
    const result = parseLocaleCode('en_US');
    expect(result).toEqual({
      languageCode: 'en',
      scriptCode: undefined,
      territoryCode: 'US',
      variantTagCodes: [],
    });
  });

  it('Handles language tag with language, script, and region "sr_Cyrl_ME"', () => {
    const result = parseLocaleCode('sr_Cyrl_ME');
    expect(result).toEqual({
      languageCode: 'sr',
      scriptCode: 'Cyrl',
      territoryCode: 'ME',
      variantTagCodes: [],
    });
  });

  it('Handles language tag with variant "ca_VALENCIA"', () => {
    const result = parseLocaleCode('ca_VALENCIA');
    expect(result).toEqual({
      languageCode: 'ca',
      scriptCode: undefined,
      territoryCode: undefined,
      variantTagCodes: ['valencia'],
    });
  });

  it('Handles full language tag with language, script, numeric region, and variant tag: "es_Latn_419_SPANGLIS"', () => {
    const result = parseLocaleCode('es_Latn_419_SPANGLIS');
    expect(result).toEqual({
      languageCode: 'es',
      scriptCode: 'Latn',
      territoryCode: '419',
      variantTagCodes: ['spanglis'],
    });
  });

  it('Handles 3-letter language codes and multiple variants "slv_Latn_SI_bohoric_nedis"', () => {
    const result = parseLocaleCode('slv_Latn_SI_bohoric_nedis');
    expect(result).toEqual({
      languageCode: 'slv',
      scriptCode: 'Latn',
      territoryCode: 'SI',
      variantTagCodes: ['bohoric', 'nedis'],
    });
  });

  it('Handles glottocode and short variant code "taib1242_Hant_TW_tailo"', () => {
    const result = parseLocaleCode('taib1242_Hant_TW_tailo');
    expect(result).toEqual({
      languageCode: 'taib1242',
      scriptCode: 'Hant',
      territoryCode: 'TW',
      variantTagCodes: ['tailo'],
    });
  });

  it('Throws error for invalid locale codes', () => {
    expect(() => parseLocaleCode('')).toThrow('Invalid locale code: ');
    expect(() => parseLocaleCode('1')).toThrow('Invalid locale code: 1');
  });
});

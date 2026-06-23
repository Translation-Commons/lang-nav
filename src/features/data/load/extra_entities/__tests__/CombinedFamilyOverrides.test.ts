import { describe, expect, it } from 'vitest';

import { EMPTY_LANGUAGES_BY_SCHEMA } from '@features/data/load/CoreData';

import { getBaseLanguageData, LanguageData } from '@entities/language/LanguageTypes';

import { applyCombinedFamilyOverrides } from '../CombinedFamilyOverrides';

function makeLang(id: string, parentCode?: string) {
  const lang = getBaseLanguageData(id, id);
  lang.Combined.parentLanguageCode = parentCode;
  lang.ISO.parentLanguageCode = parentCode;
  lang.Glottolog.parentLanguageCode = parentCode;
  return lang;
}

describe('applyCombinedFamilyOverrides', () => {
  it('sets Combined parent without changing ISO or Glottolog parents', () => {
    const sqi = makeLang('sqi', 'clas1257');
    const sqj = makeLang('sqj', 'ine');
    const languagesBySource = {
      ...EMPTY_LANGUAGES_BY_SCHEMA,
      Combined: { sqi, sqj },
      ISO: { sqi, sqj },
      Glottolog: { sqi, sqj },
    };

    applyCombinedFamilyOverrides(languagesBySource, [
      { parentLanguageCode: 'sqj', childLanguageCode: 'sqi' },
    ]);

    expect(sqi.Combined.parentLanguageCode).toBe('sqj');
    expect(sqi.ISO.parentLanguageCode).toBe('clas1257');
    expect(sqi.Glottolog.parentLanguageCode).toBe('clas1257');
  });

  it('applies explicit Formosan child overrides under fox', () => {
    const map = makeLang('map');
    const fox = makeLang('fox', 'map');
    const east2493 = makeLang('east2493', 'map');
    const pwn = makeLang('pwn', 'map');
    const poz = makeLang('poz', 'map');
    const languagesBySource = {
      ...EMPTY_LANGUAGES_BY_SCHEMA,
      Combined: { map, fox, east2493, pwn, poz },
    };

    applyCombinedFamilyOverrides(languagesBySource, [
      { parentLanguageCode: 'fox', childLanguageCode: 'east2493' },
      { parentLanguageCode: 'fox', childLanguageCode: 'pwn' },
    ]);

    expect(east2493.Combined.parentLanguageCode).toBe('fox');
    expect(pwn.Combined.parentLanguageCode).toBe('fox');
    expect(poz.Combined.parentLanguageCode).toBe('map');
  });

  it('skips entries missing Combined source objects', () => {
    const child = makeLang('sqi', 'clas1257');
    const parent = makeLang('sqj', 'ine');
    (child as LanguageData).Combined = undefined as unknown as LanguageData['Combined'];

    const languagesBySource = {
      ...EMPTY_LANGUAGES_BY_SCHEMA,
      Combined: { sqi: child, sqj: parent },
    };

    applyCombinedFamilyOverrides(languagesBySource, [
      { parentLanguageCode: 'sqj', childLanguageCode: 'sqi' },
    ]);

    expect(child.Combined).toBeUndefined();
  });
});

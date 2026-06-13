import { describe, expect, it } from 'vitest';

import { EMPTY_LANGUAGES_BY_SCHEMA } from '@features/data/load/CoreData';
import { getBaseLanguageData, LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

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

  it('applies map -> fox before reparenting other direct children of map', () => {
    const map = makeLang('map');
    map.scope = LanguageScope.Family;
    const fox = makeLang('fox');
    fox.scope = LanguageScope.Family;
    const poz = makeLang('poz', 'map');
    poz.scope = LanguageScope.Family;
    const ami = makeLang('ami', 'map');
    const mfe = makeLang('mfe', 'poz');
    const languagesBySource = {
      ...EMPTY_LANGUAGES_BY_SCHEMA,
      Combined: { map, fox, poz, ami, mfe },
    };

    applyCombinedFamilyOverrides(languagesBySource, [
      {
        parentLanguageCode: 'map',
        childLanguageCode: 'fox',
        rule: 'reparent-children-except:poz',
      },
    ]);

    expect(fox.Combined.parentLanguageCode).toBe('map');
    expect(poz.Combined.parentLanguageCode).toBe('map');
    expect(ami.Combined.parentLanguageCode).toBe('fox');
    expect(mfe.Combined.parentLanguageCode).toBe('poz');
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

import { describe, expect, it } from 'vitest';

import { getBaseLanguageData } from '../LanguageTypes';
import { setLanguageNames } from '../setLanguageNames';

describe('setLanguageNames', () => {
  it('should allow adding new names', () => {
    const lang = getBaseLanguageData('eng', 'English');
    setLanguageNames(lang, ['English', 'Modern English', 'Anglais']);
    expect(lang.names).toEqual(['English', 'Modern English', 'Anglais']);
  });

  it('names should include information from all sources', () => {
    const lang = getBaseLanguageData('ben', 'Bengali');
    lang.nameEndonym = 'বাংলা';
    lang.sourceSpecific.ISO.name = 'Bengali';
    lang.sourceSpecific.CLDR.name = 'Bangla';
    lang.sourceSpecific.Glottolog.name = 'Bengali';
    setLanguageNames(lang);
    expect(lang.names).toEqual(['Bengali', 'বাংলা', 'Bangla']);
  });

  it('should remove parentheticals when there are redundant names', () => {
    const lang = getBaseLanguageData('cmn', 'Mandarin');
    lang.sourceSpecific.ISO.name = 'Putonghua (Mandarin)';
    lang.sourceSpecific.Glottolog.name = 'Mandarin';
    setLanguageNames(lang);
    expect(lang.names).toEqual(['Mandarin', 'Putonghua']);
  });

  it('should keep parentheticals when they are elaborations', () => {
    const lang = getBaseLanguageData('nan', 'Min Nan');
    lang.sourceSpecific.ISO.name = 'Min Nan Chinese';
    setLanguageNames(lang, ['Min Nan (Chaochow, Teochow, Fukien, Taiwanese)', 'Formosan']);
    expect(lang.names).toEqual([
      'Min Nan',
      'Min Nan Chinese',
      'Min Nan (Chaochow, Teochow, Fukien, Taiwanese)',
      'Formosan',
    ]);
  });

  it('it should remove language family and macrolanguage parentheticals', () => {
    const lang = getBaseLanguageData('zho', 'Chinese');
    lang.sourceSpecific.ISO.name = 'Chinese (macrolanguage)';
    lang.sourceSpecific.Glottolog.name = 'Classical-Middle-Modern Sinitic';
    lang.nameEndonym = '中文';
    lang.names = ['Chinese (family)', 'Chinese'];
    setLanguageNames(lang);
    expect(lang.names).toEqual(['Chinese', '中文', 'Classical-Middle-Modern Sinitic']);
  });
});

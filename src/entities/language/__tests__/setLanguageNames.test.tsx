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
    lang.ISO.name = 'Bengali';
    lang.CLDR.name = 'Bangla';
    lang.Glottolog.name = 'Bengali';
    setLanguageNames(lang);
    expect(lang.names).toEqual(['Bengali', 'বাংলা', 'Bangla']);
  });

  it('should remove parentheticals when there are redundant names', () => {
    const lang = getBaseLanguageData('cmn', 'Mandarin');
    lang.ISO.name = 'Putonghua (Mandarin)';
    lang.Glottolog.name = 'Mandarin';
    setLanguageNames(lang);
    expect(lang.names).toEqual(['Mandarin', 'Putonghua']);
  });

  it('should keep parentheticals when they are elaborations', () => {
    const lang = getBaseLanguageData('nan', 'Min Nan');
    lang.ISO.name = 'Min Nan Chinese';
    setLanguageNames(lang, ['Min Nan (Chaochow, Teochow, Fukien, Taiwanese)', 'Formosan']);
    expect(lang.names).toEqual([
      'Min Nan',
      'Min Nan Chinese',
      'Min Nan (Chaochow, Teochow, Fukien, Taiwanese)',
      'Formosan',
    ]);
  });

  it('it should keep language family and macrolanguage parentheticals', () => {
    const lang = getBaseLanguageData('zho', 'Chinese');
    lang.ISO.name = 'Chinese (macrolanguage)';
    lang.Glottolog.name = 'Classical-Middle-Modern Sinitic';
    lang.nameEndonym = '中文';
    lang.names = ['Chinese (family)', 'Chinese'];
    setLanguageNames(lang);
    expect(lang.names).toEqual([
      'Chinese',
      '中文',
      'Chinese (macrolanguage)',
      'Classical-Middle-Modern Sinitic',
      'Chinese (family)',
    ]);
  });
});

import { describe, expect, it } from 'vitest';

import { SearchableField } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import getSearchableField from '../getSearchableField';

const mockedLanguage = getBaseLanguageData('en', 'English');
mockedLanguage.nameEndonym = 'ENGLISH';
mockedLanguage.names = ['English', 'Anglais', 'Inglés', 'Englisch', 'Inglese'];
mockedLanguage.ISO = { code: 'eng' };
mockedLanguage.Glottolog = { code: 'stan1293', name: 'Standard English' };

describe('getSearchableField', () => {
  it('returns first matching name for AllNames', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameAny, 'Ingl')).toBe('Inglés');
  });

  it('Searches on accent marks as well', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameAny, 'Ingle')).toBe('Inglés');
  });

  it('returns codeDisplay for Code', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.Code)).toBe('en');
  });

  it('returns the ISO code for CodeISO', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.CodeISO)).toBe('eng');
  });

  it('returns the Glottolog code for CodeGlottolog', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.CodeGlottolog)).toBe('stan1293');
  });

  it('returns nameEndonym for Endonym', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameEndonym)).toBe('ENGLISH');
  });

  it('returns nameDisplay for EngName', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameDisplay)).toBe('English');
  });

  it('returns the first match for CodeOrName', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.CodeOrNameAny)).toBe('English');
  });

  it('returns blank for NameISO since there is no ISO information', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameISO)).toBe('');
  });

  it('returns the Glottolog name for NameGlottolog', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameGlottolog)).toBe(
      'Standard English',
    );
  });
});

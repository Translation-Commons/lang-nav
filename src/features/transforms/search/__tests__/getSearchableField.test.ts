import { describe, expect, it } from 'vitest';

import { SearchableField } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import getSearchableField from '../getSearchableField';

const mockedLanguage = getBaseLanguageData('en', 'English');
mockedLanguage.nameEndonym = 'ENGLISH';
mockedLanguage.names = ['English', 'Anglais', 'Inglés', 'Englisch', 'Inglese'];

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

  it('returns nameEndonym for Endonym', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameEndonym)).toBe('ENGLISH');
  });

  it('returns nameDisplay for EngName', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameDisplay)).toBe('English');
  });

  it('returns nameDisplay and codeDisplay for NameOrCode', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameOrCode)).toBe('English [en]');
  });

  it('returns ??? for All', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.All)).toBe('English [en]');
  });

  it('returns ??? for NameISO', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameISO)).toBe('English [en]');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { SearchableField } from '@widgets/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import { HighlightedObjectField, getSearchableField } from '@entities/ui/ObjectField';

vi.mock('@widgets/PageParamsProvider', () => ({
  usePageParams: vi.fn(),
}));

const mockedLanguage = getBaseLanguageData('en', 'English');
mockedLanguage.nameEndonym = 'ENGLISH';
mockedLanguage.names = ['English', 'Anglais', 'Inglés', 'Englisch', 'Inglese'];

describe('HighlightedObjectField', () => {
  it('renders highlighted text', () => {
    render(
      <HighlightedObjectField
        object={mockedLanguage}
        field={SearchableField.EngName}
        query="Eng"
      />,
    );
    // There is no component with "English" because it is split into two spans
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.getByText('Eng')).toBeInTheDocument();
    expect(screen.getByText('lish')).toBeInTheDocument();
  });
});

describe('getSearchableField', () => {
  it('returns first matching name for AllNames', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.AllNames, 'Ingl')).toBe('Inglés');
  });

  it('does not yet search on accent marks, instead going to the next one', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.AllNames, 'Ingle')).toBe('Inglese');
  });

  it('returns codeDisplay for Code', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.Code)).toBe('en');
  });

  it('returns nameEndonym for Endonym', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.Endonym)).toBe('ENGLISH');
  });

  it('returns nameDisplay for EngName', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.EngName)).toBe('English');
  });

  it('returns nameDisplay and codeDisplay for NameOrCode', () => {
    expect(getSearchableField(mockedLanguage, SearchableField.NameOrCode)).toBe('English [en]');
  });
});

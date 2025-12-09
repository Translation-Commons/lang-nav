import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SearchableField } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import HighlightedObjectField from '../HighlightedObjectField';

const mockedLanguage = getBaseLanguageData('en', 'English');
mockedLanguage.nameEndonym = 'ENGLISH';
mockedLanguage.names = ['English', 'Anglais', 'Inglés', 'Englisch', 'Inglese'];

describe('HighlightedObjectField', () => {
  it('renders highlighted text', () => {
    render(
      <HighlightedObjectField
        object={mockedLanguage}
        field={SearchableField.NameDisplay}
        query="Eng"
      />,
    );
    // There is no component with "English" because it is split into two spans
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.getByText('Eng')).toBeInTheDocument();
    expect(screen.getByText('lish')).toBeInTheDocument();
  });

  it('renders highlighted that contained accent marks', () => {
    render(
      <HighlightedObjectField
        object={mockedLanguage}
        field={SearchableField.NameAny}
        query="Ingle"
      />,
    );
    // There is no component with "Inglés" because it is split into two spans
    expect(screen.queryByText('Inglés')).not.toBeInTheDocument();
    expect(screen.getByText('Inglé')).toBeInTheDocument(); // Accent mark is perserved
    expect(screen.getByText('s')).toBeInTheDocument();
  });
});

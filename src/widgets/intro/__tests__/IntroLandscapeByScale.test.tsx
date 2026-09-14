import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

import IntroLandscapeByScale from '../IntroLandscapeByScale';

function makeLanguage(ID: string, name: string, overall: number) {
  return {
    ...getBaseLanguageData(ID, name),
    scope: LanguageScope.Language,
    ISO: { status: LanguageISOStatus.Living },
    pop: { overall, speaking: {}, writing: {} },
  };
}

const family = {
  ...getBaseLanguageData('ine', 'Indo-European'),
  scope: LanguageScope.Family,
  ISO: { status: LanguageISOStatus.Living },
  pop: { overall: 9999, speaking: {}, writing: {} },
};

vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: vi.fn(() => ({
    languagesInSelectedSource: [
      makeLanguage('eng', 'English', 1500),
      makeLanguage('cmn', 'Mandarin', 1180),
      makeLanguage('hin', 'Hindi', 600),
      family,
    ],
  })),
}));

describe('IntroLandscapeByScale', () => {
  it('ranks living languages by population, excluding families', () => {
    render(<IntroLandscapeByScale />);

    const names = screen.getAllByText(/English|Mandarin|Hindi|Indo-European/);
    expect(names.map((el) => el.textContent)).toEqual(['English', 'Mandarin', 'Hindi']);
  });

  it('shows the population for each ranked language', () => {
    render(<IntroLandscapeByScale />);

    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('1,180')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
  });
});

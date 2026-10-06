import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, Mock, vi } from 'vitest';

import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import IntroLandscapeSidePanel from '../IntroLandscapeSidePanel';

const english = {
  ...getBaseLanguageData('eng', 'English'),
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
};
const portuguese = {
  ...getBaseLanguageData('por', 'Portuguese'),
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
  pop: { overall: 200000000, speaking: {}, writing: {} },
};
const portugueseInBrazil: LocaleData = {
  type: EntityType.Locale,
  ID: 'por_BR',
  codeDisplay: 'por_BR',
  localeSource: LocaleSource.StableDatabase,
  nameDisplay: 'Portuguese (Brazil)',
  names: ['Portuguese (Brazil)'],
  languageCode: 'por',
  language: portuguese,
  pop: { speaking: {}, writing: {} },
};
const brazil = {
  type: EntityType.Territory as const,
  ID: 'BR',
  codeDisplay: 'BR',
  nameDisplay: 'Brazil',
  names: ['Brazil'],
  scope: TerritoryScope.Country,
  pop: { overall: 0 },
  locales: [portugueseInBrazil],
};

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: vi.fn(() => ({
    languages: [english],
    writingSystems: [],
    getTerritory: vi.fn((id: string) => (id === 'BR' ? brazil : undefined)),
  })),
}));

describe('IntroLandscapeSidePanel', () => {
  it('shows the global snapshot when no lens or territory is selected', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ colorBy: Field.None }));
    render(<IntroLandscapeSidePanel />);

    expect(screen.getByText('Global snapshot')).toBeInTheDocument();
  });

  it('shows the Most spoken lens card when colorBy is Population', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ colorBy: Field.Population }));
    render(<IntroLandscapeSidePanel />);

    expect(screen.getByText('Lens: Most spoken')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows the territory dossier when entID is set, taking priority over a lens', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({ colorBy: Field.Population, entID: 'BR' }),
    );
    render(
      <MemoryRouter>
        <IntroLandscapeSidePanel />
      </MemoryRouter>,
    );

    expect(screen.getByText('Territory dossier')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('summarizes the living languages of the selected territory', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ entID: 'BR' }));
    render(
      <MemoryRouter>
        <IntroLandscapeSidePanel />
      </MemoryRouter>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('living languages')).toBeInTheDocument();
    expect(screen.getByText(/Portuguese:/)).toBeInTheDocument();
  });

  it('links to the locale table filtered to the selected territory', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ entID: 'BR' }));
    render(
      <MemoryRouter>
        <IntroLandscapeSidePanel />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'View all languages in Brazil' })).toHaveAttribute(
      'href',
      '/data?entType=Locale&territoryFilter=BR',
    );
  });

  it('clears the selected territory when "Clear selection" is clicked', async () => {
    const updatePageParams = vi.fn();
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({ entID: 'BR', updatePageParams }),
    );
    render(
      <MemoryRouter>
        <IntroLandscapeSidePanel />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(updatePageParams).toHaveBeenCalledWith({ entID: undefined });
  });
});

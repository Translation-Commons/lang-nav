import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, Mock, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import IntroLandscapeSidePanel from '../IntroLandscapeSidePanel';

const english = {
  ...getBaseLanguageData('eng', 'English'),
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
};
const brazil = {
  type: EntityType.Territory as const,
  ID: 'BR',
  codeDisplay: 'BR',
  nameDisplay: 'Brazil',
  names: ['Brazil'],
  scope: TerritoryScope.Country,
  pop: { overall: 0 },
  locales: [],
};

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: vi.fn(() => ({
    languagesInSelectedSource: [english],
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

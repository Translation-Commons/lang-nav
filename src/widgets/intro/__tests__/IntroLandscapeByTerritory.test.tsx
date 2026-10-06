import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, Mock, vi } from 'vitest';

import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import IntroLandscapeByTerritory from '../IntroLandscapeByTerritory';

const brazil = {
  type: EntityType.Territory as const,
  ID: 'BR',
  codeDisplay: 'BR',
  nameDisplay: 'Brazil',
  names: ['Brazil'],
  scope: TerritoryScope.Country,
  pop: { overall: 0 },
};

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: vi.fn(() => ({ territories: [brazil], getEntity: () => undefined })),
}));
vi.mock('@features/transforms/search/useTrackSearch', () => ({ default: () => vi.fn() }));
vi.mock('@features/map/EntityMap', () => ({ default: () => <div data-testid="entity-map" /> }));
vi.mock('../IntroLandscapeSidePanel', () => ({
  default: () => <div data-testid="side-panel" />,
}));

const lensButton = (name: string) =>
  within(screen.getByRole('group', { name: 'Map lens' })).getByRole('button', { name });

describe('IntroLandscapeByTerritory', () => {
  it('forces entType to Territory on mount so EntityMap draws territories', async () => {
    const updatePageParams = vi.fn();
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({ entType: EntityType.Language, updatePageParams }),
    );
    await act(async () => render(<IntroLandscapeByTerritory />));

    expect(updatePageParams).toHaveBeenCalledWith({ entType: EntityType.Territory });
  });

  it('selects a territory picked from the search', async () => {
    const updatePageParams = vi.fn();
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({ entType: EntityType.Territory, updatePageParams }),
    );
    render(<IntroLandscapeByTerritory />);

    await userEvent.type(screen.getByRole('combobox'), 'bra');
    await userEvent.click(await screen.findByRole('option', { name: /Brazil/ }));

    expect(updatePageParams).toHaveBeenCalledWith({ entID: 'BR' });
  });

  it('sets colorBy when a lens chip is clicked, and clears it on a second click', async () => {
    const updatePageParams = vi.fn();
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        entType: EntityType.Territory,
        colorBy: Field.None,
        updatePageParams,
      }),
    );
    const { rerender } = render(<IntroLandscapeByTerritory />);

    await userEvent.click(lensButton('Most spoken'));
    expect(updatePageParams).toHaveBeenCalledWith({ colorBy: Field.Population });

    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        entType: EntityType.Territory,
        colorBy: Field.Population,
        updatePageParams,
      }),
    );
    rerender(<IntroLandscapeByTerritory />);

    await userEvent.click(lensButton('Most spoken'));
    expect(updatePageParams).toHaveBeenCalledWith({ colorBy: Field.None });
  });
});

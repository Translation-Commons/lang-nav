import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, Mock, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import IntroLandscapeByTerritory from '../IntroLandscapeByTerritory';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/data/context/useEntities', () => ({ default: vi.fn(() => []) }));
vi.mock('@features/transforms/search/useTrackSearch', () => ({ default: () => vi.fn() }));
vi.mock('@features/transforms/search/useIntroLandscapeTerritorySuggestions', () => ({
  default: () => vi.fn().mockResolvedValue([]),
}));
vi.mock('@features/map/EntityMap', () => ({ default: () => <div data-testid="entity-map" /> }));
vi.mock('../IntroLandscapeSidePanel', () => ({
  default: () => <div data-testid="side-panel" />,
}));

describe('IntroLandscapeByTerritory', () => {
  it('forces entType to Territory on mount so EntityMap draws territories', () => {
    const updatePageParams = vi.fn();
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({ entType: EntityType.Language, updatePageParams }),
    );
    render(<IntroLandscapeByTerritory />);

    expect(updatePageParams).toHaveBeenCalledWith({ entType: EntityType.Territory });
  });

  it('renders the map and side panel', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({ entType: EntityType.Territory }),
    );
    render(<IntroLandscapeByTerritory />);

    expect(screen.getByTestId('entity-map')).toBeInTheDocument();
    expect(screen.getByTestId('side-panel')).toBeInTheDocument();
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

    await userEvent.click(screen.getByRole('button', { name: 'Most spoken' }));
    expect(updatePageParams).toHaveBeenCalledWith({ colorBy: Field.Population });

    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        entType: EntityType.Territory,
        colorBy: Field.Population,
        updatePageParams,
      }),
    );
    rerender(<IntroLandscapeByTerritory />);

    await userEvent.click(screen.getByRole('button', { name: 'Most spoken' }));
    expect(updatePageParams).toHaveBeenCalledWith({ colorBy: Field.None });
  });
});

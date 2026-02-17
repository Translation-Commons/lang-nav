import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';
import { ObjectType, PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { TerritoryScope } from '@entities/types/DataTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import CardList from '../CardList';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({}),
}));
vi.mock('@features/transforms/filtering/useFilteredObjects', () => ({ default: vi.fn() }));
vi.mock('@features/transforms/coloring/useColors', () => ({
  default: vi.fn().mockReturnValue({ getColor: () => 'inherit' }),
}));

describe('CardList', () => {
  const mockedObjects = getFullyInstantiatedMockedObjects();
  const territories = Object.values(mockedObjects)
    .filter((obj) => obj.type === ObjectType.Territory)
    .sort(sortByPopulation);

  // Helper function to eliminate mock setup duplication
  function setupMockParams(overrides: PageParamsOptional = {}) {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams(overrides));
  }

  function setupMockFilteredObjects(countryOnly: boolean = false) {
    (useFilteredObjects as Mock).mockReturnValue({
      filteredObjects: territories.filter(
        (obj) => !countryOnly || obj.scope === TerritoryScope.Country,
      ),
      allObjectsInType: territories,
    });
  }

  beforeEach(() => {
    setupMockParams();
    setupMockFilteredObjects();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a list of cards', () => {
    const { container } = render(<CardList />);
    const cards = container.getElementsByClassName('CardInCardList');

    // These are the territories from the mocked data, sorted by population descending
    expect(cards[0]).toHaveTextContent('Arda');
    expect(cards[1]).toHaveTextContent('Middle Earth');
    expect(cards[2]).toHaveTextContent('Aman');
    expect(cards[3]).toHaveTextContent('Harad');
    expect(cards[4]).toHaveTextContent('Beleriand');
    expect(cards[5]).toHaveTextContent('Eriador');
  });

  it('applies pagination to filtered results', () => {
    setupMockParams({ limit: 2, page: 2 });

    const { container } = render(<CardList />);
    const cards = container.getElementsByClassName('CardInCardList');
    expect(cards.length).toBe(2);

    expect(cards[0]).toHaveTextContent('Aman');
    expect(cards[1]).toHaveTextContent('Harad');
  });

  it('when the objects are filtered, the visible item meter shows correct counts', () => {
    setupMockFilteredObjects(true); // countryOnly = true

    const { container, getAllByText } = render(<CardList />);

    // Meter appears correctly
    expect(container).toHaveTextContent('Showing 4 results.');
    expect(container).toHaveTextContent('2 filtered out.');

    // There are 4 country-scope territories in the mocked data
    const meters = getAllByText(/Showing/);
    expect(meters.length).toBe(2); // One at top and one at bottom

    // Only the countries are shown
    const cards = container.getElementsByClassName('CardInCardList');
    expect(cards.length).toBe(4);
    expect(cards[0]).toHaveTextContent('Aman');
    expect(cards[1]).toHaveTextContent('Harad');
    expect(cards[2]).toHaveTextContent('Beleriand');
    expect(cards[3]).toHaveTextContent('Eriador');
  });

  it('Cards can be opened by clicking on them', () => {
    const { container } = render(<CardList />);
    const cards = container.getElementsByClassName('CardInCardList');

    // Click the first card (Arda)
    if (cards[0] instanceof HTMLElement) cards[0].click();

    // Expect the page params to have been updated with Arda's ID
    expect(usePageParams().updatePageParams).toHaveBeenCalledWith({ objectID: '001' });
  });

  it('Clicking on interactive elements inside the card does not open the card', () => {
    const { container } = render(<CardList />);
    const cards = container.getElementsByClassName('CardInCardList');

    // Add a button inside the first card for testing
    if (cards[0] instanceof HTMLElement) {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      cards[0].appendChild(button);

      // Click the button
      button.click();

      // Expect the page params NOT to have been updated with Arda's ID
      expect(usePageParams().updatePageParams).not.toHaveBeenCalledWith({ objectID: '001' });
    }
  });

  it('Cards can be accessed using keyboard navigation', () => {
    const { container } = render(<CardList />);
    const cards = container.getElementsByClassName('CardInCardList');

    // Focus the first card (Arda)
    if (cards[0] instanceof HTMLElement) {
      cards[0].focus();
      expect(document.activeElement).toBe(cards[0]);
    }

    // Press enter to open the card
    fireEvent.keyDown(cards[0], { key: 'Enter', code: 'Enter' });
    expect(usePageParams().updatePageParams).toHaveBeenCalledWith({ objectID: '001' });
  });
});

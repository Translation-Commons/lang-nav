import { render } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi, Mock } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';
import useFilteredObjects from '@features/filtering/useFilteredObjects';
import { ObjectType, PageParamsOptional } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import CardList from '../CardList';

vi.mock('@features/page-params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/hovercard/useHoverCard', () => ({ default: vi.fn().mockReturnValue({}) }));
vi.mock('@features/filtering/useFilteredObjects', () => ({ default: vi.fn() }));

describe('CardList', () => {
  const mockedObjects = getFullyInstantiatedMockedObjects();

  // Helper function to eliminate mock setup duplication
  function setupMockParams(overrides: PageParamsOptional = {}) {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams(overrides));
  }

  function setupMockFilteredObjects() {
    (useFilteredObjects as Mock).mockReturnValue({
      filteredObjects: Object.values(mockedObjects)
        .filter((obj) => obj.type === ObjectType.Territory)
        .sort((a, b) => b.population - a.population),
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
    const cards = container.getElementsByClassName('ViewCard');

    // These are the territories from the mocked data, sorted by population descending
    expect(cards[0]).toHaveTextContent('Arda');
    expect(cards[1]).toHaveTextContent('Middle Earth');
    expect(cards[2]).toHaveTextContent('Aman');
    expect(cards[3]).toHaveTextContent('Harad');
    expect(cards[4]).toHaveTextContent('Beleriand');
    expect(cards[5]).toHaveTextContent('Eriador');
  });

  it('shows details view when exactly one object is visible', () => {
    // Make filter return true only for the first object
    setupMockParams({ limit: 1 });
    const { container } = render(<CardList />);
    const cards = container.getElementsByClassName('ViewCard');

    // It should not render any card elements
    expect(cards.length).toBe(0);

    // Rather it will show the details view
    expect(container).toHaveTextContent('Arda arda');
    expect(container).toHaveTextContent('Contains:Middle Earth');
  });

  it('applies pagination to filtered results', () => {
    setupMockParams({ limit: 2, page: 2 });

    const { container } = render(<CardList />);
    const cards = container.getElementsByClassName('ViewCard');
    expect(cards.length).toBe(2);

    expect(cards[0]).toHaveTextContent('Aman');
    expect(cards[1]).toHaveTextContent('Harad');
  });
});

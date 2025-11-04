import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import * as FilterModule from '@features/filtering/filter';
import { ObjectType } from '@features/page-params/PageParamTypes';
import * as SortModule from '@features/sorting/sort';

import { ObjectData, TerritoryScope } from '@entities/types/DataTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import CardList from '../CardList';

vi.mock('@features/filtering/filter', () => ({
  getFilterBySubstring: vi.fn(),
  getFilterByTerritory: vi.fn(),
  getFilterByVitality: vi.fn(),
  getScopeFilter: vi.fn(),
  getSliceFunction: vi.fn(),
}));

vi.mock('@features/sorting/sort', () => ({ getSortFunction: vi.fn() }));

vi.mock('@features/page-params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams()),
}));
vi.mock('@features/hovercard/useHoverCard', () => ({ default: vi.fn().mockReturnValue({}) }));

describe('CardList', () => {
  const mockObjects: ObjectData[] = [
    {
      ID: '1',
      type: ObjectType.Territory,
      codeDisplay: 'T1',
      nameDisplay: 'Test Territory 1',
      names: ['Test Territory 1'],
      scope: TerritoryScope.Country,
      population: 1000,
      populationFromUN: 1000,
    },
    {
      ID: '2',
      type: ObjectType.Territory,
      codeDisplay: 'T2',
      nameDisplay: 'Test Territory 2',
      names: ['Test Territory 2'],
      scope: TerritoryScope.Country,
      population: 2000,
      populationFromUN: 2000,
    },
  ];

  const mockRenderCard = (object: ObjectData) => (
    <div data-testid={`card-${object.ID}`}>{object.nameDisplay}</div>
  );

  beforeEach(() => {
    // Set up default mock implementations
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(() => true);
    vi.mocked(FilterModule.getFilterByTerritory).mockReturnValue(() => true);
    vi.mocked(FilterModule.getFilterByVitality).mockReturnValue(() => true);
    vi.mocked(FilterModule.getScopeFilter).mockReturnValue(() => true);
    vi.mocked(FilterModule.getSliceFunction).mockReturnValue((items) => items);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(() => 0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a list of cards', () => {
    render(<CardList objects={mockObjects} renderCard={mockRenderCard} />);

    mockObjects.forEach((obj) => {
      expect(screen.getByTestId(`card-${obj.ID}`)).toBeInTheDocument();
      expect(screen.getByText(obj.nameDisplay)).toBeInTheDocument();
    });
  });

  it('applies filtering functions', () => {
    const mockSubstringFilter = vi.fn(() => true);
    const mockTerritoryFilter = vi.fn(() => true);
    const mockVitalityFilter = vi.fn(() => true);
    const mockScopeFilter = vi.fn(() => true);

    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(mockSubstringFilter);
    vi.mocked(FilterModule.getFilterByTerritory).mockReturnValue(mockTerritoryFilter);
    vi.mocked(FilterModule.getFilterByVitality).mockReturnValue(mockVitalityFilter);
    vi.mocked(FilterModule.getScopeFilter).mockReturnValue(mockScopeFilter);

    render(<CardList objects={mockObjects} renderCard={mockRenderCard} />);

    expect(mockSubstringFilter).toHaveBeenCalled();
    expect(mockTerritoryFilter).toHaveBeenCalled();
    expect(mockVitalityFilter).toHaveBeenCalled();
    expect(mockScopeFilter).toHaveBeenCalled();
  });

  it('applies sorting function', () => {
    const mockSort = vi.fn(() => 0);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(mockSort);

    render(<CardList objects={mockObjects} renderCard={mockRenderCard} />);

    expect(mockSort).toHaveBeenCalled();
  });

  it('handles filtering that excludes all objects', () => {
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(() => false);

    render(<CardList objects={mockObjects} renderCard={mockRenderCard} />);

    mockObjects.forEach((obj) => {
      expect(screen.queryByTestId(`card-${obj.ID}`)).not.toBeInTheDocument();
    });
  });

  it('shows details view when exactly one object is visible', () => {
    // Make filter return true only for the first object
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue((obj) => obj.ID === '1');

    render(<CardList objects={mockObjects} renderCard={mockRenderCard} />);

    // Should show details container instead of card grid
    expect(screen.getByText('Test Territory 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Territory 2')).not.toBeInTheDocument();
  });

  it('applies slicing function to filtered results', () => {
    const mockSlice = vi.fn((items) => items.slice(0, 1));
    vi.mocked(FilterModule.getSliceFunction).mockReturnValue(mockSlice);

    render(<CardList objects={mockObjects} renderCard={mockRenderCard} />);

    expect(mockSlice).toHaveBeenCalled();
    // When only 1 item is visible, we show details instead of card
    expect(screen.getByText('Test Territory 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Territory 2')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { HoverCardProvider } from '@widgets/HoverCardContext';

import * as FilterModule from '@features/filtering/filter';
import PageParamsProvider from '@features/page-params/PageParamsProvider';
import { ObjectType } from '@features/page-params/PageParamTypes';
import * as SortModule from '@features/sorting/sort';

import { ObjectData, TerritoryScope } from '@entities/types/DataTypes';

import CardList from '../CardList';

vi.mock('@features/filtering/filter', () => ({
  getFilterBySubstring: vi.fn(),
  getFilterByTerritory: vi.fn(),
  getFilterByVitality: vi.fn(),
  getScopeFilter: vi.fn(),
  getSliceFunction: vi.fn(),
}));

vi.mock('@features/sorting/sort', () => ({
  getSortFunction: vi.fn(),
}));

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

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageParamsProvider>
        <HoverCardProvider>{children}</HoverCardProvider>
      </PageParamsProvider>
    </BrowserRouter>
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
    render(
      <TestWrapper>
        <CardList objects={mockObjects} renderCard={mockRenderCard} />
      </TestWrapper>,
    );

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

    render(
      <TestWrapper>
        <CardList objects={mockObjects} renderCard={mockRenderCard} />
      </TestWrapper>,
    );

    expect(mockSubstringFilter).toHaveBeenCalled();
    expect(mockTerritoryFilter).toHaveBeenCalled();
    expect(mockVitalityFilter).toHaveBeenCalled();
    expect(mockScopeFilter).toHaveBeenCalled();
  });

  it('applies sorting function', () => {
    const mockSort = vi.fn(() => 0);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(mockSort);

    render(
      <TestWrapper>
        <CardList objects={mockObjects} renderCard={mockRenderCard} />
      </TestWrapper>,
    );

    expect(mockSort).toHaveBeenCalled();
  });

  it('handles filtering that excludes all objects', () => {
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(() => false);

    render(
      <TestWrapper>
        <CardList objects={mockObjects} renderCard={mockRenderCard} />
      </TestWrapper>,
    );

    mockObjects.forEach((obj) => {
      expect(screen.queryByTestId(`card-${obj.ID}`)).not.toBeInTheDocument();
    });
  });

  it('shows details view when exactly one object is visible', () => {
    // Make filter return true only for the first object
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue((obj) => obj.ID === '1');

    render(
      <TestWrapper>
        <CardList objects={mockObjects} renderCard={mockRenderCard} />
      </TestWrapper>,
    );

    // Should show details container instead of card grid
    expect(screen.getByText('Test Territory 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Territory 2')).not.toBeInTheDocument();
  });

  it('applies slicing function to filtered results', () => {
    const mockSlice = vi.fn((items) => items.slice(0, 1));
    vi.mocked(FilterModule.getSliceFunction).mockReturnValue(mockSlice);

    render(
      <TestWrapper>
        <CardList objects={mockObjects} renderCard={mockRenderCard} />
      </TestWrapper>,
    );

    expect(mockSlice).toHaveBeenCalled();
    // When only 1 item is visible, we show details instead of card
    expect(screen.getByText('Test Territory 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Territory 2')).not.toBeInTheDocument();
  });
});

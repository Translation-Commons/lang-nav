import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import * as FilterModule from '@features/transforms/filtering/filter';
import * as ConnectionFilters from '@features/transforms/filtering/filterByConnections';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';
import * as SortModule from '@features/transforms/sorting/sort';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { ObjectData, TerritoryScope } from '@entities/types/DataTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import ObjectTable from '../InteractiveObjectTable';
import TableColumn from '../TableColumn';
import TableID from '../TableID';
import TableValueType from '../TableValueType';

vi.mock('@features/transforms/filtering/filter', () => ({
  getFilterByVitality: vi.fn(),
  getScopeFilter: vi.fn(),
  getFilterByLanguageScope: vi.fn(),
  getFilterByTerritoryScope: vi.fn(),
}));

vi.mock('@features/transforms/filtering/filterByConnections', () => ({
  getFilterByConnections: vi.fn(),
  getFilterByTerritory: vi.fn().mockReturnValue(() => true),
  getFilterByWritingSystem: vi.fn().mockReturnValue(() => true),
  getFilterByLanguage: vi.fn().mockReturnValue(() => true),
}));

vi.mock('@features/transforms/sorting/sort', () => ({
  getSortFunction: vi.fn(),
  getNormalSortDirection: vi.fn().mockReturnValue(1),
}));

vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({}),
}));
vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/transforms/search/getFilterBySubstring', () => ({ default: vi.fn() }));

describe('InteractiveObjectTable', () => {
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

  const mockColumns: TableColumn<ObjectData>[] = [
    {
      key: 'Name',
      render: (obj) => obj.nameDisplay,
      sortParam: SortBy.Name,
      valueType: TableValueType.String,
    },
    {
      key: 'Population',
      render: (obj) => {
        if (obj.type === ObjectType.Territory) {
          return obj.population.toLocaleString();
        }
        return '';
      },
      sortParam: SortBy.Population,
      valueType: TableValueType.Population,
    },
  ];

  beforeEach(() => {
    // Set up default mock implementations
    vi.mocked(getFilterBySubstring).mockReturnValue(() => true);
    vi.mocked(ConnectionFilters.getFilterByConnections).mockReturnValue(() => true);
    vi.mocked(FilterModule.getFilterByVitality).mockReturnValue(() => true);
    vi.mocked(FilterModule.getFilterByLanguageScope).mockReturnValue(() => true);
    vi.mocked(FilterModule.getFilterByTerritoryScope).mockReturnValue(() => true);
    vi.mocked(FilterModule.getScopeFilter).mockReturnValue(() => true);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(() => 0);
    vi.mocked(usePageParams).mockReturnValue(createMockUsePageParams({ sortBy: SortBy.Name }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to eliminate render wrapper duplication
  const renderObjectTable = (props = {}) => {
    return render(
      <ObjectTable
        objects={mockObjects}
        columns={mockColumns}
        tableID={TableID.Territories}
        {...props}
      />,
    );
  };

  // Helper function to eliminate rerender duplication
  const rerenderObjectTable = (rerender: (ui: React.ReactElement) => void, props = {}) => {
    rerender(
      <ObjectTable
        objects={mockObjects}
        columns={mockColumns}
        tableID={TableID.Territories}
        {...props}
      />,
    );
  };

  // Helper function to eliminate column header assertions
  const expectColumnHeaders = (expectedCount = 2) => {
    expect(screen.getAllByRole('columnheader')).toHaveLength(expectedCount);
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Population/i })).toBeInTheDocument();
  };

  it('renders table with all columns and data', () => {
    renderObjectTable();

    // Check column headers
    expectColumnHeaders();

    // Check data rows
    mockObjects.forEach((obj) => {
      expect(screen.getByText(obj.nameDisplay)).toBeInTheDocument();
      if (obj.type === ObjectType.Territory) {
        expect(screen.getByText(obj.population.toLocaleString())).toBeInTheDocument();
      }
    });
  });

  it('applies filtering functions', () => {
    const mockSubstringFilter = vi.fn(() => true);
    const mockConnectionsFilter = vi.fn(() => true);
    const mockVitalityFilter = vi.fn(() => true);
    const mockScopeFilter = vi.fn(() => true);

    vi.mocked(getFilterBySubstring).mockReturnValue(mockSubstringFilter);
    vi.mocked(ConnectionFilters.getFilterByConnections).mockReturnValue(mockConnectionsFilter);
    vi.mocked(FilterModule.getFilterByVitality).mockReturnValue(mockVitalityFilter);
    vi.mocked(FilterModule.getScopeFilter).mockReturnValue(mockScopeFilter);

    renderObjectTable();

    expect(mockSubstringFilter).toHaveBeenCalled();
    expect(mockConnectionsFilter).toHaveBeenCalled();
    expect(mockVitalityFilter).toHaveBeenCalled();
    expect(mockScopeFilter).toHaveBeenCalled();
  });

  it('applies sorting function', () => {
    const mockSort = vi.fn(() => 0);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(mockSort);

    renderObjectTable();

    expect(mockSort).toHaveBeenCalled();
  });

  it('handles filtering that excludes all objects', () => {
    vi.mocked(getFilterBySubstring).mockReturnValue(() => false);

    renderObjectTable();

    mockObjects.forEach((obj) => {
      expect(screen.queryByText(obj.nameDisplay)).not.toBeInTheDocument();
    });
  });

  it('applies pagination to filtered results', () => {
    vi.mocked(usePageParams).mockReturnValue(createMockUsePageParams({ limit: 1, page: 2 }));

    renderObjectTable();

    expect(screen.queryByRole('cell', { name: 'Test Territory 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Test Territory 2' })).toBeInTheDocument();
  });

  it('formats numeric values correctly', () => {
    const numericObject = {
      ...mockObjects[0],
      population: 1234567,
    };

    renderObjectTable({ objects: [numericObject] });

    expect(screen.getByRole('cell', { name: '1,234,567' })).toBeInTheDocument();
  });

  it('disables search bar filter when shouldFilterUsingSearchBar is false', () => {
    const mockSubstringFilter = vi.fn();
    vi.mocked(getFilterBySubstring).mockReturnValue(mockSubstringFilter);

    renderObjectTable({ shouldFilterUsingSearchBar: false });

    expect(mockSubstringFilter).not.toHaveBeenCalled();
    mockObjects.forEach((obj) => {
      expect(screen.getByText(obj.nameDisplay)).toBeInTheDocument();
    });
  });

  it('handles column visibility toggling', async () => {
    const { rerender } = renderObjectTable();

    // Initially, both columns should be visible
    expectColumnHeaders();

    // Open column selector
    act(() => {
      fireEvent.click(screen.getByText(/2\/2 columns visible, click here to toggle/i));
    });

    // Click checkbox to hide Population column
    act(() => {
      const populationCheckbox = screen.getByRole('checkbox', { name: /population/i });
      fireEvent.click(populationCheckbox);
    });
    // manually changing the columns
    vi.mocked(usePageParams).mockReturnValue(
      createMockUsePageParams({ sortBy: SortBy.Name, columns: { [TableID.Territories]: 1n } }),
    );

    // Force rerender to ensure state updates are applied
    rerenderObjectTable(rerender);

    // Verify only Name column is visible
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /Population/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(1);

    // Click checkbox to show Population column again
    act(() => {
      const populationCheckbox = screen.getByRole('checkbox', { name: /population/i });
      fireEvent.click(populationCheckbox);
    });
    vi.mocked(usePageParams).mockReturnValue(
      createMockUsePageParams({ sortBy: SortBy.Name, columns: { [TableID.Territories]: 3n } }),
    );

    // Force rerender to ensure state updates are applied
    rerenderObjectTable(rerender);

    // Verify both columns are visible again
    expectColumnHeaders();

    // Clicking to turn off the name column does not affect visibility since it is the sort column
    act(() => {
      const nameCheckbox = screen.getByRole('checkbox', { name: /name/i });
      fireEvent.click(nameCheckbox);
    });

    // Force rerender to ensure state updates are applied
    rerenderObjectTable(rerender);

    // Both columns should still be visible
    expectColumnHeaders();
  });
});

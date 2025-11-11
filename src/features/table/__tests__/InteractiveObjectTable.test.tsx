import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import * as FilterModule from '@features/filtering/filter';
import * as ConnectionFilters from '@features/filtering/filterByConnections';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import * as SortModule from '@features/sorting/sort';
import { SortBy } from '@features/sorting/SortTypes';

import { ObjectData, TerritoryScope } from '@entities/types/DataTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import ObjectTable from '../InteractiveObjectTable';
import TableColumn from '../TableColumn';
import TableValueType from '../TableValueType';

vi.mock('@features/filtering/filter', () => ({
  getFilterBySubstring: vi.fn(),
  getFilterByVitality: vi.fn(),
  getScopeFilter: vi.fn(),
}));

vi.mock('@features/filtering/filterByConnections', () => ({
  getFilterByConnections: vi.fn(),
}));

vi.mock('@features/sorting/sort', () => ({
  getSortFunction: vi.fn(),
  getNormalSortDirection: vi.fn().mockReturnValue(1),
}));

vi.mock('@features/hovercard/useHoverCard', () => ({ default: vi.fn().mockReturnValue({}) }));
vi.mock('@features/page-params/usePageParams', () => ({ default: vi.fn() }));

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
      valueType: TableValueType.Numeric,
    },
  ];

  beforeEach(() => {
    // Set up default mock implementations
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(() => true);
    vi.mocked(ConnectionFilters.getFilterByConnections).mockReturnValue(() => true);
    vi.mocked(FilterModule.getFilterByVitality).mockReturnValue(() => true);
    vi.mocked(FilterModule.getScopeFilter).mockReturnValue(() => true);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(() => 0);
    vi.mocked(usePageParams).mockReturnValue(createMockUsePageParams({ sortBy: SortBy.Name }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to eliminate render wrapper duplication
  const renderObjectTable = (props = {}) => {
    return render(<ObjectTable objects={mockObjects} columns={mockColumns} {...props} />);
  };

  // Helper function to eliminate rerender duplication
  const rerenderObjectTable = (rerender: (ui: React.ReactElement) => void, props = {}) => {
    rerender(<ObjectTable objects={mockObjects} columns={mockColumns} {...props} />);
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

    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(mockSubstringFilter);
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
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(() => false);

    renderObjectTable();

    mockObjects.forEach((obj) => {
      expect(screen.queryByText(obj.nameDisplay)).not.toBeInTheDocument();
    });
  });

  it('shows details view when exactly one object is visible', () => {
    // Make filter return true only for the first object
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue((obj) => obj.ID === '1');

    renderObjectTable();

    // Should show details for the first object
    expect(screen.getByText('Test Territory 1', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.queryByText('Test Territory 2')).not.toBeInTheDocument();
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
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(mockSubstringFilter);

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

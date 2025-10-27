import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { HoverCardProvider } from '@widgets/HoverCardContext';

import * as FilterModule from '@features/filtering/filter';
import PageParamsProvider from '@features/page-params/PageParamsProvider';
import {
  ObjectType,
  LocaleSeparator,
  View,
  SearchableField,
} from '@features/page-params/PageParamTypes';
import { ProfileType } from '@features/page-params/Profiles';
import * as SortModule from '@features/sorting/sort';
import { SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { ObjectData, TerritoryScope } from '@entities/types/DataTypes';

import ObjectTable, { TableColumn, ValueType } from '../ObjectTable';

vi.mock('@features/filtering/filter', () => ({
  getFilterBySubstring: vi.fn(),
  getFilterByTerritory: vi.fn(),
  getFilterByVitality: vi.fn(),
  getScopeFilter: vi.fn(),
  getSliceFunction: vi.fn(),
}));

vi.mock('@features/sorting/sort', () => ({
  getSortFunction: vi.fn(),
  getNormalSortDirection: vi.fn().mockReturnValue(1),
}));

vi.mock('@features/page-params/usePageParams', () => ({
  usePageParams: vi.fn().mockReturnValue({
    vitalityISO: [],
    vitalityEth2013: [],
    vitalityEth2025: [],
    languageScopes: [],
    languageSource: LanguageSource.ISO,
    limit: 10,
    localeSeparator: LocaleSeparator.Underscore,
    objectType: ObjectType.Language,
    page: 0,
    profile: 'default' as ProfileType,
    searchBy: SearchableField.NameOrCode,
    searchString: '',
    sortBehavior: SortBehavior.Normal,
    sortBy: null as unknown as SortBy,
    setSortBy: vi.fn(),
    clearSortBy: vi.fn(),
    territoryFilter: '',
    territoryScopes: [],
    view: View.CardList,
    updatePageParams: vi.fn(),
  }),
}));

vi.mock('@features/stored-params/useStoredParams', () => {
  let storedValue = {};
  const mockStoredParams = vi
    .fn()
    .mockImplementation((_key: string, defaultValue: Record<string, boolean>) => {
      if (Object.keys(storedValue).length === 0) {
        storedValue = { ...defaultValue };
      }
      return {
        value: storedValue,
        setValue: vi
          .fn()
          .mockImplementation(
            (
              updater:
                | Record<string, boolean>
                | ((prev: Record<string, boolean>) => Record<string, boolean>),
            ) => {
              storedValue =
                typeof updater === 'function'
                  ? updater(storedValue)
                  : { ...storedValue, ...updater };
            },
          ),
        clear: vi.fn(),
        remove: vi.fn(),
      };
    });
  return { default: mockStoredParams };
});

describe('ObjectTable', () => {
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
      key: 'name',
      label: 'Name',
      render: (obj) => obj.nameDisplay,
      sortParam: SortBy.Name,
      valueType: ValueType.String,
    },
    {
      key: 'population',
      label: 'Population',
      render: (obj) => {
        if (obj.type === ObjectType.Territory) {
          return obj.population.toLocaleString();
        }
        return '';
      },
      sortParam: SortBy.Population,
      valueType: ValueType.Numeric,
    },
  ];

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

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageParamsProvider>
        <HoverCardProvider>{children}</HoverCardProvider>
      </PageParamsProvider>
    </BrowserRouter>
  );

  it('renders table with all columns and data', () => {
    render(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    // Check column headers
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Population/i })).toBeInTheDocument();

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
    const mockTerritoryFilter = vi.fn(() => true);
    const mockVitalityFilter = vi.fn(() => true);
    const mockScopeFilter = vi.fn(() => true);

    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(mockSubstringFilter);
    vi.mocked(FilterModule.getFilterByTerritory).mockReturnValue(mockTerritoryFilter);
    vi.mocked(FilterModule.getFilterByVitality).mockReturnValue(mockVitalityFilter);
    vi.mocked(FilterModule.getScopeFilter).mockReturnValue(mockScopeFilter);

    render(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
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
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    expect(mockSort).toHaveBeenCalled();
  });

  it('handles filtering that excludes all objects', () => {
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(() => false);

    render(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    mockObjects.forEach((obj) => {
      expect(screen.queryByText(obj.nameDisplay)).not.toBeInTheDocument();
    });
  });

  it('shows details view when exactly one object is visible', () => {
    // Make filter return true only for the first object
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue((obj) => obj.ID === '1');

    render(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    // Should show details for the first object
    expect(screen.getByText('Test Territory 1', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.queryByText('Test Territory 2')).not.toBeInTheDocument();
  });

  it('applies slicing function to filtered results', () => {
    const mockSlice = vi.fn((items) => items.slice(0, 1));
    vi.mocked(FilterModule.getSliceFunction).mockReturnValue(mockSlice);

    render(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    expect(mockSlice).toHaveBeenCalled();
    expect(screen.getByRole('cell', { name: 'Test Territory 1' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Test Territory 2' })).not.toBeInTheDocument();
  });

  it('formats numeric values correctly', () => {
    const numericObject = {
      ...mockObjects[0],
      population: 1234567,
    };

    render(
      <TestWrapper>
        <ObjectTable objects={[numericObject]} columns={mockColumns} />
      </TestWrapper>,
    );

    expect(screen.getByRole('cell', { name: '1,234,567' })).toBeInTheDocument();
  });

  it('disables search bar filter when shouldFilterUsingSearchBar is false', () => {
    const mockSubstringFilter = vi.fn();
    vi.mocked(FilterModule.getFilterBySubstring).mockReturnValue(mockSubstringFilter);

    render(
      <TestWrapper>
        <ObjectTable
          objects={mockObjects}
          columns={mockColumns}
          shouldFilterUsingSearchBar={false}
        />
      </TestWrapper>,
    );

    expect(mockSubstringFilter).not.toHaveBeenCalled();
    mockObjects.forEach((obj) => {
      expect(screen.getByText(obj.nameDisplay)).toBeInTheDocument();
    });
  });

  it('handles column visibility toggling', async () => {
    const { rerender } = render(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    // Initially, both columns should be visible
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Population/i })).toBeInTheDocument();

    // Open column selector
    await act(async () => {
      await fireEvent.click(screen.getByText(/2\/2 columns visible/i));
    });

    // Click checkbox to hide Population column
    await act(async () => {
      const populationCheckbox = screen.getByRole('checkbox', { name: /population/i });
      await fireEvent.click(populationCheckbox);
    });

    // Force rerender to ensure state updates are applied
    rerender(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    // Verify only Name column is visible
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /Population/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(1);

    // Click checkbox to show Population column again
    await act(async () => {
      const populationCheckbox = screen.getByRole('checkbox', { name: /population/i });
      await fireEvent.click(populationCheckbox);
    });

    // Force rerender to ensure state updates are applied
    rerender(
      <TestWrapper>
        <ObjectTable objects={mockObjects} columns={mockColumns} />
      </TestWrapper>,
    );

    // Verify both columns are visible again
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Population/i })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  });
});

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import * as FilterModule from '@features/transforms/filtering/filter';
import * as ConnectionFilters from '@features/transforms/filtering/filterByConnections';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';
import * as SortModule from '@features/transforms/sorting/sort';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import EntityTable from '../InteractiveEntityTable';
import TableColumn from '../TableColumn';
import TableID from '../TableID';

vi.mock('@features/transforms/filtering/filter', () => ({
  useFilterByVitality: vi.fn(),
  useScopeFilter: vi.fn(),
}));

vi.mock('@features/transforms/filtering/filterByConnections', () => ({
  getFilterByConnections: vi.fn(),
  buildFilterByLanguage: vi.fn().mockReturnValue(() => true),
  buildFilterByLanguageFamily: vi.fn().mockReturnValue(() => true),
  buildFilterByWritingSystem: vi.fn().mockReturnValue(() => true),
  buildFilterByTerritory: vi.fn().mockReturnValue(() => true),
}));

vi.mock('@features/transforms/sorting/sort', () => ({
  getSortFunction: vi.fn(),
  getNormalSortDirection: vi.fn().mockReturnValue(1),
}));

vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ showHoverCard: vi.fn(), hideHoverCard: vi.fn() }),
}));
vi.mock('@shared/hooks/useClickOutside', () => ({
  useClickOutside: vi.fn().mockReturnValue({ current: null }),
}));
vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/transforms/search/getFilterBySubstring', () => ({ default: vi.fn() }));

describe('InteractiveEntityTable', () => {
  const mockEnts: EntityData[] = [
    {
      ID: '1',
      type: EntityType.Territory,
      codeDisplay: 'T1',
      nameDisplay: 'Test Territory 1',
      names: ['Test Territory 1'],
      scope: TerritoryScope.Country,
      pop: { overall: 1000 },
    },
    {
      ID: '2',
      type: EntityType.Territory,
      codeDisplay: 'T2',
      nameDisplay: 'Test Territory 2',
      names: ['Test Territory 2'],
      scope: TerritoryScope.Country,
      pop: { overall: 2000 },
    },
  ];

  const mockColumns: TableColumn<EntityData>[] = [
    {
      key: 'Name',
      render: (ent) => ent.nameDisplay,
      field: Field.Name,
    },
    {
      key: 'Population',
      render: (ent) => {
        if (ent.type === EntityType.Territory) return ent.pop.overall.toLocaleString();
        return '';
      },
      field: Field.Population,
    },
  ];

  beforeEach(() => {
    // Set up default mock implementations
    vi.mocked(getFilterBySubstring).mockReturnValue(() => true);
    vi.mocked(ConnectionFilters.getFilterByConnections).mockReturnValue(() => true);
    vi.mocked(FilterModule.useFilterByVitality).mockReturnValue(() => true);
    vi.mocked(FilterModule.useScopeFilter).mockReturnValue(() => true);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(() => 0);
    vi.mocked(usePageParams).mockReturnValue(createMockUsePageParams({ sortBy: Field.Name }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to eliminate render wrapper duplication
  const renderEntityTable = (props = {}) => {
    return render(
      <EntityTable
        ents={mockEnts}
        columns={mockColumns}
        tableID={TableID.Territories}
        {...props}
      />,
    );
  };

  // Helper function to eliminate column header assertions. The count includes the
  // always-present pin column that is prepended to every table.
  const expectColumnHeaders = (expectedCount = 3) => {
    expect(screen.getAllByRole('columnheader')).toHaveLength(expectedCount);
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Population/i })).toBeInTheDocument();
  };

  it('renders table with all columns and data', () => {
    renderEntityTable();

    // Check column headers
    expectColumnHeaders();

    // Check data rows
    mockEnts.forEach((ent) => {
      expect(screen.getByText(ent.nameDisplay)).toBeInTheDocument();
      if (ent.type === EntityType.Territory) {
        expect(screen.getByText(ent.pop.overall.toLocaleString())).toBeInTheDocument();
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
    vi.mocked(FilterModule.useFilterByVitality).mockReturnValue(mockVitalityFilter);
    vi.mocked(FilterModule.useScopeFilter).mockReturnValue(mockScopeFilter);

    renderEntityTable();

    expect(mockSubstringFilter).toHaveBeenCalled();
    expect(mockConnectionsFilter).toHaveBeenCalled();
    expect(mockVitalityFilter).toHaveBeenCalled();
    expect(mockScopeFilter).toHaveBeenCalled();
  });

  it('applies sorting function', () => {
    const mockSort = vi.fn(() => 0);
    vi.mocked(SortModule.getSortFunction).mockReturnValue(mockSort);

    renderEntityTable();

    expect(mockSort).toHaveBeenCalled();
  });

  it('handles filtering that excludes all entities', () => {
    vi.mocked(getFilterBySubstring).mockReturnValue(() => false);

    renderEntityTable();

    mockEnts.forEach((ent) => {
      expect(screen.queryByText(ent.nameDisplay)).not.toBeInTheDocument();
    });
  });

  it('applies pagination to filtered results', () => {
    vi.mocked(usePageParams).mockReturnValue(createMockUsePageParams({ limit: 1, page: 2 }));

    renderEntityTable();

    expect(screen.queryByRole('cell', { name: 'Test Territory 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Test Territory 2' })).toBeInTheDocument();
  });

  it('formats numeric values correctly', () => {
    const numericEnt = {
      ...mockEnts[0],
      pop: { overall: 1234567 },
    };

    renderEntityTable({ ents: [numericEnt] });

    expect(screen.getByRole('cell', { name: (1234567).toLocaleString() })).toBeInTheDocument();
  });

  it('disables search bar filter when shouldFilterUsingSearchBar is false', () => {
    const mockSubstringFilter = vi.fn();
    vi.mocked(getFilterBySubstring).mockReturnValue(mockSubstringFilter);

    renderEntityTable({ shouldFilterUsingSearchBar: false });

    expect(mockSubstringFilter).not.toHaveBeenCalled();
    mockEnts.forEach((ent) => {
      expect(screen.getByText(ent.nameDisplay)).toBeInTheDocument();
    });
  });
});

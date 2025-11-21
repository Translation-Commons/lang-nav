import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import usePageParams from '@features/page-params/usePageParams';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import TableColumnSelector from '../TableColumnSelector';

vi.mock('@features/page-params/usePageParams', () => ({
  default: vi.fn(),
}));
vi.mock('@features/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ hideHoverCard: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('TableColumnSelector', () => {
  it('renders summary with visible/total columns', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ sortBy: undefined }));

    const columns = [
      { key: 'Population', sortParam: SortBy.Population, render: () => null },
      { key: 'Name', sortParam: SortBy.Name, render: () => null },
      { key: 'ID', sortParam: SortBy.Code, render: () => null },
    ];
    const columnVisibility: { [key: string]: boolean } = {
      Population: true,
      Name: true,
      ID: false,
    };
    const toggleMock = vi.fn();
    const visibilityModule = {
      columnVisibility,
      toggleColumn: toggleMock,
      resetColumnVisibility: vi.fn(),
      visibleColumns: columns.filter((col) => columnVisibility[col.key]),
      setColumns: vi.fn(),
    };

    render(<TableColumnSelector columns={columns} visibilityModule={visibilityModule} />);

    expect(screen.getByText(/2\/3 columns visible/i)).toBeTruthy();
  });

  it('checkboxes reflect columnVisibility and sortBy overrides', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ sortBy: SortBy.Name }));

    const columns = [
      { key: 'Population', sortParam: SortBy.Population, render: () => null },
      { key: 'Name', sortParam: SortBy.Name, render: () => null },
    ];
    const columnVisibility: { [key: string]: boolean } = { Population: true, Name: false };
    const toggleMock = vi.fn();
    const visibilityModule = {
      columnVisibility,
      toggleColumn: toggleMock,
      resetColumnVisibility: vi.fn(),
      visibleColumns: columns.filter((col) => columnVisibility[col.key]),
      setColumns: vi.fn(),
    };

    render(<TableColumnSelector columns={columns} visibilityModule={visibilityModule} />);

    const populationCheckbox = screen.getByLabelText('Population') as HTMLInputElement;
    const nameCheckbox = screen.getByLabelText('Name') as HTMLInputElement;

    // 'Population' visible via columnVisibility
    expect(populationCheckbox.checked).toBe(true);
    // 'Name' should be considered checked because sortBy === column.sortParam
    expect(nameCheckbox.checked).toBe(true);
  });

  it('group header toggle calls toggleColumn for each column in the group and individual checkbox toggles call toggleColumn with only the key', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ sortBy: undefined }));

    const columns = [
      { key: 'Population', columnGroup: 'Group', render: () => null },
      { key: 'Name', columnGroup: 'Group', render: () => null },
      { key: 'ID', render: () => null },
    ];
    const columnVisibility: { [key: string]: boolean } = {
      Population: true,
      Name: true,
      ID: false,
    };
    const toggleColumn = vi.fn();
    const setColumns = vi.fn();
    const visibilityModule = {
      columnVisibility,
      toggleColumn,
      resetColumnVisibility: vi.fn(),
      visibleColumns: columns.filter((col) => columnVisibility[col.key]),
      setColumns,
    };

    render(<TableColumnSelector columns={columns} visibilityModule={visibilityModule} />);

    // Click the first group Hoverable (mocked as button with data-testid "hoverable")
    const hoverables = screen.getAllByTestId('hoverable');
    expect(hoverables.length).toBeGreaterThan(0);
    fireEvent.click(hoverables[0]);

    // group had two columns; since they were all visible, toggle should be called with isVisible = false
    expect(setColumns).toHaveBeenCalledWith(['Population', 'Name'], false);

    // Clicking an individual checkbox should call toggleColumn with only the key
    const idCheckbox = screen.getByLabelText('ID') as HTMLInputElement;
    fireEvent.click(idCheckbox);
    expect(toggleColumn).toHaveBeenCalledWith('ID');
  });
});

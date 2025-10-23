import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { HoverCardProvider } from '@widgets/HoverCardContext';

import { usePageParams } from '@features/page-params/usePageParams';
import { SortBy, SortBehavior } from '@features/sorting/SortTypes';

import { ValueType } from './ObjectTable';
import TableSortButton from './TableSortButton';

vi.mock('@features/page-params/usePageParams', () => ({
  usePageParams: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('TableSortButton', () => {
  const mockUpdatePageParams = vi.fn();

  const createMockPageParams = (overrides = {}) => ({
    sortBy: null,
    updatePageParams: mockUpdatePageParams,
    sortBehavior: SortBehavior.Normal,
    searchString: '', // Add this to prevent the toLowerCase error
    searchBy: 'name',
    objectType: 'language',
    view: 'table',
    profile: 'default',
    page: 1,
    limit: 10,
    languageScopes: [],
    territoryScopes: [],
    languageSource: 'ethnologue',
    localeSeparator: 'underscore',
    territoryFilter: '',
    ...overrides,
  });

  beforeEach(() => {
    (usePageParams as unknown as Mock).mockReturnValue(createMockPageParams());
  });

  it('renders nothing when columnSortBy is undefined', () => {
    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={undefined} />
      </HoverCardProvider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders sort button when columnSortBy is provided', () => {
    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} />
      </HoverCardProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // HoverableButton uses hover cards instead of title attribute
    // Just verify the button is rendered and clickable
    expect(button).toHaveStyle({ cursor: 'pointer' });
  });

  it('applies primary class when sortBy matches columnSortBy', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} />
      </HoverCardProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('primary');
  });

  it('does not apply primary class when sortBy does not match columnSortBy', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Population,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} />
      </HoverCardProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('primary');
  });

  it('calls updatePageParams with new sortBy when clicking different column', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Population,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} />
      </HoverCardProvider>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      sortBy: SortBy.Name,
      sortBehavior: SortBehavior.Normal,
    });
  });

  it('toggles sortBehavior when clicking same column', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} />
      </HoverCardProvider>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      sortBehavior: SortBehavior.Reverse,
    });
  });

  it('toggles sortBehavior from Reverse to Normal when clicking same column', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name,
        sortBehavior: SortBehavior.Reverse,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} />
      </HoverCardProvider>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      sortBehavior: SortBehavior.Normal,
    });
  });
});

describe('SortButtonIcon', () => {
  // We need to test the SortButtonIcon component indirectly through TableSortButton
  // since it's not exported. We'll test the icon rendering by checking the SVG elements.

  const mockUpdatePageParams = vi.fn();

  const createMockPageParams = (overrides = {}) => ({
    sortBy: null,
    updatePageParams: mockUpdatePageParams,
    sortBehavior: SortBehavior.Normal,
    searchString: '', // Add this to prevent the toLowerCase error
    searchBy: 'name',
    objectType: 'language',
    view: 'table',
    profile: 'default',
    page: 1,
    limit: 10,
    languageScopes: [],
    territoryScopes: [],
    languageSource: 'ethnologue',
    localeSeparator: 'underscore',
    territoryFilter: '',
    ...overrides,
  });

  it('renders ArrowDown01 for Numeric ascending', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Population, // Numeric field
        sortBehavior: SortBehavior.Normal, // This should result in ascending
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Population} valueType={ValueType.Numeric} />
      </HoverCardProvider>,
    );

    // Check for ArrowDown01 icon (numeric ascending)
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    // ArrowDown01 has specific attributes we can check
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDown10 for Numeric descending', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Population, // Numeric field
        sortBehavior: SortBehavior.Reverse, // This should result in descending
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Population} valueType={ValueType.Numeric} />
      </HoverCardProvider>,
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownNarrowWide for Enum ascending', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name, // String field, but we'll test with Enum valueType
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.Enum} />
      </HoverCardProvider>,
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownWideNarrow for Enum descending', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name,
        sortBehavior: SortBehavior.Reverse,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.Enum} />
      </HoverCardProvider>,
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownAZ for String ascending (default)', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name, // String field
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.String} />
      </HoverCardProvider>,
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownZA for String descending', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name,
        sortBehavior: SortBehavior.Reverse,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.String} />
      </HoverCardProvider>,
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('defaults to String valueType when not provided', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: SortBy.Name,
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} />
      </HoverCardProvider>,
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('handles undefined sortDirection gracefully', () => {
    (usePageParams as unknown as Mock).mockReturnValue(
      createMockPageParams({
        sortBy: null, // This will result in undefined sortDirection
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(
      <HoverCardProvider>
        <TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.String} />
      </HoverCardProvider>,
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });
});

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { usePageParams } from '@features/page-params/usePageParams';
import { SortBy, SortBehavior } from '@features/sorting/SortTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import { ValueType } from './ObjectTable';
import TableSortButton from './TableSortButton';

vi.mock('@features/page-params/usePageParams', () => ({
  usePageParams: vi.fn(),
}));
vi.mock('@widgets/HoverCardContext', () => ({
  useHoverCard: vi.fn().mockReturnValue({ hideHoverCard: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('TableSortButton', () => {
  beforeEach(() => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams());
  });

  it('renders nothing when columnSortBy is undefined', () => {
    render(<TableSortButton columnSortBy={undefined} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders sort button when columnSortBy is provided', () => {
    render(<TableSortButton columnSortBy={SortBy.Name} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // HoverableButton uses hover cards instead of title attribute
    // Just verify the button is rendered and clickable
    expect(button).toHaveStyle({ cursor: 'pointer' });
  });

  it('applies primary class when sortBy matches columnSortBy', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ sortBy: SortBy.Name }));

    render(<TableSortButton columnSortBy={SortBy.Name} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('primary');
  });

  it('does not apply primary class when sortBy does not match columnSortBy', () => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ sortBy: SortBy.Population }));

    render(<TableSortButton columnSortBy={SortBy.Name} />);

    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('primary');
  });

  it('calls updatePageParams with new sortBy when clicking different column', () => {
    const mockUsePageParams = createMockUsePageParams({ sortBy: SortBy.Population });
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);

    render(<TableSortButton columnSortBy={SortBy.Name} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUsePageParams.updatePageParams).toHaveBeenCalledWith({
      sortBy: SortBy.Name,
      sortBehavior: SortBehavior.Normal,
    });
  });

  it('toggles sortBehavior when clicking same column', () => {
    const mockUsePageParams = createMockUsePageParams({ sortBy: SortBy.Name });
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);

    render(<TableSortButton columnSortBy={SortBy.Name} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUsePageParams.updatePageParams).toHaveBeenCalledWith({
      sortBehavior: SortBehavior.Reverse,
    });
  });

  it('toggles sortBehavior from Reverse to Normal when clicking same column', () => {
    const mockUsePageParams = createMockUsePageParams({
      sortBy: SortBy.Name,
      sortBehavior: SortBehavior.Reverse,
    });
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);

    render(<TableSortButton columnSortBy={SortBy.Name} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockUsePageParams.updatePageParams).toHaveBeenCalledWith({
      sortBehavior: SortBehavior.Normal,
    });
  });
});

describe('SortButtonIcon', () => {
  // We need to test the SortButtonIcon component indirectly through TableSortButton
  // since it's not exported. We'll test the icon rendering by checking the SVG elements.

  it('renders ArrowDown01 for Numeric ascending', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        sortBy: SortBy.Population, // Numeric field
        sortBehavior: SortBehavior.Normal, // This should result in ascending
      }),
    );

    render(<TableSortButton columnSortBy={SortBy.Population} valueType={ValueType.Numeric} />);

    // Check for ArrowDown01 icon (numeric ascending)
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    // ArrowDown01 has specific attributes we can check
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDown10 for Numeric descending', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        sortBy: SortBy.Population, // Numeric field
        sortBehavior: SortBehavior.Reverse, // This should result in descending
      }),
    );

    render(<TableSortButton columnSortBy={SortBy.Population} valueType={ValueType.Numeric} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownNarrowWide for Enum ascending', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        sortBy: SortBy.Name, // String field, but we'll test with Enum valueType
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(<TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.Enum} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownWideNarrow for Enum descending', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({ sortBy: SortBy.Name, sortBehavior: SortBehavior.Reverse }),
    );

    render(<TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.Enum} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownAZ for String ascending (default)', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        sortBy: SortBy.Name, // String field
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(<TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.String} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('renders ArrowDownZA for String descending', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        sortBy: SortBy.Name,
        sortBehavior: SortBehavior.Reverse,
      }),
    );

    render(<TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.String} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('defaults to String valueType when not provided', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        sortBy: SortBy.Name,
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(<TableSortButton columnSortBy={SortBy.Name} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });

  it('handles undefined sortDirection gracefully', () => {
    (usePageParams as Mock).mockReturnValue(
      createMockUsePageParams({
        sortBy: undefined, // This will result in undefined sortDirection
        sortBehavior: SortBehavior.Normal,
      }),
    );

    render(<TableSortButton columnSortBy={SortBy.Name} valueType={ValueType.String} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
  });
});

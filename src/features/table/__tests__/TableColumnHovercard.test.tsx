import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { LanguageData } from '@entities/language/LanguageTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import TableColumn from '../TableColumn';
import TableColumnHovercard from '../TableColumnHovercard';
import TableValueType from '../TableValueType';

// Mock dependencies
vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ hideHoverCard: vi.fn() }),
}));
vi.mock('@features/transforms/filtering/selectors/FilterSelector', () => ({
  default: vi.fn().mockReturnValue(<div data-testid="filter-selector" />),
}));
vi.mock('../getValueType', () => ({
  getValueTypeForColumn: vi.fn(() => TableValueType.String),
}));

describe('TableColumnHovercard', () => {
  let updatePageParams: (params: Partial<PageParams>) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: Partial<PageParams> = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };
  function getColumn(
    overrides: Partial<TableColumn<LanguageData>> = {},
  ): TableColumn<LanguageData> {
    return {
      key: 'testKey',
      render: () => null,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockParams({});
  });

  describe('Basic rendering', () => {
    it('should render column label', () => {
      const column = getColumn({ label: 'Test Label' });
      render(<TableColumnHovercard column={column} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render column key when label is not provided', () => {
      const column = getColumn({});
      render(<TableColumnHovercard column={column} />);
      expect(screen.getByText('testKey')).toBeInTheDocument();
    });

    it('should render column description when provided', () => {
      const column = getColumn({ label: 'Test Label', description: 'Test Description' });
      render(<TableColumnHovercard column={column} />);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const column = getColumn({ label: 'Test Label' });
      render(<TableColumnHovercard column={column} />);
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe('Sort controls', () => {
    it('should render sort controls when column is sortable', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Name });

      render(<TableColumnHovercard column={column} />);

      expect(screen.getByText('Sort')).toBeInTheDocument();
      expect(screen.getAllByText(/to/)).toBeTruthy();
    });

    it('should not render sort controls when column is not sortable', () => {
      const column = getColumn({ label: 'Test Label', field: Field.None });
      render(<TableColumnHovercard column={column} />);
      expect(screen.queryByText('Sort')).not.toBeInTheDocument();
    });

    it('should highlight active sort button', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Population });
      render(<TableColumnHovercard column={column} />);

      const primaryButton = screen.getAllByRole('button')[0];
      expect(primaryButton).toHaveClass('primary');
    });

    it('should call updatePageParams when sort button is clicked', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Name });
      render(<TableColumnHovercard column={column} />);

      const sortButtons = screen.getAllByRole('button');
      fireEvent.click(sortButtons[0]);

      expect(updatePageParams).toHaveBeenCalledWith({
        sortBy: Field.Name,
        sortBehavior: SortBehavior.Normal,
      });
    });

    it('should render tie-breaker button', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Name });
      render(<TableColumnHovercard column={column} />);
      expect(screen.getByText(/use as tie-breaker/)).toBeInTheDocument();
    });

    it('should highlight tie-breaker button when column is secondary sort', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Name });
      setupMockParams({
        sortBy: Field.Population,
        secondarySortBy: Field.Name,
      });

      render(<TableColumnHovercard column={column} />);

      const tiebreaker = screen.getByText(/use as tie-breaker/);
      expect(tiebreaker).toHaveClass('primary');
    });

    it('should call updatePageParams when tie-breaker button is clicked', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Name });
      setupMockParams({
        sortBy: Field.Population,
        secondarySortBy: undefined,
      });

      render(<TableColumnHovercard column={column} />);

      const tiebreaker = screen.getByText(/use as tie-breaker/);
      fireEvent.click(tiebreaker);

      expect(updatePageParams).toHaveBeenCalledWith({
        secondarySortBy: Field.Name,
      });
    });
  });

  describe('Filter controls', () => {
    it('should render filter controls when column is filterable', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Name });

      render(<TableColumnHovercard column={column} />);

      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-selector')).toBeInTheDocument();
    });

    it('should not render filter controls when column is not filterable', () => {
      const column = getColumn({ label: 'Test Label', field: Field.None });

      render(<TableColumnHovercard column={column} />);

      expect(screen.queryByText('Filter')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filter-selector')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle column without field', () => {
      const column = getColumn({ label: 'Test Label' });

      render(<TableColumnHovercard column={column} />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.queryByText('Sort')).not.toBeInTheDocument();
      expect(screen.queryByText('Filter')).not.toBeInTheDocument();
    });

    it('should handle both sortable and filterable columns', () => {
      const column = getColumn({ label: 'Test Label', field: Field.Name });

      render(<TableColumnHovercard column={column} />);

      expect(screen.getByText('Sort')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-selector')).toBeInTheDocument();
    });
  });
});

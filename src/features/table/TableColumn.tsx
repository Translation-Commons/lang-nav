import React from 'react';

import { SortBy } from '@features/sorting/SortTypes';

import TableValueType from './TableValueType';

interface TableColumn<T> {
  /** Unique key for the column, also used as the plain text header for the column in the export  */
  readonly key: string;
  /** Description shown when hovering over an info icon next to the column */
  readonly description?: React.ReactNode;
  /**  Label shown in the table; falls back to `key`. Useful to add additional markup */
  readonly label?: React.ReactNode;
  /** The group this column belongs to, used to organize columns in the UI */
  readonly columnGroup?: string;

  /** Function that renders rich React content for a cell */
  readonly render: (object: T) => React.ReactNode;

  /**
   * Supply an explicit plain value for CSV export.
   * When not provided, the table will attempt to extract text from the result of
   * the `render` function. Use this when your render output contains icons,
   * links, or other complex markup and you want a clean text representation in
   * the exported CSV.
   */
  readonly exportValue?: (object: T) => string | number | boolean | null | undefined;

  /** Indicate the type of data in the column; influences sorting and alignment */
  readonly valueType?: TableValueType;

  /**
   * The sorting page parameter relevant to this column, adding this will
   * add a sorting icon next to the column header that can be clicked to enable
   * sorting by the data in this column as defined by `sort.tsx`.
   */
  readonly sortParam?: SortBy;

  /** Whether the column is visible by default in the UI */
  readonly isInitiallyVisible?: boolean;
}

export default TableColumn;

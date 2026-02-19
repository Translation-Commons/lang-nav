import React from 'react';

import Field from '@features/transforms/fields/Field';

import TableValueType from './TableValueType';

interface TableColumn<T> {
  /** Unique key for the column, also used as the plain text header for the column in the export  */
  readonly key: string;
  /** Human-readable name for the column header */
  readonly label?: React.ReactNode;
  /** Description shown when hovering over an info icon next to the column */
  readonly description?: React.ReactNode;
  /** The group this column belongs to, used to organize columns in the UI */
  readonly columnGroup?: string;
  /**
   * When shown in a column group its redundant to show the full label sometimes, for example,
   * if the column group is "Population" and the column is "Population (in Country)", the label
   * in the column group can just be "In Country" to avoid repetition.
   */
  readonly labelInColumnGroup?: React.ReactNode;

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
   * Most columns should have a corresponding common object Field that can use
   * a common function to access the relevant data for sorting and other purposes.
   */
  readonly field?: Field;

  /** Whether the column is visible by default in the UI */
  readonly isInitiallyVisible?: boolean;
}

export default TableColumn;

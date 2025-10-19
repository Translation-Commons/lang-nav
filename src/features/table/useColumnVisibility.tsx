import { useCallback, useMemo } from 'react';

import { usePageParams } from '@features/page-params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { TableColumn } from './ObjectTable';

function useColumnVisibility<T extends ObjectData>(
  columns: TableColumn<T>[],
): {
  toggleColumn: (columnKey: string, isVisible?: boolean) => void;
  visibleColumns: TableColumn<T>[];
  columnVisibility: Record<string, boolean>;
} {
  const { sortBy, columns: columnVisibilityBinaryEncoded, updatePageParams } = usePageParams();

  // columnVisibility maps column keys to whether they are visible
  //   const [columnVisibility, setColumnVisibility] = useState(() =>
  //     Object.fromEntries(columns.map((col) => [col.key, col.isInitiallyVisible ?? true])),
  //   );
  const defaultColumnVisibility = useMemo(
    () => Object.fromEntries(columns.map((col) => [col.key, col.isInitiallyVisible ?? true])),
    [columns],
  );

  // Compute a binary number representing the visibility of all columns
  const encodeColumnVisibility = useCallback(
    (columnVisibility: Record<string, boolean>) => {
      return columns.reduce<number>((acc, col, index) => {
        const key = col.key;
        const isVisible = columnVisibility[key] ?? true;
        return acc | ((isVisible ? 1 : 0) << index);
      }, 0);
    },
    [columns],
  );

  const decodeColumnVisibility = useCallback(
    (encoded: number) => {
      return columns.reduce<Record<string, boolean>>((acc, col, index) => {
        acc[col.key] = Boolean((encoded >> index) & 1);
        return acc;
      }, {});
    },
    [columns],
  );

  const columnVisibility = useMemo(() => {
    if (typeof columnVisibilityBinaryEncoded === 'number') {
      return decodeColumnVisibility(columnVisibilityBinaryEncoded);
    }
    return defaultColumnVisibility;
  }, [columnVisibilityBinaryEncoded, decodeColumnVisibility, defaultColumnVisibility]);

  const toggleColumn = useCallback(
    (columnKey: string, isVisible?: boolean) => {
      const currentVisibility = columnVisibilityBinaryEncoded
        ? decodeColumnVisibility(columnVisibilityBinaryEncoded)
        : defaultColumnVisibility;
      const newVisibility = {
        ...currentVisibility,
        [columnKey]: isVisible ?? !currentVisibility[columnKey],
      };
      const encoded = encodeColumnVisibility(newVisibility);
      if (encoded) updatePageParams({ columns: encoded });
    },
    [
      columnVisibilityBinaryEncoded,
      decodeColumnVisibility,
      encodeColumnVisibility,
      updatePageParams,
    ],
  );

  const visibleColumns = useMemo(
    () => columns.filter((column) => columnVisibility[column.key] || column.sortParam === sortBy),
    [columns, columnVisibility, sortBy],
  );

  // Placeholder for future implementation of column visibility logic
  return { visibleColumns, toggleColumn, columnVisibility };
}

export default useColumnVisibility;

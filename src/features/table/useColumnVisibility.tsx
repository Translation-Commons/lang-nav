import { useCallback, useMemo } from 'react';

import { usePageParams } from '@features/page-params/usePageParams';
import useStoredParams from '@features/stored-params/useStoredParams';

import { ObjectData } from '@entities/types/DataTypes';

import { TableColumn } from './ObjectTable';

function useColumnVisibility<T extends ObjectData>(
  columns: TableColumn<T>[],
): {
  toggleColumn: (columnKey: string, isVisible?: boolean) => void;
  visibleColumns: TableColumn<T>[];
  columnVisibility: Record<string, boolean>;
} {
  const { sortBy } = usePageParams();

  const defaultColumnVisibility = useMemo(
    () => Object.fromEntries(columns.map((col) => [col.key, col.isInitiallyVisible ?? true])),
    [columns],
  );

  // allColumnVisibility maps column keys to whether they are visible, persisted in stored params
  // Column keys that are reused (like ID, Name) are reused so if you turn on/off an ID column
  // then switch table views the state will remain.
  const { value: allColumnVisibility, setValue: setAllColumnVisibility } = useStoredParams<
    Record<string, boolean>
  >('column-visibility', defaultColumnVisibility);

  const toggleColumn = useCallback(
    (columnKey: string, isVisible?: boolean) => {
      setAllColumnVisibility((prev) => {
        const newVisibility = {
          ...prev,
          [columnKey]: isVisible ?? !prev[columnKey],
        };
        return newVisibility;
      });
    },
    [setAllColumnVisibility],
  );

  // columnVisibility maps column keys to whether they are visible
  // These are limited to the columns relevant to the current table
  const columnVisibility = useMemo(() => {
    return columns.reduce<Record<string, boolean>>((acc, col) => {
      acc[col.key] =
        (col.sortParam === sortBy || allColumnVisibility[col.key]) ??
        defaultColumnVisibility[col.key];
      return acc;
    }, {});
  }, [allColumnVisibility, columns]);

  const visibleColumns = useMemo(
    () => columns.filter((column) => columnVisibility[column.key]),
    [columns, columnVisibility, sortBy],
  );

  return { visibleColumns, toggleColumn, columnVisibility };
}

export default useColumnVisibility;

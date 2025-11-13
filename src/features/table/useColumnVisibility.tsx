import { useCallback, useMemo } from 'react';

import usePageParams from '@features/page-params/usePageParams';
import useStoredParams from '@features/stored-params/useStoredParams';

import { ObjectData } from '@entities/types/DataTypes';

import TableColumn from './TableColumn';
import TableID from './TableID';

function useColumnVisibility<T extends ObjectData>(
  columns: TableColumn<T>[],
  tableID: TableID,
): {
  toggleColumn: (columnKey: string, isVisible?: boolean) => void;
  visibleColumns: TableColumn<T>[];
  columnVisibility: Record<string, boolean>;
  resetColumnVisibility: () => void;
} {
  const { sortBy, updatePageParams, columns: visibleColumnsEncoded } = usePageParams();

  const defaultColumnVisibility = useMemo(
    () => Object.fromEntries(columns.map((col) => [col.key, col.isInitiallyVisible ?? true])),
    [columns],
  );

  // allColumnVisibility maps column keys to whether they are visible, persisted in stored params
  // Column keys that are reused (like ID, Name) are reused so if you turn on/off an ID column
  // then switch table views the state will remain.
  const {
    value: allColumnVisibility,
    setValue: setAllColumnVisibility,
    clear: resetColumnVisibility,
  } = useStoredParams<Record<string, boolean>>('column-visibility', defaultColumnVisibility);

  // iterate through the columns and for every visible column, set a bit to 1, else 0
  const visibleColumnsBinarized = columns.reduce(
    (bin, col, i) =>
      col.sortParam === sortBy || allColumnVisibility[col.key] ? bin + (1 << i) : bin,
    0,
  );

  const visibleColumnsDecoded = columns.reduce<Record<string, boolean>>((acc, col, i) => {
    acc[col.key] =
      ((visibleColumnsBinarized >> i) & 1) === 1 ||
      (allColumnVisibility[col.key] ?? defaultColumnVisibility[col.key]);
    return acc;
  }, {});

  // const visibleColumnsBinary = columns.map((col, i) =>
  //   (col.sortParam === sortBy || allColumnVisibility[col.key]) ??
  //   defaultColumnVisibility[col.key]
  //     ? '1'
  //     : '0',
  // ).join('');

  // const visibleColumnsEncoded = useMemo(() => {visibleColumnsBinary

  // const compressedVisibility = LZString.compressToEncodedURIComponent(
  //   JSON.stringify(allColumnVisibility),
  // );

  // useEffect(() => {
  //   // Update the URL param when allColumnVisibility changes
  //   updatePageParams({ columns: compressedVisibility });
  // }, [allColumnVisibility, compressedVisibility]);

  // const decompressed = LZString.decompressFromEncodedURIComponent(visibleColumnsEncoded);
  // console.log(decompressed, visibleColumnsEncoded);

  const toggleColumn = useCallback(
    (columnKey: string, isVisible?: boolean) => {
      setAllColumnVisibility((prev) => ({
        ...prev,
        [columnKey]: isVisible ?? !prev[columnKey],
      }));
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
  }, [allColumnVisibility, columns, defaultColumnVisibility, sortBy]);

  const visibleColumns = useMemo(
    () => columns.filter((column) => columnVisibility[column.key]),
    [columns, columnVisibility],
  );

  return { visibleColumns, toggleColumn, columnVisibility, resetColumnVisibility };
}

export default useColumnVisibility;

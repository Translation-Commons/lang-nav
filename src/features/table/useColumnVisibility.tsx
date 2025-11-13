import { useCallback, useMemo } from 'react';

import { TableIDToBinarizedColumnVisibility } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { SortBy } from '@features/sorting/SortTypes';

import { ObjectData } from '@entities/types/DataTypes';

import TableColumn from './TableColumn';
import TableID from './TableID';

export type ColumnVisibilityModule<T extends ObjectData> = {
  toggleColumn: (columnKey: string, isVisible?: boolean) => void;
  setColumns: (columnKeys: string[], isVisible: boolean) => void;
  visibleColumns: TableColumn<T>[];
  columnVisibility: Record<string, boolean>;
  resetColumnVisibility: () => void;
};

function useColumnVisibility<T extends ObjectData>(
  columns: TableColumn<T>[],
  tableID: TableID,
): ColumnVisibilityModule<T> {
  const { sortBy, updatePageParams, columns: columnsVisibleForAllTables } = usePageParams();

  const columnVisibilityBinarized = useMemo(() => {
    const tableBinary = columnsVisibleForAllTables?.[tableID];
    if (tableBinary != null) return tableBinary;
    return getDefaultColumnsBinary(columns, sortBy);
  }, [columnsVisibleForAllTables, tableID, columns, sortBy]);

  // columnVisibility maps column keys to whether they are visible
  const columnVisibility = useMemo(
    () => getColumnVisibilityFromBinary(columns, columnVisibilityBinarized),
    [columns, columnVisibilityBinarized],
  );

  const visibleColumns = useMemo(
    () => columns.filter((column) => columnVisibility[column.key]),
    [columns, columnVisibility],
  );

  const toggleColumn = useCallback(
    (columnKey: string) => {
      const binary = getBinaryForColumnVisibility(columns, {
        ...columnVisibility,
        [columnKey]: !columnVisibility[columnKey],
      });
      updatePageParams({
        columns: {
          ...columnsVisibleForAllTables,
          [tableID]: binary,
        },
      });
    },
    [columnsVisibleForAllTables, tableID, columnVisibility, columns, updatePageParams],
  );

  const setColumns = useCallback(
    (columnKeys: string[], isVisible: boolean) => {
      const binary = getBinaryForColumnVisibility(columns, {
        ...columnVisibility,
        ...Object.fromEntries(columnKeys.map((key) => [key, isVisible])),
      });
      updatePageParams({
        columns: {
          ...columnsVisibleForAllTables,
          [tableID]: binary,
        },
      });
    },
    [columnsVisibleForAllTables, tableID, columnVisibility, columns, updatePageParams],
  );

  const resetColumnVisibility = useCallback(() => {
    const newColumns = { ...columnsVisibleForAllTables };
    delete newColumns[tableID];
    updatePageParams({ columns: newColumns });
  }, [columnsVisibleForAllTables, tableID, columns, sortBy, updatePageParams]);

  return { visibleColumns, toggleColumn, setColumns, columnVisibility, resetColumnVisibility };
}

export default useColumnVisibility;

function getColumnVisibilityFromBinary<T extends ObjectData>(
  columns: TableColumn<T>[],
  binary: bigint,
): Record<string, boolean> {
  return columns.reduce<Record<string, boolean>>((acc, col, i) => {
    acc[col.key] = ((binary >> BigInt(i)) & 1n) === 1n;
    return acc;
  }, {});
}

function getBinaryForColumnVisibility<T extends ObjectData>(
  columns: TableColumn<T>[],
  columnVisibility: Record<string, boolean>,
): bigint {
  return columns.reduce(
    (bin, col, i) => (columnVisibility[col.key] ? bin + (1n << BigInt(i)) : bin),
    0n,
  );
}

function getDefaultColumnsBinary<T extends ObjectData>(
  columns: TableColumn<T>[],
  sortBy: SortBy,
): bigint {
  return columns.reduce(
    (bin, col, i) =>
      col.isInitiallyVisible !== false || col.sortParam === sortBy ? bin + (1n << BigInt(i)) : bin,
    0n,
  );
}

export function stringifyColumnVisibilityBinaries(
  binaries: TableIDToBinarizedColumnVisibility,
): string {
  return Object.entries(binaries)
    .map(([tableID, binary]) => `${tableID}-${binary.toString(36)}`)
    .join('_');
}

export function parseColumnVisibilityBinaries(str: string): TableIDToBinarizedColumnVisibility {
  const result: TableIDToBinarizedColumnVisibility = {};
  str.split('_').forEach((pair) => {
    const [tableID, binaryStr] = pair.split('-');
    const binary = parseBigInt(binaryStr);
    if (tableID) result[parseInt(tableID) as TableID] = binary;
  });
  return result;
}

// Source - https://stackoverflow.com/a
// Posted by AKX, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-12, License - CC BY-SA 4.0
function parseBigInt(numberString: string, keyspace = '0123456789abcdefghijklmnopqrstuvwxyz') {
  let result = 0n;
  const keyspaceLength = BigInt(keyspace.length);
  for (let i = 0; i < numberString.length; i++) {
    const value = keyspace.indexOf(numberString[i]);
    if (value === -1) throw new Error('invalid string');
    result = result * keyspaceLength + BigInt(value);
  }
  return result;
}

import React, { useMemo, useState, useCallback } from 'react';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getScopeFilter,
  getSliceFunction,
} from '../../../controls/filter';
import { usePageParams } from '../../../controls/PageParamsContext';
import { getSortFunction } from '../../../controls/sort';
import { ObjectData } from '../../../types/DataTypes';
import { SortBy } from '../../../types/SortTypes';
import VisibleItemsMeter from '../../VisibleItemsMeter';
import ObjectDetails from '../details/ObjectDetails';
import { DetailsContainer } from '../details/ObjectDetailsPage';
import ObjectTitle from '../ObjectTitle';

import './tableStyles.css';
import TableColumnSelector from './TableColumnSelector';
import TableSortButton from './TableSortButton';

/*
 * Helper functions used for CSV export.
 *
 * These helpers allow conversion of complex React nodes to plain strings and
 * proper escaping of values for comma‐separated value (CSV) files. When a
 * column does not provide its own `exportValue` function, the table will
 * attempt to derive text from the rendered node. These helpers live outside
 * of the component so that they are only defined once.
 */

/** Recursively extract plain text from a ReactNode. */
function nodeToText(node: React.ReactNode): string {
  if (node === null || node === undefined || node === false) return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).join(' ');
  }
  // Dive into children on React elements
  if (
    typeof node === 'object' &&
    (node as any).props !== undefined &&
    (node as any).props.children !== undefined
  ) {
    return nodeToText((node as any).props.children);
  }
  return '';
}

/** Escape a value for inclusion in a CSV cell. */
function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  // Escape quotes by doubling them and wrap fields containing commas, quotes or newlines in quotes
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export interface TableColumn<T> {
  /** Whether the column is visible by default in the UI */
  columnGroup?: string; // "Key" for the parent column
  isInitiallyVisible?: boolean;
  /** Flag a column as containing numeric values; influences sorting and alignment */
  isNumeric?: boolean;
  /** Unique key for the column */
  key: string;
  /** Optional header label shown in the table and export; falls back to `key` */
  label?: React.ReactNode;
  /** Function that renders rich React content for a cell */
  render: (object: T) => React.ReactNode;
  /** Optional: designate a sort parameter for this column */
  sortParam?: SortBy;
  /**
   * Optional: supply an explicit plain value for CSV export.
   * When not provided, the table will attempt to extract text from the result of
   * the `render` function. Use this when your render output contains icons,
   * links, or other complex markup and you want a clean text representation in
   * the exported CSV.
   */
  exportValue?: (object: T) => string | number | boolean | null | undefined;
}

interface Props<T> {
  objects: T[];
  columns: TableColumn<T>[];
  shouldFilterUsingSearchBar?: boolean;
}

function ObjectTable<T extends ObjectData>({
  objects,
  columns,
  shouldFilterUsingSearchBar = true,
}: Props<T>) {
  const { sortBy } = usePageParams();
  const sortFunction = getSortFunction();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByTerritory = getFilterByTerritory();
  const scopeFilter = getScopeFilter();

  const [visibleColumns, setVisibleColumns] = useState(() =>
    Object.fromEntries(columns.map((col) => [col.key, col.isInitiallyVisible ?? true])),
  );

  const toggleColumn = useCallback((columnKey: string, isVisible?: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: isVisible ?? !prev[columnKey],
    }));
  }, []);

  const currentlyVisibleColumns = useMemo(
    () => columns.filter((column) => visibleColumns[column.key] || column.sortParam === sortBy),
    [columns, visibleColumns, sortBy],
  );
  const sliceFunction = getSliceFunction<T>();

  // Track when the user initiates an export; used to disable the button while processing
  const [isExporting, setIsExporting] = useState(false);

  // TODO don't filter objects for an unrelated page search on a different object type
  const objectsFilteredAndSorted = useMemo(() => {
    return objects
      .filter(scopeFilter)
      .filter(filterByTerritory)
      .filter(filterBySubstring)
      .sort(sortFunction);
  }, [sortFunction, objects, filterBySubstring, filterByTerritory, scopeFilter]);

  /**
   * Build a CSV from the currently visible columns and the filtered+sorted objects
   * and trigger a download in the browser. When a column defines an
   * `exportValue` function, that value is used; otherwise the result of
   * `render` is converted to plain text via `nodeToText`.
   */
  const handleExportCsv = useCallback(() => {
    if (objectsFilteredAndSorted.length === 0) return;
    setIsExporting(true);
    try {
      // Determine which columns to export: respect current visibility
      const cols = currentlyVisibleColumns;
      // Compose header row
      const header = cols
        .map((c) => csvEscape(nodeToText(c.label ?? c.key)))
        .join(',');
      // Compose data rows
      const rows = objectsFilteredAndSorted.map((obj) => {
        return cols
          .map((col) => {
            let raw: unknown;
            if (typeof col.exportValue === 'function') {
              raw = col.exportValue(obj);
            } else {
              raw = nodeToText(col.render(obj));
            }
            return csvEscape(raw);
          })
          .join(',');
      });
      const csvContent = [header, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `export-${ts}.csv`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } finally {
      setIsExporting(false);
    }
  }, [objectsFilteredAndSorted, currentlyVisibleColumns]);

  return (
    <div className="ObjectTableContainer">

      <div
        style={{
          display: 'flex',
          gap: '.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '.5rem',
        }}
      >
        <VisibleItemsMeter
          objects={objects}
          shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
        />
       <TableColumnSelector
         columns={columns}
         currentlyVisibleColumns={currentlyVisibleColumns}
         visibleColumns={visibleColumns}
         toggleColumn={toggleColumn}
       />
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isExporting || objectsFilteredAndSorted.length === 0}
          title="Export visible rows & columns to CSV"
          style={{ padding: '.4rem .6rem', cursor: isExporting ? 'default' : 'pointer' }}
        >
          {isExporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      <details style={{ margin: '.5em 0 1em 0', gap: '.5em 1em' }}>
        <summary style={{ cursor: 'pointer' }}>
          {currentlyVisibleColumns.length}/{columns.length} columns visible, click here to toggle.
        </summary>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5em' }}>
          {columns.map((column) => (
            <label key={column.key} style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={visibleColumns[column.key] || false}
                onChange={() => toggleColumn(column.key)}
                style={{ marginRight: '0.5rem' }}
              />
              {column.label ?? column.key}
            </label>
          ))}
        </div>
      </details>
        
      <table className="ObjectTable">
        <thead>
          <tr>
            {currentlyVisibleColumns.map((column) => (
              <th key={column.key} style={{ textAlign: 'start' }}>
                {column.label ?? column.key}
                <TableSortButton columnSortBy={column.sortParam} isNumeric={column.isNumeric} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sliceFunction(objectsFilteredAndSorted).map((object, i) => (
            <tr key={object.ID || i}>
              {currentlyVisibleColumns.map((column) => {
                let content = column.render(object);
                if (typeof content === 'number') {
                  content = content.toLocaleString();
                }

                return (
                  <td key={column.key} className={column.isNumeric ? 'numeric' : undefined}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {objectsFilteredAndSorted.length === 1 && (
        <div style={{ marginTop: '1em' }}>
          <DetailsContainer title={<ObjectTitle object={objectsFilteredAndSorted[0]} />}>
            <ObjectDetails object={objectsFilteredAndSorted[0]} />
          </DetailsContainer>
        </div>
      )}
    </div>
  );
}
export default ObjectTable;

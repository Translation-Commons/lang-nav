import React, { useCallback, useState } from 'react';

import { ObjectData } from '@entities/types/DataTypes';

import TableColumn from './TableColumn';

interface Props<T> {
  visibleColumns: TableColumn<T>[];
  objectsFilteredAndSorted: T[];
}

function TableExportButton<T extends ObjectData>({
  visibleColumns,
  objectsFilteredAndSorted,
}: Props<T>) {
  // Track when the user initiates an export; used to disable the button while processing
  const [isExporting, setIsExporting] = useState(false);

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
      // Compose header row
      const header = visibleColumns.map((c) => csvEscape(nodeToText(c.label ?? c.key))).join(',');
      // Compose data rows
      const rows = objectsFilteredAndSorted.map((obj) => {
        return visibleColumns
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
  }, [objectsFilteredAndSorted, visibleColumns]);

  return (
    <button
      type="button"
      onClick={handleExportCsv}
      disabled={isExporting || objectsFilteredAndSorted.length === 0}
      title="Export visible rows & columns to CSV"
      style={{ padding: '.4rem .6rem', cursor: isExporting ? 'default' : 'pointer' }}
    >
      {isExporting ? 'Exporting…' : 'Export CSV'}
    </button>
  );
}

export default TableExportButton;

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
  if (node == null || node === false) return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).join(' ');
  }
  // Dive into children on React elements
  React.Children.map(node, (child) => {
    return nodeToText(child);
  });
  if (React.isValidElement(node)) {
    return React.Children.map(node, (child) => {
      return nodeToText(child);
    }).join(' ');
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

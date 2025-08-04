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
import { SortBy } from '../../../types/PageParamTypes';
import VisibleItemsMeter from '../../VisibleItemsMeter';

import './tableStyles.css';
import TableSortButton from './TableSortButton';

export interface TableColumn<T> {
  isInitiallyVisible?: boolean;
  isNumeric?: boolean;
  key: string;
  label?: React.ReactNode; // otherwise will use key as label
  render: (object: T) => React.ReactNode;
  sortParam?: SortBy;
}

interface Props<T> {
  objects: T[];
  columns: TableColumn<T>[];
}

/**
 * A page that shows tips about problems in the data that may need to be addressed
 */
function ObjectTable<T extends ObjectData>({ objects, columns }: Props<T>) {
  const { sortBy } = usePageParams();
  const sortFunction = getSortFunction();
  const filterBySubstring = getFilterBySubstring();
  const filterByTerritory = getFilterByTerritory();
  const scopeFilter = getScopeFilter();

  const [visibleColumns, setVisibleColumns] = useState(() =>
    Object.fromEntries(columns.map((col) => [col.key, col.isInitiallyVisible ?? true])),
  );

  const toggleColumn = useCallback((columnKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  const currentlyVisibleColumns = useMemo(
    () => columns.filter((column) => visibleColumns[column.key] || column.sortParam === sortBy),
    [columns, visibleColumns, sortBy],
  );
  const sliceFunction = getSliceFunction<T>();

  const objectsFilteredAndSorted = useMemo(() => {
    return objects
      .filter(scopeFilter)
      .filter(filterByTerritory)
      .filter(filterBySubstring)
      .sort(sortFunction);
  }, [sortFunction, objects, filterBySubstring, filterByTerritory, scopeFilter]);

  return (
    <div className="ObjectTableContainer">
      <VisibleItemsMeter objects={objects} />
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
    </div>
  );
}
export default ObjectTable;

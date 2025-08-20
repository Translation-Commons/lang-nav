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
import ObjectDetails from '../details/ObjectDetails';
import { DetailsContainer } from '../details/ObjectDetailsPage';
import ObjectTitle from '../ObjectTitle';

import './tableStyles.css';
import TableSortButton from './TableSortButton';

export interface TableColumn<T> {
  isInitiallyVisible?: boolean;
  isNumeric?: boolean;
  key: string;
  label?: React.ReactNode;
  render: (object: T) => React.ReactNode;
  sortParam?: SortBy;
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

  // TODO don't filter objects for an unrelated page search on a different object type
  const objectsFilteredAndSorted = useMemo(() => {
    return objects
      .filter(scopeFilter)
      .filter(filterByTerritory)
      .filter(filterBySubstring)
      .sort(sortFunction);
  }, [sortFunction, objects, filterBySubstring, filterByTerritory, scopeFilter]);

  return (
    <div className="ObjectTableContainer">
      <VisibleItemsMeter
        objects={objects}
        shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
      />
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

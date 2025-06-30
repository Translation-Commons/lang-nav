import React, { Dispatch, SetStateAction, useMemo, useState, useCallback } from 'react';

import { getScopeFilter, getSliceFunction, getSubstringFilter } from '../../../controls/filter';
import { usePageParams } from '../../../controls/PageParamsContext';
import { getSortFunction } from '../../../controls/sort';
import HoverableButton from '../../../generic/HoverableButton';
import { ObjectData } from '../../../types/DataTypes';
import { SortBy } from '../../../types/PageParamTypes';
import VisibleItemsMeter from '../../VisibleItemsMeter';

import './tableStyles.css';

export interface TableColumn<T> {
  label?: React.ReactNode;
  render: (object: T) => React.ReactNode;
  key: string;
  isNumeric?: boolean;
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
  const { limit } = usePageParams();
  const sortBy = getSortFunction();
  const substringFilter = getSubstringFilter();
  const scopeFilter = getScopeFilter();
  const [sortDirectionIsNormal, setSortDirectionIsNormal] = useState(true);

  const [visibleColumns, setVisibleColumns] = useState(() =>
    Object.fromEntries(columns.map(col => [col.key, true]))
  );

  const toggleColumn = useCallback((columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  const currentlyVisibleColumns = useMemo(
    () => columns.filter(column => visibleColumns[column.key]),
    [columns, visibleColumns]
  );
  const sliceFunction = getSliceFunction<T>();

  const objectsFilteredAndSorted = useMemo(() => {
    let result = objects.filter(substringFilter ?? (() => true)).filter(scopeFilter);
    if (sortDirectionIsNormal) {
      result = result.sort(sortBy);
    } else {
      result = result.sort((a, b) => -sortBy(a, b));
    }
    return result;
  }, [sortBy, objects, substringFilter, scopeFilter, sortDirectionIsNormal]);
  const nRowsAfterFilter = useMemo(
    () => objectsFilteredAndSorted.length,
    [objectsFilteredAndSorted],
  );

  return (
    <div className="ObjectTableContainer">
      <VisibleItemsMeter
        nShown={nRowsAfterFilter < limit || limit < 1 ? nRowsAfterFilter : limit}
        nFiltered={nRowsAfterFilter}
        nOverall={objects.length}
        objectType={objects[0]?.type}
      />
      <div className="column-toggler" style={{ margin: '1rem 0', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <strong>Show/Hide Columns:</strong>
        {columns.map(column => (
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

      <table className="ObjectTable">
        <thead>
          <tr>
            {currentlyVisibleColumns.map(column => (
              <th key={column.key} style={{ textAlign: 'start' }}>
                {column.label ?? column.key}
                <SortButton
                  columnSortBy={column.sortParam}
                  setSortDirectionIsNormal={setSortDirectionIsNormal}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sliceFunction(objectsFilteredAndSorted).map((object, i) => (
            <tr key={(object as any).ID || i}>
              {currentlyVisibleColumns.map(column => {
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

type SortButtonProps = {
  columnSortBy?: SortBy;
  setSortDirectionIsNormal: Dispatch<SetStateAction<boolean>>;
};

const SortButton: React.FC<SortButtonProps> = ({ columnSortBy, setSortDirectionIsNormal }) => {
  const { sortBy, updatePageParams } = usePageParams();

  if (!columnSortBy) {
    return <></>;
  }

  function onSortButtonClick(newSortBy: SortBy): void {
    if (sortBy != newSortBy) {
      setSortDirectionIsNormal(true);
      updatePageParams({ sortBy: newSortBy });
    } else {
      setSortDirectionIsNormal((prev) => !prev);
    }
  }

  return (
    <HoverableButton
      className={sortBy === columnSortBy ? 'sort active' : 'sort'}
      hoverContent="Click to sort by this column or to toggle the sort direction."
      onClick={() => onSortButtonClick(columnSortBy)}
    >
      ⇅
    </HoverableButton>
  );
};

export default ObjectTable;

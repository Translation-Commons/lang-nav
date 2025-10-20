import React, { useMemo } from 'react';

import { DetailsContainer } from '@pages/dataviews/ViewDetails';

import ObjectDetails from '@widgets/details/ObjectDetails';

import { SortBy } from '@features/sorting/SortTypes';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getScopeFilter,
  getSliceFunction,
} from '../filtering/filter';
import VisibleItemsMeter from '../pagination/VisibleItemsMeter';
import { getSortFunction } from '../sorting/sort';

import TableColumnSelector from './TableColumnSelector';
import TableSortButton from './TableSortButton';
import useColumnVisibility from './useColumnVisibility';

import './tableStyles.css';

// Readonly, don't mutate the TableColumn definitions
export interface TableColumn<T> {
  readonly columnGroup?: string; // "Key" for the parent column
  readonly isInitiallyVisible?: boolean;
  readonly isNumeric?: boolean;
  readonly key: string;
  readonly label?: React.ReactNode;
  readonly render: (object: T) => React.ReactNode;
  readonly sortParam?: SortBy;
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
  const sortFunction = getSortFunction();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByTerritory = getFilterByTerritory();
  const scopeFilter = getScopeFilter();
  const sliceFunction = getSliceFunction<T>();

  const { visibleColumns, toggleColumn, columnVisibility } = useColumnVisibility(columns);

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
      <TableColumnSelector
        columns={columns}
        columnVisibility={columnVisibility}
        toggleColumn={toggleColumn}
      />

      <table className="ObjectTable">
        <thead>
          <tr>
            {visibleColumns.map((column) => (
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
              {visibleColumns.map((column) => {
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

import { useMemo } from 'react';

import { DetailsContainer } from '@pages/dataviews/ViewDetails';

import ObjectDetails from '@widgets/details/ObjectDetails';

import FilterBreakdown from '@features/filtering/FilterBreakdown';
import usePagination from '@features/pagination/usePagination';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getFilterByVitality,
  getScopeFilter,
} from '../filtering/filter';
import VisibleItemsMeter from '../pagination/VisibleItemsMeter';
import { getSortFunction } from '../sorting/sort';

import ObjectTableContent from './ObjectTableContent';
import TableColumn from './TableColumn';
import TableColumnSelector from './TableColumnSelector';
import TableExport from './TableExport';
import useColumnVisibility from './useColumnVisibility';

import './tableStyles.css';

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
  const filterByVitality = getFilterByVitality();
  const scopeFilter = getScopeFilter();
  const { getCurrentObjects } = usePagination<T>();

  const { visibleColumns, toggleColumn, columnVisibility, resetColumnVisibility } =
    useColumnVisibility(columns);

  // TODO don't filter objects for an unrelated page search on a different object type
  const objectsFilteredAndSorted = useMemo(() => {
    return objects
      .filter(scopeFilter)
      .filter(filterByVitality)
      .filter(filterByTerritory)
      .filter(filterBySubstring)
      .sort(sortFunction);
  }, [sortFunction, objects, filterBySubstring, filterByTerritory, filterByVitality, scopeFilter]);
  const currentObjects = getCurrentObjects(objectsFilteredAndSorted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <VisibleItemsMeter
          objects={objects}
          shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
        />
        <TableExport
          visibleColumns={visibleColumns}
          objectsFilteredAndSorted={objectsFilteredAndSorted}
        />
      </div>
      <TableColumnSelector
        columns={columns}
        columnVisibility={columnVisibility}
        resetColumnVisibility={resetColumnVisibility}
        toggleColumn={toggleColumn}
      />
      <ObjectTableContent visibleColumns={visibleColumns} objects={currentObjects} />

      {currentObjects.length === 1 && (
        <DetailsContainer title={<ObjectTitle object={currentObjects[0]} />}>
          <ObjectDetails object={currentObjects[0]} />
        </DetailsContainer>
      )}
      {currentObjects.length === 0 && (
        <div>
          All results are filtered out.
          <FilterBreakdown objects={objects} />
        </div>
      )}

      {/* Repeat the visible item meter and export button at the bottom for convenience. */}
      {currentObjects.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <VisibleItemsMeter
            objects={objects}
            shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
          />
          <TableExport
            visibleColumns={visibleColumns}
            objectsFilteredAndSorted={objectsFilteredAndSorted}
          />
        </div>
      )}
    </div>
  );
}
export default ObjectTable;

import { useMemo } from 'react';

import { DetailsContainer } from '@pages/dataviews/ViewDetails';

import ObjectDetails from '@widgets/details/ObjectDetails';

import usePagination from '@features/pagination/usePagination';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import VisibleItemsMeter from '../pagination/VisibleItemsMeter';
import { getFilterByVitality, getScopeFilter } from '../transforms/filtering/filter';
import { getSortFunction } from '../transforms/sorting/sort';

import BaseObjectTable from './BaseObjectTable';
import TableColumn from './TableColumn';
import TableColumnSelector from './TableColumnSelector';
import TableExport from './TableExport';
import TableID from './TableID';
import useColumnVisibility from './useColumnVisibility';

import './tableStyles.css';

interface Props<T> {
  objects: T[];
  columns: TableColumn<T>[];
  shouldFilterUsingSearchBar?: boolean;
  tableID: TableID;
}

function InteractiveObjectTable<T extends ObjectData>({
  objects,
  columns,
  shouldFilterUsingSearchBar = true,
  tableID,
}: Props<T>) {
  const sortFunction = getSortFunction();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByConnections = getFilterByConnections();
  const filterByVitality = getFilterByVitality();
  const scopeFilter = getScopeFilter();
  const { getCurrentObjects } = usePagination<T>();

  const visibilityModule = useColumnVisibility(columns, tableID);

  // TODO don't filter objects for an unrelated page search on a different object type
  const objectsFilteredAndSorted = useMemo(() => {
    return objects
      .filter(scopeFilter)
      .filter(filterByVitality)
      .filter(filterByConnections)
      .filter(filterBySubstring)
      .sort(sortFunction);
  }, [
    sortFunction,
    objects,
    filterBySubstring,
    filterByConnections,
    filterByVitality,
    scopeFilter,
  ]);
  const currentObjects = getCurrentObjects(objectsFilteredAndSorted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <VisibleItemsMeter
          objects={objects}
          shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
        />
        <TableExport
          visibleColumns={visibilityModule.visibleColumns}
          objectsFilteredAndSorted={objectsFilteredAndSorted}
        />
      </div>
      <TableColumnSelector columns={columns} visibilityModule={visibilityModule} />

      {/* The actual <table> component */}
      <BaseObjectTable
        visibleColumns={visibilityModule.visibleColumns}
        objects={currentObjects}
        tableID={tableID}
      />

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
      {currentObjects.length > 10 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <VisibleItemsMeter
            objects={objects}
            shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
          />
          <TableExport
            visibleColumns={visibilityModule.visibleColumns}
            objectsFilteredAndSorted={objectsFilteredAndSorted}
          />
        </div>
      )}
    </div>
  );
}
export default InteractiveObjectTable;

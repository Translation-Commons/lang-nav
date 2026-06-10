import usePagination from '@features/pagination/usePagination';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { ObjectData } from '@entities/types/DataTypes';

import { useRenderCount } from '@shared/hooks/useRenderCount';

import VisibleItemsMeter from '../pagination/VisibleItemsMeter';

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
  const { getCurrentObjects } = usePagination<T>();
  const objectsFilteredAndSorted = useFilteredObjects({
    useScope: true,
    useSubstring: shouldFilterUsingSearchBar,
    useConnections: true,
    useVitality: true,
    usePopulation: true,
    inputObjects: objects,
  }).filteredObjects;
  useRenderCount('InteractiveObjectTable');
  const currentObjects = getCurrentObjects(objectsFilteredAndSorted);

  const visibilityModule = useColumnVisibility(columns, tableID);

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

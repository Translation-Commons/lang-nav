import usePagination from '@features/pagination/usePagination';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { ObjectData } from '@entities/types/DataTypes';

import VisibleItemsMeter from '../pagination/VisibleItemsMeter';

import BaseEntityTable from './BaseEntityTable';
import TableColumn from './TableColumn';
import TableColumnSelector from './TableColumnSelector';
import TableExport from './TableExport';
import TableID from './TableID';
import useColumnVisibility from './useColumnVisibility';

import './tableStyles.css';

interface Props<T> {
  entities: T[];
  columns: TableColumn<T>[];
  shouldFilterUsingSearchBar?: boolean;
  tableID: TableID;
}

function InteractiveEntityTable<T extends ObjectData>({
  entities,
  columns,
  shouldFilterUsingSearchBar = true,
  tableID,
}: Props<T>) {
  const { getCurrentEntities } = usePagination<T>();
  const { filteredEntities } = useFilteredEntities({
    useScope: true,
    useSubstring: shouldFilterUsingSearchBar,
    useConnections: true,
    useVitality: true,
    usePopulation: true,
    inputEntities: entities,
  });
  const currentEntities = getCurrentEntities(filteredEntities);

  const visibilityModule = useColumnVisibility(columns, tableID);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <VisibleItemsMeter
          objects={entities}
          shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
        />
        <TableExport visibleColumns={visibilityModule.visibleColumns} entities={entities} />
      </div>
      <TableColumnSelector columns={columns} visibilityModule={visibilityModule} />

      {/* The actual <table> component */}
      <BaseEntityTable
        visibleColumns={visibilityModule.visibleColumns}
        objects={currentEntities}
        tableID={tableID}
      />

      {currentEntities.length === 0 && (
        <div>
          All results are filtered out.
          <FilterBreakdown objects={entities} />
        </div>
      )}

      {/* Repeat the visible item meter and export button at the bottom for convenience. */}
      {currentEntities.length > 10 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <VisibleItemsMeter
            objects={entities}
            shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
          />
          <TableExport visibleColumns={visibilityModule.visibleColumns} entities={entities} />
        </div>
      )}
    </div>
  );
}
export default InteractiveEntityTable;

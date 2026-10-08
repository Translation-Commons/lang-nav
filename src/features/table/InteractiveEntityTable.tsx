import usePagination from '@features/pagination/usePagination';
import usePageParams from '@features/params/usePageParams';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { EntityData } from '@entities/types/EntityTypes';

import VisibleItemsMeter from '../pagination/VisibleItemsMeter';

import BaseEntityTable from './BaseEntityTable';
import TableColumn from './TableColumn';
import TableColumnSelector from './TableColumnSelector';
import TableExport from './TableExport';
import TableID from './TableID';
import useColumnVisibility from './useColumnVisibility';

import './tableStyles.css';

interface Props<T> {
  ents: T[];
  columns: TableColumn<T>[];
  /** When false, page language-scope filters do not hide table rows. */
  useScope?: boolean;
  tableID: TableID;
}

function InteractiveEntityTable<T extends EntityData>({
  ents,
  columns,
  useScope = true,
  tableID,
}: Props<T>) {
  const { paramsLevel } = usePageParams();
  const { getCurrentEntities } = usePagination<T>();
  const { filteredEntities } = useFilteredEntities({
    useScope,
    useSubstring: true,
    useConnections: true,
    useVitality: true,
    usePopulation: true,
    useLanguageSource: true,
    inputEnts: ents,
  });
  const currentEntities = getCurrentEntities(filteredEntities);

  const visibilityModule = useColumnVisibility(columns, tableID);

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex items-center gap-2">
        <VisibleItemsMeter ents={ents} />
        <TableExport visibleColumns={visibilityModule.visibleColumns} ents={filteredEntities} />
        <TableColumnSelector columns={columns} visibilityModule={visibilityModule} />
      </div>

      {/* The actual <table> component */}
      <BaseEntityTable
        visibleColumns={visibilityModule.visibleColumns}
        ents={currentEntities}
        tableID={tableID}
      />

      {currentEntities.length === 0 && (
        <div>
          All results are filtered out.
          <FilterBreakdown ents={ents} />
        </div>
      )}

      {/* Repeat the visible item meter and export button at the bottom for convenience. */}
      {currentEntities.length > 10 && paramsLevel === 'global' && (
        <div className="flex items-center gap-2">
          <VisibleItemsMeter ents={ents} />
          <TableExport visibleColumns={visibilityModule.visibleColumns} ents={filteredEntities} />
        </div>
      )}
    </div>
  );
}
export default InteractiveEntityTable;

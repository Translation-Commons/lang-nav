import usePageParams from '@features/params/usePageParams';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';

import { EntityData } from '@entities/types/EntityTypes';

import { Spinner } from '@shared/ui/spinner';

import VisibleItemsMeter from '../pagination/VisibleItemsMeter';

import BaseEntityTable from './BaseEntityTable';
import TableColumn from './TableColumn';
import TableColumnSelector from './TableColumnSelector';
import TableExport from './TableExport';
import TableID from './TableID';
import useColumnVisibility from './useColumnVisibility';
import useTablePage from './useTablePage';

import './tableStyles.css';

interface Props<T> {
  ents: T[];
  columns: TableColumn<T>[];
  tableID: TableID;
  apiPath?: string; // API endpoint serving this table page by page; omit to always stay local.
}

function InteractiveEntityTable<T extends EntityData>({
  ents,
  columns,
  tableID,
  apiPath,
}: Props<T>) {
  const { paramsLevel } = usePageParams();
  const { isApi, currentEntities, filteredEntities, totalCount, status } = useTablePage(
    ents,
    apiPath,
  );

  const visibilityModule = useColumnVisibility(columns, tableID);

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex items-center gap-2">
        <VisibleItemsMeter ents={ents} totalCount={totalCount} />
        {/* Export needs every filtered row, which API mode does not have. */}
        {!isApi && (
          <TableExport visibleColumns={visibilityModule.visibleColumns} ents={filteredEntities} />
        )}
        <TableColumnSelector columns={columns} visibilityModule={visibilityModule} />
        {status === 'loading' && <Spinner />}
      </div>

      {status === 'error' && (
        <div>
          Could not load this table from the LangNav API. You can switch the Data Source to Local in
          Settings.
        </div>
      )}

      {/* The actual <table> component */}
      <BaseEntityTable
        visibleColumns={visibilityModule.visibleColumns}
        ents={currentEntities}
        tableID={tableID}
      />

      {status === 'ready' && currentEntities.length === 0 && (
        <div>
          All results are filtered out.
          {!isApi && <FilterBreakdown ents={ents} />}
        </div>
      )}

      {/* Repeat the visible item meter and export button at the bottom for convenience. */}
      {currentEntities.length > 10 && paramsLevel === 'global' && (
        <div className="flex items-center gap-2">
          <VisibleItemsMeter ents={ents} totalCount={totalCount} />
          {!isApi && (
            <TableExport visibleColumns={visibilityModule.visibleColumns} ents={filteredEntities} />
          )}
        </div>
      )}
    </div>
  );
}
export default InteractiveEntityTable;

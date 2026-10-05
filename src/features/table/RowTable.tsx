import { EndpointState } from '@features/data/api/core/defineEndpoint';
import { BaseRow, TablePage } from '@features/data/api/list/tableContract';
import { ItemsMeter } from '@features/pagination/VisibleItemsMeter';

import CornerSpinner from '@shared/ui/CornerSpinner';

import BaseEntityTable from './BaseEntityTable';
import { PinRowColumn } from './RowColumns';
import TableColumn from './TableColumn';
import TableColumnSelector from './TableColumnSelector';
import TableExport from './TableExport';
import TableID from './TableID';
import useColumnVisibility from './useColumnVisibility';

import './tableStyles.css';

type Props<R extends BaseRow> = {
  tableID: TableID;
  columns: TableColumn<R>[];
  state: EndpointState<TablePage<R>>;
  /** Every filtered row, for the export. */
  getAllRows: () => Promise<R[]>;
};

const getRowId = (row: BaseRow) => row.id;

/** InteractiveEntityTable for endpoint rows: same layout, but filtering, sorting and paging happen in the endpoint. */
function RowTable<R extends BaseRow>({ tableID, columns, state, getAllRows }: Props<R>) {
  const visibilityModule = useColumnVisibility(columns, tableID, PinRowColumn);

  const toolbar = (page: TablePage<R>, withColumnSelector: boolean) => (
    <div className="flex items-center gap-2">
      <ItemsMeter nOverall={page.total} nFiltered={page.count} />
      <TableExport
        visibleColumns={visibilityModule.visibleColumns}
        getRows={getAllRows}
        getRowId={getRowId}
      />
      {withColumnSelector && (
        <TableColumnSelector columns={columns} visibilityModule={visibilityModule} />
      )}
    </div>
  );

  if (state.status === 'loading') {
    return (
      <div>
        Loading...
        <CornerSpinner />
      </div>
    );
  }
  if (state.status === 'error') {
    return <div role="alert">Could not load this table: {state.message}</div>;
  }

  const page = state.data;
  return (
    <div className="flex flex-col gap-4 items-center" data-row-source={state.source}>
      {state.stale && <CornerSpinner />}
      {toolbar(page, true)}
      <BaseEntityTable
        visibleColumns={visibilityModule.visibleColumns}
        ents={page.rows}
        getRowId={getRowId}
        tableID={tableID}
      />
      {page.rows.length === 0 && <div>All results are filtered out.</div>}
      {/* Repeat the toolbar at the bottom for convenience. */}
      {page.rows.length > 10 && toolbar(page, false)}
    </div>
  );
}

export default RowTable;

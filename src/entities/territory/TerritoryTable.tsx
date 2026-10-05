import React, { useMemo } from 'react';

import { allRowsQuery } from '@features/data/api/list/tableContract';
import { toTerritoryListQuery, useTerritoryList } from '@features/data/api/territory/territoryList';
import usePageParams from '@features/params/usePageParams';
import RowTable from '@features/table/RowTable';
import TableID from '@features/table/TableID';

import getTerritoryColumns from './TerritoryColumns';

const TerritoryTable: React.FC = () => {
  const params = usePageParams();
  const query = useMemo(() => toTerritoryListQuery(params), [params]);
  const { state, fetch } = useTerritoryList(query);
  const columns = useMemo(getTerritoryColumns, []);

  return (
    <RowTable
      tableID={TableID.Territories}
      columns={columns}
      state={state}
      getAllRows={async () => (await fetch(allRowsQuery(query))).rows}
    />
  );
};

export default TerritoryTable;

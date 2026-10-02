import React, { useMemo } from 'react';

import { allRowsQuery } from '@features/data/api/list/tableContract';
import {
  toWritingSystemListQuery,
  useWritingSystemList,
} from '@features/data/api/writingsystem/writingSystemList';
import usePageParams from '@features/params/usePageParams';
import RowTable from '@features/table/RowTable';
import TableID from '@features/table/TableID';

import getWritingSystemColumns from './WritingSystemColumns';

const WritingSystemTable: React.FC = () => {
  const params = usePageParams();
  const query = useMemo(() => toWritingSystemListQuery(params), [params]);
  const { state, fetch } = useWritingSystemList(query);
  const columns = useMemo(getWritingSystemColumns, []);

  return (
    <RowTable
      tableID={TableID.WritingSystems}
      columns={columns}
      state={state}
      getAllRows={async () => (await fetch(allRowsQuery(query))).rows}
    />
  );
};

export default WritingSystemTable;

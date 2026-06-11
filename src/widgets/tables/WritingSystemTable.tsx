import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import getWritingSystemColumns from './columns/WritingSystemColumns';

const WritingSystemTable: React.FC = () => {
  const { writingSystems } = useDataContext();
  const columns = getWritingSystemColumns();

  return (
    <InteractiveEntityTable
      tableID={TableID.WritingSystems}
      entities={writingSystems}
      columns={columns}
    />
  );
};

export default WritingSystemTable;

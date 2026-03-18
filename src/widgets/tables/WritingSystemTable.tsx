import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import getWritingSystemColumns from './columns/WritingSystemColumns';

const WritingSystemTable: React.FC = () => {
  const { writingSystems } = useDataContext();
  const columns = getWritingSystemColumns();

  return (
    <InteractiveObjectTable<WritingSystemData>
      tableID={TableID.WritingSystems}
      objects={writingSystems}
      columns={columns}
    />
  );
};

export default WritingSystemTable;

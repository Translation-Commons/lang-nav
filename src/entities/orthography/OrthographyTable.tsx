import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import getOrthographyColumns from './OrthographyColumns';
import type { OrthographyData } from './OrthographyTypes';

const OrthographyTable: React.FC = () => {
  const { orthographies } = useDataContext();
  const columns = useMemo(() => getOrthographyColumns(), []);

  return (
    <InteractiveEntityTable<OrthographyData>
      tableID={TableID.Orthographies}
      ents={orthographies}
      columns={columns}
    />
  );
};

export default OrthographyTable;

import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { CensusData } from '@entities/census/CensusTypes';

import getCensusColumns from './columns/CensusColumns';

const TableOfAllCensuses: React.FC = () => {
  const { censuses } = useDataContext();
  const columns = useMemo(() => getCensusColumns(), []);

  return (
    <InteractiveObjectTable<CensusData>
      tableID={TableID.Censuses}
      objects={Object.values(censuses)}
      columns={columns}
    />
  );
};

export default TableOfAllCensuses;

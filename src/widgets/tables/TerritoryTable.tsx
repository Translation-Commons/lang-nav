import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import getTerritoryColumns from './columns/TerritoryColumns';

const TerritoryTable: React.FC = () => {
  const { territories } = useDataContext();
  const columns = getTerritoryColumns();

  return (
    <InteractiveObjectTable<TerritoryData>
      tableID={TableID.Territories}
      objects={territories}
      columns={columns}
    />
  );
};

export default TerritoryTable;

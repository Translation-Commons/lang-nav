import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import getTerritoryColumns from './columns/TerritoryColumns';

const TerritoryTable: React.FC = () => {
  const { territories } = useDataContext();
  const columns = getTerritoryColumns();

  return (
    <InteractiveEntityTable tableID={TableID.Territories} ents={territories} columns={columns} />
  );
};

export default TerritoryTable;

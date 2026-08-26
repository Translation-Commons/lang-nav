import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import getCensusColumns from './columns/CensusColumns';

type Props = {
  organization?: OrganizationData;
};

const TableOfAllCensuses: React.FC<Props> = ({ organization }) => {
  const { censuses: allCensuses } = useDataContext();
  const columns = useMemo(() => getCensusColumns(), []);

  return (
    <InteractiveEntityTable
      tableID={TableID.Censuses}
      ents={organization ? (organization?.censuses ?? []) : Object.values(allCensuses)}
      columns={columns}
    />
  );
};

export default TableOfAllCensuses;

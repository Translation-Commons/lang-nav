import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { CensusData } from '@entities/census/CensusTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';

import getCensusColumns from './columns/CensusColumns';

type Props = {
  organization?: OrganizationData;
};

const TableOfAllCensuses: React.FC<Props> = ({ organization }) => {
  const { censuses: allCensuses } = useDataContext();
  const columns = useMemo(() => getCensusColumns(), []);
  const censuses = useMemo(() => {
    if (!organization) return Object.values(allCensuses);
    return organization.censuses ?? [];
  }, [organization, allCensuses]);

  return (
    <InteractiveObjectTable<CensusData>
      tableID={TableID.Censuses}
      objects={censuses}
      columns={columns}
    />
  );
};

export default TableOfAllCensuses;

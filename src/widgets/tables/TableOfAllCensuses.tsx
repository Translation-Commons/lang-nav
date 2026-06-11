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
  const censuses = useMemo(() => {
    if (!organization) return Object.values(allCensuses);
    return organization.censuses ?? [];
  }, [organization, allCensuses]);

  return (
    <InteractiveEntityTable tableID={TableID.Censuses} entities={censuses} columns={columns} />
  );
};

export default TableOfAllCensuses;

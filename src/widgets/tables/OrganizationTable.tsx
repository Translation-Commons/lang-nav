import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import getOrganizationColumns from './columns/OrganizationColumns';

const OrganizationTable: React.FC = () => {
  const { organizations } = useDataContext();
  const columns = useMemo(() => getOrganizationColumns(), []);

  return (
    <InteractiveObjectTable<OrganizationData>
      tableID={TableID.Organizations}
      objects={organizations}
      columns={columns}
    />
  );
};

export default OrganizationTable;

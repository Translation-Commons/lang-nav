import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import getOrganizationColumns from './columns/OrganizationColumns';

const OrganizationTable: React.FC = () => {
  const { organizations } = useDataContext();
  const columns = useMemo(() => getOrganizationColumns(), []);

  return (
    <InteractiveEntityTable<OrganizationData>
      tableID={TableID.Organizations}
      entities={organizations}
      columns={columns}
    />
  );
};

export default OrganizationTable;

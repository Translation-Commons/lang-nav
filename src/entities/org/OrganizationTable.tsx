import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import getOrganizationColumns from './OrganizationColumns';
import type { OrganizationData } from './OrganizationTypes';

const OrganizationTable: React.FC = () => {
  const { organizations } = useDataContext();
  const columns = useMemo(() => getOrganizationColumns(), []);

  return (
    <InteractiveEntityTable<OrganizationData>
      tableID={TableID.Organizations}
      ents={organizations}
      columns={columns}
    />
  );
};

export default OrganizationTable;

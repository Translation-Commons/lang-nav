import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import getTechnologyColumns from './TechnologyColumns';
import type { TechnologyData } from './TechnologyTypes';

const TechnologyTable: React.FC = () => {
  const { technologies } = useDataContext();
  const columns = useMemo(() => getTechnologyColumns(), []);

  return (
    <InteractiveEntityTable<TechnologyData>
      tableID={TableID.Technologies}
      ents={technologies}
      columns={columns}
    />
  );
};

export default TechnologyTable;

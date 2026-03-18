import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { LanguageData } from '@entities/language/LanguageTypes';

import getLanguageColumns from './columns/LanguageColumns';

const LanguageTable: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();
  const columns = useMemo(() => getLanguageColumns(), []);

  return (
    <InteractiveObjectTable<LanguageData>
      tableID={TableID.Languages}
      objects={languagesInSelectedSource}
      columns={columns}
    />
  );
};

export default LanguageTable;

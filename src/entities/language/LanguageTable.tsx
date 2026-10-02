import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import type { LanguageData } from '@entities/language/LanguageTypes';

import getLanguageColumns from './LanguageColumns';

const LanguageTable: React.FC = () => {
  const { languages } = useDataContext();
  const columns = useMemo(() => getLanguageColumns(), []);

  return (
    <InteractiveEntityTable<LanguageData>
      tableID={TableID.Languages}
      ents={languages}
      columns={columns}
    />
  );
};

export default LanguageTable;

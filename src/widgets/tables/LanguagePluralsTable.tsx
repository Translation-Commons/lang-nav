import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import { LanguageData } from '@entities/language/LanguageTypes';
import getLanguagePluralsColumns from '@entities/language/plurals/LanguagePluralsColumns';

const LanguagePluralsTable: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();
  const columns = useMemo(() => getLanguagePluralsColumns(), []);

  return (
    <InteractiveEntityTable<LanguageData>
      tableID={TableID.LanguagePlurals}
      entities={languagesInSelectedSource}
      columns={columns}
    />
  );
};

export default LanguagePluralsTable;

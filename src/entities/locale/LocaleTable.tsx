import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import getLocaleColumns from './LocaleColumns';
import type { LocaleData } from './LocaleTypes';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();
  const columns = getLocaleColumns();

  return (
    <InteractiveEntityTable<LocaleData>
      tableID={TableID.Locales}
      ents={locales.filter((locale) => locale.language?.[languageSource].code != null)}
      columns={columns}
    />
  );
};

export default LocaleTable;

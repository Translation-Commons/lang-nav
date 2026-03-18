import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { LocaleData } from '@entities/locale/LocaleTypes';

import getLocaleColumns from './columns/LocaleColumns';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();
  const columns = getLocaleColumns();

  return (
    <InteractiveObjectTable<LocaleData>
      tableID={TableID.Locales}
      objects={locales.filter((locale) => locale.language?.[languageSource].code != null)}
      columns={columns}
    />
  );
};

export default LocaleTable;

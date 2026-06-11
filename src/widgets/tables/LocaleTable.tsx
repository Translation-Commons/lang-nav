import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import { LocaleData } from '@entities/locale/LocaleTypes';

import getLocaleColumns from './columns/LocaleColumns';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();
  const columns = getLocaleColumns();

  return (
    <InteractiveEntityTable<LocaleData>
      tableID={TableID.Locales}
      entities={locales.filter((locale) => locale.language?.[languageSource].code != null)}
      columns={columns}
    />
  );
};

export default LocaleTable;

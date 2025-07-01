import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import { LocaleData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LocaleCensusCitation from './LocaleCensusCitation';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSchema } = usePageParams();

  return (
    <ObjectTable<LocaleData>
      objects={Object.values(locales).filter(
        (locale) => locale.language?.schemaSpecific[languageSchema].code != null,
      )}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Population',
          render: (object) => object.populationSpeaking,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LocaleTable;

import React from 'react';

import { useDataContext } from '../../data/DataContext';
import { LocaleData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LocaleCensusCitation from './LocaleCensusCitation';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();

  return (
    <ObjectTable<LocaleData>
      objects={Object.values(locales)}
      columns={[
        CodeColumn,
        NameColumn,
        {
          label: 'Population',
          render: (object) => object.populationSpeaking,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          label: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LocaleTable;

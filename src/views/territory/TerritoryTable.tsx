import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { TerritoryData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import { CodeColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const TerritoryTable: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <ObjectTable<TerritoryData>
      objects={territories}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Population',
          render: (object) => object.population,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'Literacy',
          render: (object) =>
            object.literacyPercent != null ? object.literacyPercent.toFixed(1) + '%' : null,
          isNumeric: true,
          sortParam: SortBy.Literacy,
        },
        {
          key: 'Languages',
          render: (object) =>
            object.locales && (
              <HoverableEnumeration
                items={object.locales.map((l) => l.language?.nameDisplay ?? l.nameDisplay)}
              />
            ),
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Biggest Language',
          render: (object) =>
            object.locales &&
            object.locales.length > 0 && (
              <HoverableObjectName
                labelSource="language"
                object={object.locales[0]}
                style={{ textDecoration: 'none' }}
              />
            ),
          isInitiallyVisible: false,
        },
        {
          key: 'Contains Territories',
          render: (object) =>
            object.containsTerritories && (
              <HoverableEnumeration items={object.containsTerritories.map((t) => t.nameDisplay)} />
            ),
          isInitiallyVisible: false,
          isNumeric: true,
          sortParam: SortBy.CountOfTerritories,
        },
        {
          key: 'Type',
          render: (object) => object.scope,
        },
      ]}
    />
  );
};

export default TerritoryTable;

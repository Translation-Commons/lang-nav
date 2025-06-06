import React from 'react';

import { useDataContext } from '../../data/DataContext';
import Hoverable from '../../generic/Hoverable';
import { TerritoryData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const TerritoryTable: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <ObjectTable<TerritoryData>
      objects={Object.values(territories)}
      columns={[
        CodeColumn,
        NameColumn,
        {
          label: 'Population',
          render: (object) => object.population,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          label: 'Literacy',
          render: (object) =>
            object.literacyPercent != null ? object.literacyPercent.toFixed(1) + '%' : null,
          isNumeric: true,
        },
        {
          label: 'Languages',
          render: (object) =>
            object.locales.length > 0 && (
              <Hoverable
                style={{ textDecoration: 'none' }}
                hoverContent={
                  object.locales
                    .slice(0, 20)
                    .map((l) => l.language?.nameDisplay ?? l.nameDisplay)
                    .join(', ') + (object.locales.length > 20 ? '...' : '')
                }
              >
                {object.locales.length}
              </Hoverable>
            ),
          isNumeric: true,
        },
        {
          label: 'Biggest Language',
          render: (object) =>
            object.locales.length > 0 && (
              <HoverableObjectName
                labelSource="language"
                object={object.locales[0]}
                style={{ textDecoration: 'none' }}
              />
            ),
        },
        {
          label: 'Type',
          render: (object) => object.territoryType,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default TerritoryTable;

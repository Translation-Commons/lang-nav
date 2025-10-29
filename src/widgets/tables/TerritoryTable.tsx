import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import TableValueType from '@features/table/TableValueType';

import { getTerritoryChildren } from '@entities/lib/getObjectMiscFields';
import { getTerritoryBiggestLocale } from '@entities/lib/getObjectMiscFields';
import { TerritoryData } from '@entities/types/DataTypes';

import { sumBy } from '@shared/lib/setUtils';

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
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Population,
          columnGroup: 'Demographics',
        },
        {
          key: 'Literacy',
          render: (object) =>
            object.literacyPercent != null ? object.literacyPercent.toFixed(1) + '%' : null,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Literacy,
          columnGroup: 'Demographics',
        },
        {
          key: 'Languages',
          render: (object) =>
            object.locales && (
              <HoverableEnumeration
                items={object.locales.map((l) => l.language?.nameDisplay ?? l.nameDisplay)}
              />
            ),
          valueType: TableValueType.Numeric,
          sortParam: SortBy.CountOfLanguages,
          columnGroup: 'Language',
        },
        {
          key: 'Biggest Language',
          render: (object) =>
            object.locales &&
            object.locales.length > 0 && (
              <HoverableObjectName
                labelSource="language"
                object={getTerritoryBiggestLocale(object)}
                style={{ textDecoration: 'none' }}
              />
            ),
          isInitiallyVisible: false,
          sortParam: SortBy.Language,
          columnGroup: 'Language',
        },
        {
          key: 'Biggest Language %',
          render: (object) =>
            object.locales ? object.locales[0].populationSpeakingPercent?.toFixed(1) + '%' : null,
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.PopulationPercentInBiggestDescendentLanguage,
          columnGroup: 'Language',
        },
        {
          key: 'Contained UN Region',
          render: (object) => object.parentUNRegion?.nameDisplay,
          isInitiallyVisible: false,
          columnGroup: 'Relations',
        },
        {
          key: 'Territories and/or Dependencies',
          render: (object) => (
            <HoverableEnumeration items={getTerritoryChildren(object).map((t) => t.nameDisplay)} />
          ),
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.CountOfTerritories,
          columnGroup: 'Relations',
        },
        {
          key: 'Population of Dependencies',
          render: (object) =>
            object.dependentTerritories && object.dependentTerritories.length > 0
              ? sumBy(object.dependentTerritories, (t) => t.population ?? 0)
              : null,
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.PopulationOfDescendents,
          columnGroup: 'Relations',
        },
        {
          key: 'Type',
          render: (object) => object.scope,
          valueType: TableValueType.Enum,
        },
      ]}
    />
  );
};

export default TerritoryTable;

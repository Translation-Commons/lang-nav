import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { SortBy } from '@features/transforms/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';

import { getTerritoryChildren } from '@entities/lib/getObjectMiscFields';
import { getTerritoryBiggestLocale } from '@entities/lib/getObjectMiscFields';
import { TerritoryData } from '@entities/types/DataTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { sumBy } from '@shared/lib/setUtils';
import AlignedFraction from '@shared/ui/AlignedFraction';
import Deemphasized from '@shared/ui/Deemphasized';

const TerritoryTable: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <InteractiveObjectTable<TerritoryData>
      tableID={TableID.Territories}
      objects={territories}
      columns={[
        CodeColumn,
        {
          key: 'ISO Alpha-3 Code',
          render: (object) => object.codeAlpha3 || null,
          isInitiallyVisible: false,
          columnGroup: 'Codes',
        },
        {
          key: 'ISO Numeric Code',
          render: (object) => object.codeNumeric || object.ID.match(/\d{3}/)?.[0] || null,
          isInitiallyVisible: false,
          columnGroup: 'Codes',
        },
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
          key: 'Latitude',
          render: (obj) => obj.latitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
          exportValue: (obj) => obj.latitude?.toFixed(4) ?? '',
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Latitude,
          columnGroup: 'Location',
        },
        {
          key: 'Longitude',
          render: (obj) => obj.longitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
          exportValue: (obj) => obj.longitude?.toFixed(4) ?? '',
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Longitude,
          columnGroup: 'Location',
        },
        {
          key: 'Land Area (km²)',
          description:
            'Surprisingly, sources report different numbers for the land area for some areas.',
          render: (object) =>
            object.landArea ? numberToSigFigs(object.landArea, 3)?.toLocaleString() : undefined,
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Area,
          columnGroup: 'Location',
        },
        {
          key: 'Density',
          description: 'People per square kilometer',
          render: (object) => (
            <AlignedFraction
              value={
                object.landArea && object.population ? object.population / object.landArea : null
              }
            />
          ),
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          columnGroup: 'Location',
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

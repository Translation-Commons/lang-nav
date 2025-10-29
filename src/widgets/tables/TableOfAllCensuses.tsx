import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import TableValueType from '@features/table/TableValueType';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import { getObjectPercentOfTerritoryPopulation } from '@entities/lib/getObjectPopulation';

import Deemphasized from '@shared/ui/Deemphasized';

const TableOfAllCensuses: React.FC = () => {
  const { censuses, getLanguage } = useDataContext();

  return (
    <ObjectTable<CensusData>
      objects={censuses}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Languages',
          render: (census) => (
            <HoverableEnumeration
              items={Object.keys(census.languageEstimates).map(
                (lang) => getLanguage(lang)?.nameDisplay ?? lang,
              )}
            />
          ),
          valueType: TableValueType.Numeric,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Eligible Population',
          render: (census) =>
            census.eligiblePopulation != null
              ? census.eligiblePopulation.toLocaleString()
              : 'Unknown',
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Population,
          columnGroup: 'Population',
        },
        {
          key: 'Percent of Current Population',
          render: (census) =>
            census.territory && census.eligiblePopulation != null
              ? getObjectPercentOfTerritoryPopulation(census)?.toFixed(1)
              : 'Unknown',
          valueType: TableValueType.Numeric,
          isInitiallyVisible: false,
          sortParam: SortBy.PercentOfTerritoryPopulation,
          columnGroup: 'Population',
        },
        {
          key: 'Territory',
          render: (census) => <HoverableObjectName object={census.territory} />,
          isInitiallyVisible: false,
        },
        {
          key: 'Year Collected',
          render: (census) =>
            census.collectorType !== CensusCollectorType.CLDR ? (
              new Date(census.yearCollected + '-07-01').toLocaleDateString(undefined, {
                year: 'numeric',
              })
            ) : (
              <Deemphasized>multiple</Deemphasized>
            ),
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Date,
        },
      ]}
    />
  );
};

export default TableOfAllCensuses;

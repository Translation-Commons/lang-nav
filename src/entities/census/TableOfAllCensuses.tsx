import { getObjectPercentOfTerritoryPopulation } from '@entities/lib/getObjectPopulation';
import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import Deemphasized from '@shared/ui/Deemphasized';
import HoverableEnumeration from '@shared/ui/HoverableEnumeration';
import React from 'react';

import { CensusCollectorType, CensusData } from './CensusTypes';

const TableOfAllCensuses: React.FC = () => {
  const { censuses, getLanguage } = useDataContext();

  return (
    <ObjectTable<CensusData>
      objects={Object.values(censuses)}
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
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Eligible Population',
          render: (census) =>
            census.eligiblePopulation != null
              ? census.eligiblePopulation.toLocaleString()
              : 'Unknown',
          isNumeric: true,
          sortParam: SortBy.Population,
          columnGroup: 'Population',
        },
        {
          key: 'Percent of Current Population',
          render: (census) =>
            census.territory && census.eligiblePopulation != null
              ? getObjectPercentOfTerritoryPopulation(census)?.toFixed(1)
              : 'Unknown',
          isNumeric: true,
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
          isNumeric: true,
          sortParam: SortBy.Date,
        },
      ]}
    />
  );
};

export default TableOfAllCensuses;

import React from 'react';

import { useDataContext } from '../../data/DataContext';
import Deemphasized from '../../generic/Deemphasized';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { CensusCollectorType, CensusData } from '../../types/CensusTypes';
import { SortBy } from '../../types/SortTypes';
import { getObjectPercentOfTerritoryPopulation } from '../common/getObjectPopulation';
import HoverableObjectName from '../common/HoverableObjectName';
import { CodeColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

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

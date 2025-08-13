import React from 'react';

import { useDataContext } from '../../data/DataContext';
import Deemphasized from '../../generic/Deemphasized';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { CensusData } from '../../types/CensusTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CodeColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const TableOfAllCensuses: React.FC = () => {
  const { censuses, languages } = useDataContext();

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
                (lang) => languages[lang]?.nameDisplay ?? lang,
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
        },
        {
          key: 'Year Collected',
          render: (census) =>
            census.collectorType !== 'CLDR' ? (
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

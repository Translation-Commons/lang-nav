import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { SortBy } from '@features/transforms/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import { getObjectPercentOfTerritoryPopulation } from '@entities/lib/getObjectPopulation';

import Deemphasized from '@shared/ui/Deemphasized';

const TableOfAllCensuses: React.FC = () => {
  const { censuses, getLanguage } = useDataContext();

  return (
    <InteractiveObjectTable<CensusData>
      tableID={TableID.Censuses}
      objects={Object.values(censuses)}
      columns={[
        { ...CodeColumn, columnGroup: 'ID' },
        { ...NameColumn, columnGroup: 'ID' },
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
          key: 'Acquisition Order',
          description: (
            <>
              If the data for the language specifically refers to a persons <code>L1</code> first
              language (or mothertongue) or <code>L2</code> second language, ....
            </>
          ),
          render: (census) => census.acquisitionOrder,
          isInitiallyVisible: false,
          columnGroup: 'Characteristics',
        },
        {
          key: 'Modality',
          description:
            'How the language is conveyed -- in spoken word, written word. Alternatively some censuses just report ethnicity.',
          render: (census) => census.modality,
          isInitiallyVisible: false,
          columnGroup: 'Characteristics',
        },
        {
          key: 'Domain',
          description: 'Where the language is used',
          render: (census) => census.domain,
          isInitiallyVisible: false,
          columnGroup: 'Characteristics',
        },
        {
          key: 'Age',
          render: (census) => census.age,
          isInitiallyVisible: false,
          columnGroup: 'Characteristics',
        },
        {
          key: 'Territory',
          render: (census) => <HoverableObjectName object={census.territory} />,
          isInitiallyVisible: false,
          sortParam: SortBy.Territory,
          columnGroup: 'Location',
        },
        {
          key: 'Collector Type',
          render: (census) => census.collectorType,
          isInitiallyVisible: false,
          columnGroup: 'Location',
        },
        {
          key: 'Collector Name',
          render: (census) => census.collectorName,
          isInitiallyVisible: false,
          columnGroup: 'Location',
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
          columnGroup: 'Time',
        },
        {
          key: 'Date Published',
          render: (census) => census.datePublished?.toLocaleDateString(),
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          columnGroup: 'Time',
        },
        {
          key: 'Date Accessed',
          render: (census) => census.dateAccessed?.toLocaleDateString(),
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          columnGroup: 'Time',
        },
      ]}
    />
  );
};

export default TableOfAllCensuses;

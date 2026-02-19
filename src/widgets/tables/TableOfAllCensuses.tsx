import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

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
          field: Field.CountOfLanguages,
        },
        {
          key: 'Eligible Population',
          render: (census) => census.populationEligible,
          field: Field.Population,
          columnGroup: 'Population',
        },
        {
          key: '% of Current Population',
          render: (census) =>
            census.populationEligible && getObjectPercentOfTerritoryPopulation(census),
          isInitiallyVisible: false,
          field: Field.PercentOfTerritoryPopulation,
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
          key: 'Mode',
          description: (
            <>
              Censuses usually frame language usage like &quot;How many people{' '}
              <strong>speak</strong> the language?&quot;. This column shows what people do with the
              language to be counted for it. Alternatively some censuses just report ethnicity.
            </>
          ),
          render: (census) => census.mode,
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
          field: Field.Territory,
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
          field: Field.Date,
          columnGroup: 'Time',
        },
        {
          key: 'Date Published',
          render: (census) => census.datePublished?.toLocaleDateString(),
          isInitiallyVisible: false,
          valueType: TableValueType.Date,
          columnGroup: 'Time',
        },
        {
          key: 'Date Accessed',
          render: (census) => census.dateAccessed?.toLocaleDateString(),
          isInitiallyVisible: false,
          valueType: TableValueType.Date,
          columnGroup: 'Time',
        },
      ]}
    />
  );
};

export default TableOfAllCensuses;

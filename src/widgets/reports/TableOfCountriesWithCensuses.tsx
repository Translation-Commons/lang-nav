import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import CommaSeparated from '@shared/ui/CommaSeparated';

const TableOfCountriesWithCensuses: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <CollapsibleReport title="Countries with Censuses">
      <InteractiveObjectTable<TerritoryData>
        tableID={TableID.CountriesWithCensuses}
        objects={territories}
        columns={[
          CodeColumn,
          NameColumn,
          {
            key: 'Censuses',
            render: (territory) => territory.censuses?.length,
            field: Field.CountOfCensuses,
          },
          ...Object.values(CensusCollectorType).map((collectorType) => ({
            key: collectorType,
            render: (territory: TerritoryData) => {
              return (
                <div style={{ maxWidth: '10em' }}>
                  <CommaSeparated limit={1}>
                    {territory.censuses
                      ?.filter((census) => census.collectorType === collectorType)
                      .map((census) => (
                        <HoverableObjectName key={census.ID} object={census} />
                      ))}
                  </CommaSeparated>
                </div>
              );
            },
            columnGroup: 'Collector Type',
          })),
          {
            key: 'Population',
            render: (territory) => territory.population,
            field: Field.Population,
          },
          {
            key: 'Languages',
            render: (territory) => territory.locales?.length,
            field: Field.CountOfLanguages,
          },
        ]}
      />
    </CollapsibleReport>
  );
};

export default TableOfCountriesWithCensuses;

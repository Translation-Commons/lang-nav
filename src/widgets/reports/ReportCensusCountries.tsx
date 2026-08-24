import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

const ReportCensusCountries: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <InteractiveEntityTable<TerritoryData>
      tableID={TableID.CountriesWithCensuses}
      ents={territories}
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
                      <HoverableEntityName key={census.ID} ent={census} />
                    ))}
                </CommaSeparated>
              </div>
            );
          },
          columnGroup: 'Collector Type',
        })),
        {
          key: 'Population',
          render: (territory) => territory.pop.overall,
          field: Field.Population,
        },
        {
          key: 'Languages',
          render: (territory) => territory.locales?.length,
          field: Field.CountOfLanguages,
        },
      ]}
    />
  );
};

export default ReportCensusCountries;

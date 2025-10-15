import { TerritoryData } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import CollapsibleReport from '@features/reports/CollapsibleReport';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import CommaSeparated from '@shared/ui/CommaSeparated';
import React from 'react';

import { CensusCollectorType } from './CensusTypes';

const TableOfCountriesWithCensuses: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <CollapsibleReport title="Countries with Censuses">
      <ObjectTable<TerritoryData>
        objects={territories}
        columns={[
          CodeColumn,
          NameColumn,
          {
            key: 'Censuses',
            render: (territory) => territory.censuses?.length,
            isNumeric: true,
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
          })),
          {
            key: 'Population',
            render: (territory) => territory.population,
            isNumeric: true,
            sortParam: SortBy.Population,
          },
          {
            key: 'Languages',
            render: (territory) => territory.locales?.length,
            isNumeric: true,
            sortParam: SortBy.CountOfLanguages,
          },
        ]}
      />
    </CollapsibleReport>
  );
};

export default TableOfCountriesWithCensuses;

import React from 'react';

import { useDataContext } from '../../data/DataContext';
import CommaSeparated from '../../generic/CommaSeparated';
import { CensusCollectorType } from '../../types/CensusTypes';
import { TerritoryData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import CollapsibleReport from '../common/CollapsibleReport';
import HoverableObjectName from '../common/HoverableObjectName';
import { CodeColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

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

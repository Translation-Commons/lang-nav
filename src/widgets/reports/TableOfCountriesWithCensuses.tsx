import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import TableValueType from '@features/table/TableValueType';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { TerritoryData } from '@entities/types/DataTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import CommaSeparated from '@shared/ui/CommaSeparated';

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
            valueType: TableValueType.Numeric,
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
            valueType: TableValueType.Numeric,
            sortParam: SortBy.Population,
          },
          {
            key: 'Languages',
            render: (territory) => territory.locales?.length,
            valueType: TableValueType.Numeric,
            sortParam: SortBy.CountOfLanguages,
          },
        ]}
      />
    </CollapsibleReport>
  );
};

export default TableOfCountriesWithCensuses;

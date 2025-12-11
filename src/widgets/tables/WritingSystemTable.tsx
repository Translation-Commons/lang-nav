import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import { getTerritoriesRelevantToObject } from '@features/transforms/filtering/filterByConnections';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { WritingSystemData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

const WritingSystemTable: React.FC = () => {
  const { writingSystems } = useDataContext();
  const endonymColumn = { ...EndonymColumn, isInitiallyVisible: true };

  return (
    <InteractiveObjectTable<WritingSystemData>
      tableID={TableID.WritingSystems}
      objects={writingSystems}
      columns={[
        CodeColumn,
        NameColumn,
        endonymColumn,
        {
          key: 'Potential Population',
          description: (
            <>
              An imprecise estimate of how many people use this writing system worldwide, calculated
              by adding up the population for all of the languages that use the writing system.
            </>
          ),
          render: (object) => object.populationUpperBound,
          valueType: TableValueType.Population,
          sortParam: SortBy.Population,
        },
        {
          key: 'Languages',
          render: (object) =>
            object.languages && (
              <CommaSeparated limit={1} limitText="short">
                {Object.values(object.languages)
                  .sort((a, b) => (b.populationEstimate ?? 0) - (a.populationEstimate ?? 0))
                  .map((l) => (
                    <HoverableObjectName object={l} key={l.ID} />
                  ))}
              </CommaSeparated>
            ),
          sortParam: SortBy.Language,
        },
        {
          key: 'Language Count',
          render: (object) =>
            object.languages && (
              <HoverableEnumeration
                items={Object.values(object.languages).map((l) => l.nameDisplay)}
              />
            ),
          valueType: TableValueType.Count,
          sortParam: SortBy.CountOfLanguages,
          isInitiallyVisible: false,
        },
        {
          key: 'Area of Origin',
          render: (object) =>
            getTerritoriesRelevantToObject(object).length > 0 && (
              <CommaSeparated limit={1} limitText="short">
                {getTerritoriesRelevantToObject(object).map((territory) => (
                  <HoverableObjectName object={territory} key={territory.ID} />
                ))}
              </CommaSeparated>
            ),
          sortParam: SortBy.Territory,
          isInitiallyVisible: false,
        },
      ]}
    />
  );
};

export default WritingSystemTable;

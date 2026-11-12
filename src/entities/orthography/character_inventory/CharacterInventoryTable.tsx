import React, { useMemo } from 'react';

import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import { EntityData } from '@entities/types/EntityTypes';

import useCharacterInventoryData from './CharacterInventoryData';

const CharacterInventoryTable: React.FC = () => {
  const { sortedCounts, getCharColVisibility, currentCharsByEnt, entsWithCharData } =
    useCharacterInventoryData();

  const columns = useMemo(() => {
    return [
      { ...CodeColumn, columnGroup: 'Entry' },
      { ...NameColumn, columnGroup: 'Entry' },
      {
        key: 'Number of characters',
        columnGroup: 'Entry',
        render: (ent: EntityData) => currentCharsByEnt[ent.ID]?.size ?? 0,
        isInitiallyVisible: false,
      },
      ...sortedCounts.map(([char, count]) => ({
        key: char,
        description: `Character "${char}" is found in ${count} entries`,
        render: (ent: EntityData) => {
          const chars = currentCharsByEnt[ent.ID];
          return chars && chars.has(char) ? char : undefined;
        },
        isInitiallyVisible: () => getCharColVisibility(char, count),
        columnGroup: 'Character',
      })),
    ];
  }, [sortedCounts, currentCharsByEnt, getCharColVisibility]);

  return (
    <LocalParamsProvider overrides={{ writingSystemFilter: '', sortBy: Field.None }}>
      <InteractiveEntityTable<EntityData>
        tableID={TableID.Characters}
        ents={entsWithCharData}
        columns={columns}
      />
    </LocalParamsProvider>
  );
};

export default CharacterInventoryTable;

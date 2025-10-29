import React from 'react';

import PopulationWarning from '@widgets/PopulationWarning';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import TableValueType from '@features/table/TableValueType';

import { WritingSystemData } from '@entities/types/DataTypes';

const WritingSystemTable: React.FC = () => {
  const { writingSystems } = useDataContext();
  const endonymColumn = { ...EndonymColumn, isInitiallyVisible: true };

  return (
    <ObjectTable<WritingSystemData>
      objects={writingSystems}
      columns={[
        CodeColumn,
        NameColumn,
        endonymColumn,
        {
          label: (
            <>
              Population
              <PopulationWarning />
            </>
          ),
          key: 'Population',
          render: (object) => object.populationUpperBound,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Population,
        },
        {
          key: 'Languages',
          render: (object) =>
            object.languages && (
              <HoverableEnumeration
                items={Object.values(object.languages).map((l) => l.nameDisplay)}
              />
            ),
          valueType: TableValueType.Numeric,
          sortParam: SortBy.CountOfLanguages,
        },
      ]}
    />
  );
};

export default WritingSystemTable;

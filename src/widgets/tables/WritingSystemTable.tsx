import React from 'react';

import PopulationWarning from '@widgets/PopulationWarning';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';

import { WritingSystemData } from '@entities/types/DataTypes';

import HoverableEnumeration from '@shared/ui/HoverableEnumeration';

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
          isNumeric: true,
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
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },
      ]}
    />
  );
};

export default WritingSystemTable;

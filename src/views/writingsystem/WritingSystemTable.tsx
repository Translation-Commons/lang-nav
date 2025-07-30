import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { WritingSystemData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import {
  CodeColumn,
  EndonymColumn,
  InfoButtonColumn,
  NameColumn,
} from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const WritingSystemTable: React.FC = () => {
  const { writingSystems } = useDataContext();
  const endonymColumn = { ...EndonymColumn, isInitiallyVisible: true };

  return (
    <ObjectTable<WritingSystemData>
      objects={Object.values(writingSystems)}
      columns={[
        CodeColumn,
        NameColumn,
        endonymColumn,
        {
          key: 'Population',
          render: (object) => object.populationUpperBound,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'Languages',
          render: (object) => (
            <HoverableEnumeration
              items={Object.values(object.languages).map((l) => l.nameDisplay)}
            />
          ),
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default WritingSystemTable;

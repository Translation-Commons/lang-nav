import React from 'react';

import { useDataContext } from '../../data/DataContext';
import { WritingSystemData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const WritingSystemTable: React.FC = () => {
  const { writingSystems } = useDataContext();

  return (
    <ObjectTable<WritingSystemData>
      objects={Object.values(writingSystems)}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Population',
          render: (object) => object.populationUpperBound,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default WritingSystemTable;

import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { VariantData } from '@entities/variant/VariantTypes';

import getVariantColumns from './columns/VariantColumns';

const VariantTable: React.FC = () => {
  const { variants } = useDataContext();
  const columns = getVariantColumns();

  return (
    <InteractiveObjectTable<VariantData>
      tableID={TableID.Variants}
      objects={variants}
      columns={columns}
    />
  );
};

export default VariantTable;

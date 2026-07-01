import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import getVariantColumns from './columns/VariantColumns';

const VariantTable: React.FC = () => {
  const { variants } = useDataContext();
  const columns = getVariantColumns();

  return (
    <InteractiveEntityTable tableID={TableID.Variants} entities={variants} columns={columns} />
  );
};

export default VariantTable;

import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { VariantTagData } from '@entities/varianttag/VariantTagTypes';

import getVariantColumns from './columns/VariantColumns';

const VariantTagTable: React.FC = () => {
  const { variantTags } = useDataContext();
  const columns = getVariantColumns();

  return (
    <InteractiveObjectTable<VariantTagData>
      tableID={TableID.VariantTags}
      objects={variantTags}
      columns={columns}
    />
  );
};

export default VariantTagTable;

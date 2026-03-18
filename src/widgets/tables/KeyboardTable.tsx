import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import getKeyboardColumns from './columns/KeyboardColumns';

const KeyboardTable: React.FC = () => {
  const { keyboards } = useDataContext();
  const columns = useMemo(() => getKeyboardColumns(), []);

  return (
    <InteractiveObjectTable<KeyboardData>
      tableID={TableID.Keyboards}
      objects={keyboards}
      columns={columns}
    />
  );
};

export default KeyboardTable;

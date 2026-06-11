import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import getKeyboardColumns from './columns/KeyboardColumns';

const KeyboardTable: React.FC = () => {
  const { keyboards } = useDataContext();
  const columns = useMemo(() => getKeyboardColumns(), []);

  return (
    <InteractiveEntityTable<KeyboardData>
      tableID={TableID.Keyboards}
      entities={keyboards}
      columns={columns}
    />
  );
};

export default KeyboardTable;

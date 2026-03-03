import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

const KeyboardTable: React.FC = () => {
  const { keyboards } = useDataContext();

  return (
    <InteractiveObjectTable<KeyboardData>
      tableID={TableID.Keyboards}
      objects={keyboards}
      columns={[
        { ...CodeColumn, isInitiallyVisible: false },
        NameColumn,
        {
          key: 'Platform',
          render: (object) => object.platform,
          field: Field.Platform,
        },
        {
          key: 'Language',
          render: (object) => <HoverableObjectName object={object.language} />,
          field: Field.Language,
          columnGroup: 'Related Objects',
        },
        {
          key: 'Input Script',
          render: (object) => <HoverableObjectName object={object.inputWritingSystem} />,
          field: Field.InputScript,
          columnGroup: 'Related Objects',
        },
        {
          key: 'Output Script',
          render: (object) => <HoverableObjectName object={object.outputWritingSystem} />,
          field: Field.OutputScript,
          columnGroup: 'Related Objects',
        },
        {
          key: 'Territory',
          render: (object) => <HoverableObjectName object={object.territory} />,
          field: Field.Territory,
          columnGroup: 'Related Objects',
          isInitiallyVisible: false,
        },
        {
          key: 'Variant',
          render: (object) => object.variantTagCode,
          field: Field.VariantTag,
          columnGroup: 'Related Objects',
          isInitiallyVisible: false,
        },
      ]}
    />
  );
};

export default KeyboardTable;

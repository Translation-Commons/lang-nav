import React from 'react';

import Field from '@features/transforms/fields/Field';
import ObjectFieldDisplay from '@features/transforms/fields/ObjectFieldDisplay';

import { ObjectData } from '@entities/types/DataTypes';

type Props = {
  object: ObjectData;
  field: Field;
};

const TreeListNodeData: React.FC<Props> = ({ object, field }) => {
  if (field === Field.None) return null;

  return (
    <div style={{ display: 'inline-block', position: 'absolute', right: 0 }}>
      <ObjectFieldDisplay object={object} field={field} />
    </div>
  );
};

export default TreeListNodeData;

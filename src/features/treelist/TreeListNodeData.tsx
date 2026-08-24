import React from 'react';

import Field from '@features/transforms/fields/Field';
import ObjectFieldDisplay from '@features/transforms/fields/ObjectFieldDisplay';

import { EntityData } from '@entities/types/DataTypes';

type Props = {
  ent: EntityData;
  field: Field;
};

const TreeListNodeData: React.FC<Props> = ({ ent, field }) => {
  if (field === Field.None) return null;

  return (
    <div style={{ display: 'inline-block', position: 'absolute', right: 0 }}>
      <ObjectFieldDisplay ent={ent} field={field} />
    </div>
  );
};

export default TreeListNodeData;

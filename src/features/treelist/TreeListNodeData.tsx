import React from 'react';

import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';

import { EntityData } from '@entities/types/DataTypes';

type Props = {
  ent: EntityData;
  field: Field;
};

const TreeListNodeData: React.FC<Props> = ({ ent, field }) => {
  if (field === Field.None) return null;

  return (
    <div style={{ display: 'inline-block', position: 'absolute', right: 0 }}>
      <EntityFieldDisplay ent={ent} field={field} />
    </div>
  );
};

export default TreeListNodeData;

import React from 'react';

import { ColorBy } from '@features/transforms/coloring/ColorTypes';
import ObjectField from '@features/transforms/fields/ObjectField';

import { ObjectData } from '@entities/types/DataTypes';

type Props = {
  object: ObjectData;
  field: ColorBy;
};

const TreeListNodeData: React.FC<Props> = ({ object, field }) => {
  if (field === 'None') return null;

  return (
    <div style={{ display: 'inline-block', position: 'absolute', right: 0 }}>
      <ObjectField object={object} field={field} />
    </div>
  );
};

export default TreeListNodeData;

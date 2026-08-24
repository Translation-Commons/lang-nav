import React from 'react';

import ObjectPath from '@widgets/pathnav/ObjectPath';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { EntityType } from '@features/params/PageParamTypes';

import { getDepth } from '@entities/lib/getObjectMiscFields';
import { EntityData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const ObjectDepthDisplay: React.FC<{ ent: EntityData }> = ({ ent }) => {
  if (ent.type === EntityType.Census || ent.type === EntityType.Variant)
    return <Deemphasized>n/a</Deemphasized>;

  const depth = getDepth(ent);
  if (depth == null) return <Deemphasized>Unknown</Deemphasized>;

  return (
    <Hoverable hoverContent={<ObjectPath ent={ent} showChildren={false} />}>
      {depth || 'Root'}
    </Hoverable>
  );
};

export default ObjectDepthDisplay;

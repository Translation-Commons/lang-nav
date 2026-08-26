import React from 'react';

import EntityPath from '@widgets/pathnav/EntityPath';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { EntityType } from '@features/params/PageParamTypes';

import { getDepth } from '@entities/lib/getEntityMiscFields';
import { EntityData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const EntityDepthDisplay: React.FC<{ ent: EntityData }> = ({ ent }) => {
  if (ent.type === EntityType.Census || ent.type === EntityType.Variant)
    return <Deemphasized>n/a</Deemphasized>;

  const depth = getDepth(ent);
  if (depth == null) return <Deemphasized>Unknown</Deemphasized>;

  return (
    <Hoverable hoverContent={<EntityPath ent={ent} showChildren={false} />}>
      {depth || 'Root'}
    </Hoverable>
  );
};

export default EntityDepthDisplay;

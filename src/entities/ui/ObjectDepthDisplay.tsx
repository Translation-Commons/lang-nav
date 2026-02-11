import React from 'react';

import ObjectPath from '@widgets/pathnav/ObjectPath';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { ObjectType } from '@features/params/PageParamTypes';

import { getDepth } from '@entities/lib/getObjectMiscFields';
import { ObjectData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const ObjectDepthDisplay: React.FC<{
  object: ObjectData;
}> = ({ object }) => {
  if (object.type === ObjectType.Census || object.type === ObjectType.VariantTag)
    return <Deemphasized>n/a</Deemphasized>;

  const depth = getDepth(object);
  if (depth == null) return <Deemphasized>Unknown</Deemphasized>;

  return (
    <Hoverable hoverContent={<ObjectPath object={object} showChildren={false} />}>
      {depth || 'Root'}
    </Hoverable>
  );
};

export default ObjectDepthDisplay;

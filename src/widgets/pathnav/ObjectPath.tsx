import { SlashIcon } from 'lucide-react';
import React from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { ObjectData } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';

import ObjectPathChildren from './ObjectPathChildren';
import ObjectPathParents from './ObjectPathParents';

const ObjectPath: React.FC = () => {
  const { objectID } = usePageParams();
  const object = getObjectFromID(objectID);
  if (!object) return null;

  return (
    <>
      <ObjectPathParents object={object} />
      <ObjectName object={object} />
      <ObjectPathChildren object={object} />
    </>
  );
};

const ObjectName: React.FC<{ object?: ObjectData }> = ({ object }) => {
  if (!object) return null;
  return (
    <>
      {object.type === ObjectType.Locale ? (
        <span style={{ fontWeight: 'bold' }}>:</span>
      ) : (
        <SlashIcon size="1em" />
      )}
      <HoverableObjectName object={object} style={{ fontWeight: 'bold' }} />
    </>
  );
};

export default ObjectPath;

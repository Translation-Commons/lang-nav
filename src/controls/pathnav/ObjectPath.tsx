import { SlashIcon } from 'lucide-react';
import React from 'react';

import { ObjectData } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import getObjectFromID from '../../views/common/getObjectFromID';
import HoverableObjectName from '../../views/common/HoverableObjectName';
import { usePageParams } from '../PageParamsContext';

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

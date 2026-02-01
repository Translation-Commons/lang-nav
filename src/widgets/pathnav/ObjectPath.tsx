import { SlashIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';
import getObjectFromID from '@entities/lib/getObjectFromID';
import { ObjectData } from '@entities/types/DataTypes';

import ObjectPathChildren from './ObjectPathChildren';
import ObjectPathParents from './ObjectPathParents';

const ObjectPath: React.FC = () => {
  const { objectID, languageSource } = usePageParams();
  const object = getObjectFromID(objectID);
  if (!object) return null;
  if (object.type === ObjectType.Language) {
    // Not all language sources have parent/child data
    switch (languageSource) {
      case LanguageSource.Combined:
      case LanguageSource.Glottolog:
      case LanguageSource.ISO:
        break; // These all have parent/child data, continue
      case LanguageSource.CLDR:
      case LanguageSource.Ethnologue:
      case LanguageSource.UNESCO:
      case LanguageSource.BCP:
        // These sources do not support language families
        return null;
    }
  }

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

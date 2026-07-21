import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';

import { getLocaleName } from '@entities/locale/LocaleStrings';
import { ObjectData } from '@entities/types/DataTypes';

import HoverableObject from './HoverableObject';

type Props = {
  object?: ObjectData;
  labelSource?:
    | 'name'
    | 'code'
    | 'territory'
    | 'language'
    | 'locale without territory'
    | 'name and code';
  format?: 'text' | 'button';
  className?: string;
  style?: React.CSSProperties;
};

const HoverableObjectName: React.FC<Props> = ({
  object,
  labelSource = 'name',
  format = 'text',
  className,
  style,
}) => {
  if (!object) return null;

  let label = labelSource == 'code' ? object.codeDisplay : object.nameDisplay;
  if (labelSource == 'name and code') {
    label = `${object.nameDisplay} [${object.codeDisplay}]`;
  }
  if (object.type === ObjectType.Locale) {
    if (labelSource == 'language') {
      label = object.language?.nameDisplay ?? object.languageCode;
    } else if (labelSource == 'territory') {
      label = object.territory?.nameDisplay ?? object.territoryCode ?? '[no territory]';
    } else if (labelSource == 'locale without territory') {
      label = getLocaleName(object, false /* withTerritory */);
    }
  }

  return (
    <HoverableObject object={object}>
      <span className={className} style={style}>
        {format === 'text' ? label : <button>{label}</button>}
      </span>
    </HoverableObject>
  );
};

export default HoverableObjectName;

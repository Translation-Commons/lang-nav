import { ObjectData } from '@entities/types/DataTypes';
import { ObjectType } from '@widgets/PageParamTypes';
import React from 'react';

import HoverableObject from './HoverableObject';

type Props = {
  object?: ObjectData;
  labelSource?: 'name' | 'code' | 'territory' | 'language';
  format?: 'text' | 'button';
  style?: React.CSSProperties;
  className?: string;
};

const HoverableObjectName: React.FC<Props> = ({
  object,
  labelSource = 'name',
  format = 'text',
  style,
}) => {
  if (!object) return null;

  let label = labelSource == 'code' ? object.codeDisplay : object.nameDisplay;
  if (object.type === ObjectType.Locale) {
    if (labelSource == 'language') {
      label = object.language?.nameDisplay ?? object.languageCode;
    } else if (labelSource == 'territory') {
      label = object.territory?.nameDisplay ?? object.territoryCode ?? '[no territory]';
    }
  }

  return (
    <HoverableObject object={object}>
      <span style={style}>{format === 'text' ? label : <button>{label}</button>}</span>
    </HoverableObject>
  );
};

export default HoverableObjectName;

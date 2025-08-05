import React from 'react';

import { ObjectData } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import HoverableObject from '../common/HoverableObject';

type Props = {
  object: ObjectData;
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
  let label = labelSource == 'code' ? object.codeDisplay : object.nameDisplay;
  if (object.type === ObjectType.Locale) {
    if (labelSource == 'language') {
      label = object.language?.nameDisplay ?? object.languageCode;
    } else if (labelSource == 'territory') {
      label = object.territory?.nameDisplay ?? object.territoryCode;
    }
  }

  return (
    <HoverableObject object={object}>
      <span style={style}>{format === 'text' ? label : <button>{label}</button>}</span>
    </HoverableObject>
  );
};

export default HoverableObjectName;

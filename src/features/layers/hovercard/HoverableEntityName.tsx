import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import { getLocaleName } from '@entities/locale/LocaleStrings';
import { EntityData } from '@entities/types/DataTypes';

import HoverableEntity from './HoverableEntity';

type Props = {
  ent?: EntityData;
  labelSource?:
    | 'name'
    | 'code'
    | 'territory'
    | 'language'
    | 'locale without language'
    | 'locale without territory'
    | 'name and code';
  format?: 'text' | 'button';
  style?: React.CSSProperties;
};

const HoverableEntityName: React.FC<Props> = ({
  ent,
  labelSource = 'name',
  format = 'text',
  style,
}) => {
  if (!ent) return null;

  let label = labelSource == 'code' ? ent.codeDisplay : ent.nameDisplay;
  if (labelSource == 'name and code') {
    label = `${ent.nameDisplay} [${ent.codeDisplay}]`;
  }
  if (ent.type === EntityType.Locale) {
    if (labelSource == 'language') {
      label = ent.language?.nameDisplay ?? ent.languageCode;
    } else if (labelSource == 'territory') {
      label = ent.territory?.nameDisplay ?? ent.territoryCode ?? '[no territory]';
    } else if (labelSource == 'locale without territory') {
      label = getLocaleName(ent, false /* includeTerritory */);
    } else if (labelSource == 'locale without language') {
      label = getLocaleName(ent, true, false /* includeLanguage */);
    }
  }

  return (
    <HoverableEntity ent={ent}>
      <span style={style}>{format === 'text' ? label : <button>{label}</button>}</span>
    </HoverableEntity>
  );
};

export default HoverableEntityName;

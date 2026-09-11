import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import { getLocaleName } from '@entities/locale/LocaleStrings';
import { EntityData } from '@entities/types/DataTypes';

export type EntityNameLabelSource =
  | 'name'
  | 'code'
  | 'territory'
  | 'language'
  | 'locale without language'
  | 'locale without territory'
  | 'name and code';

type Props = {
  ent?: EntityData;
  labelSource?: EntityNameLabelSource;
};

const EntityName: React.FC<Props> = ({ ent, labelSource = 'name' }) => {
  if (!ent) return null;

  if (ent.type === EntityType.Locale) {
    if (labelSource == 'language') {
      return ent.language?.nameDisplay ?? ent.languageCode;
    } else if (labelSource == 'territory') {
      return ent.territory?.nameDisplay ?? ent.territoryCode ?? '[no territory]';
    } else if (labelSource == 'locale without territory') {
      return getLocaleName(ent, false /* includeTerritory */);
    } else if (labelSource == 'locale without language') {
      return getLocaleName(ent, true, false /* includeLanguage */);
    }
  }

  switch (labelSource) {
    case 'code':
      return ent.codeDisplay;
    case 'name and code':
      return `${ent.nameDisplay} [${ent.codeDisplay}]`;
    case 'name':
    default:
      return ent.nameDisplay;
  }
};

export default EntityName;

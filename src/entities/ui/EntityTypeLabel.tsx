import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

const EntityTypeLabel: React.FC<{ ent: EntityData }> = ({ ent }) => {
  switch (ent.type) {
    case EntityType.Language:
      return getLanguageScopeLabel(ent.scope);
    case EntityType.Territory:
      return getTerritoryScopeLabel(ent.scope);
    case EntityType.Locale:
    case EntityType.WritingSystem:
    case EntityType.Census:
    case EntityType.Keyboard:
    case EntityType.Org:
    case EntityType.Variant:
    default:
      return ent.type;
  }
};

export default EntityTypeLabel;

import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export function getEntitySubtitle(entity: ObjectData): string | undefined {
  switch (entity.type) {
    case ObjectType.Language:
      return entity.nameEndonym ?? entity.nameSubtitle ?? undefined;
    case ObjectType.WritingSystem:
      return entity.nameDisplay != entity.nameFull ? entity.nameFull : undefined;
    case ObjectType.Locale:
    case ObjectType.Census:
    case ObjectType.Territory:
    case ObjectType.Keyboard:
    case ObjectType.Org:
      return undefined;
  }
}

export function getEntityTypeLabelPlural(entityType: ObjectType) {
  switch (entityType) {
    case ObjectType.Census:
      return 'censuses';
    case ObjectType.Language:
      return 'languages';
    case ObjectType.Locale:
      return 'languages in territories';
    case ObjectType.Territory:
      return 'territories';
    case ObjectType.WritingSystem:
      return 'writing systems';
    case ObjectType.Variant:
      return 'variants';
    case ObjectType.Keyboard:
      return 'keyboards';
    case ObjectType.Org:
      return 'organizations';
    default:
      enforceExhaustiveSwitch(entityType);
  }
}

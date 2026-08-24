import { EntityType } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export function getEntitySubtitle(entity: EntityData): string | undefined {
  switch (entity.type) {
    case EntityType.Language:
      return entity.nameEndonym ?? entity.nameSubtitle ?? undefined;
    case EntityType.WritingSystem:
      return entity.nameDisplay != entity.nameFull ? entity.nameFull : undefined;
    case EntityType.Locale:
    case EntityType.Census:
    case EntityType.Territory:
    case EntityType.Keyboard:
    case EntityType.Org:
      return undefined;
  }
}

export function getEntityTypeLabelPlural(entityType: EntityType) {
  switch (entityType) {
    case EntityType.Census:
      return 'censuses';
    case EntityType.Language:
      return 'languages';
    case EntityType.Locale:
      return 'languages in territories';
    case EntityType.Territory:
      return 'territories';
    case EntityType.WritingSystem:
      return 'writing systems';
    case EntityType.Variant:
      return 'variants';
    case EntityType.Keyboard:
      return 'keyboards';
    case EntityType.Org:
      return 'organizations';
    default:
      enforceExhaustiveSwitch(entityType);
  }
}

import { EntityData, EntityType } from '@entities/types/EntityTypes';

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
    case EntityType.Technology:
      return undefined;
  }
}

export function getEntityTypeLabelPlural(entType: EntityType, fullName: boolean = false) {
  switch (entType) {
    case EntityType.Census:
      return fullName ? 'census tables and other population records' : 'censuses';
    case EntityType.Language:
      return fullName ? 'languages, language families, and dialects' : 'languages';
    case EntityType.Locale:
      return 'languages in territories';
    case EntityType.Territory:
      return fullName ? 'countries, regions, and dependencies' : 'territories';
    case EntityType.WritingSystem:
      return 'writing systems';
    case EntityType.Orthography:
      return 'orthographies';
    case EntityType.Variant:
      return 'variants';
    case EntityType.Keyboard:
      return 'keyboards';
    case EntityType.Org:
      return 'organizations';
    case EntityType.Technology:
      return 'technologies';
    default:
      enforceExhaustiveSwitch(entType);
  }
}

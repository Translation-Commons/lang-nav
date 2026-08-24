import { EntityType } from '@features/params/PageParamTypes';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';

export function getObjectParents(
  ent?: EntityData,
  depth: number = 0, // to prevent infinite recursion in case of cycles
): (EntityData | undefined)[] {
  if (ent == null || depth > 20) return [];
  switch (ent.type) {
    case EntityType.Census:
      return [ent.territory];
    case EntityType.Language:
      return [...getObjectParents(ent.parentLanguage, depth + 1), ent.parentLanguage];
    case EntityType.Locale:
      return [ent.language, ent.writingSystem, ent.territory, ...(ent.variants ?? [])];
    case EntityType.Territory:
      return [...getObjectParents(ent.parentUNRegion, depth + 1), ent.parentUNRegion];
    case EntityType.WritingSystem:
      return [ent.parentWritingSystem];
    case EntityType.Variant:
      return [ent.languages[0]];
    case EntityType.Keyboard:
      return [];
    case EntityType.Org:
      return [ent.parent];
  }
}

export function getObjectChildren(ent?: EntityData): (EntityData | undefined)[] {
  if (ent == null) return [];
  switch (ent.type) {
    case EntityType.Census:
      return (ent.territory?.censuses ?? []).filter((c) => c.ID !== ent.ID);
    case EntityType.Language:
      return ent.childLanguages;
    case EntityType.Locale:
      if (!ent.relatedLocales) return [];
      return [
        ...(ent.relatedLocales.moreSpecific ?? []),
        ...(ent.relatedLocales.childLanguages ?? []),
        ...(ent.relatedLocales.childTerritories ?? []),
      ];
    case EntityType.Territory:
      return [...(ent.containsTerritories ?? []), ...(ent.dependentTerritories ?? [])];
    case EntityType.WritingSystem:
      return ent.childWritingSystems ?? [];
    case EntityType.Variant:
      return ent.locales;
    case EntityType.Keyboard:
      return [];
    case EntityType.Org:
      return ent.children ?? [];
  }
}

export function getObjectFullDescendants(ent: EntityData): EntityData[] {
  return getObjectChildren(ent).reduce<EntityData[]>(
    (all, child) => (child ? all.concat([child], getObjectFullDescendants(child)) : all),
    [],
  );
}

export function getDescendantsName(ent: EntityData, count: number): string {
  switch (ent.type) {
    case EntityType.Census:
      return 'other census' + (count > 1 ? 'es' : '') + ' in the territory';
    case EntityType.Language:
      switch (ent.scope) {
        case LanguageScope.Family:
          return count > 1 ? 'languages or subfamilies' : 'language or subfamily';
        case LanguageScope.Macrolanguage:
        case LanguageScope.SpecialCode:
          return 'language' + (count > 1 ? 's' : '');
        case LanguageScope.Language:
        case LanguageScope.Dialect:
          return 'dialect' + (count > 1 ? 's' : '');
      }
      return 'dialect' + (count > 1 ? 's' : '');
    case EntityType.Locale:
      return 'related locale' + (count > 1 ? 's' : '');
    case EntityType.Territory:
      switch (ent.scope) {
        case TerritoryScope.World:
          return 'continent' + (count > 1 ? 's' : '');
        case TerritoryScope.Continent:
        case TerritoryScope.Region:
          return 'region' + (count > 1 ? 's' : '');
        case TerritoryScope.Country:
        case TerritoryScope.Dependency:
          return 'subdivision' + (count > 1 ? 's' : '');
        case TerritoryScope.Subcontinent:
        default:
          return 'territor' + (count > 1 ? 'ies' : 'y');
      }
    case EntityType.WritingSystem:
      return 'child writing system' + (count > 1 ? 's' : '');
    case EntityType.Variant:
      return 'locale' + (count > 1 ? 's' : '');
    case EntityType.Keyboard:
      return 'keyboard' + (count > 1 ? 's' : '');
    case EntityType.Org:
      return 'organization' + (count > 1 ? 's' : '');
  }
}

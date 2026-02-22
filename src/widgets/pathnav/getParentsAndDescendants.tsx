import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';

export function getObjectParents(object?: ObjectData): (ObjectData | undefined)[] {
  if (object == null) return [];
  switch (object.type) {
    case ObjectType.Census:
      return [object.territory];
    case ObjectType.Language:
      return [...getObjectParents(object.parentLanguage), object.parentLanguage];
    case ObjectType.Locale:
      return [
        object.language,
        object.writingSystem,
        object.territory,
        ...(object.variantTags ?? []),
      ];
    case ObjectType.Territory:
      return [...getObjectParents(object.parentUNRegion), object.parentUNRegion];
    case ObjectType.WritingSystem:
      return [object.parentWritingSystem];
    case ObjectType.VariantTag:
      return [object.languages[0]];
    case ObjectType.Keyboard:
      return [object.language, object.territory].filter(Boolean);
  }
}

export function getObjectChildren(object?: ObjectData): (ObjectData | undefined)[] {
  if (object == null) return [];
  switch (object.type) {
    case ObjectType.Census:
      return (object.territory?.censuses ?? []).filter((c) => c.ID !== object.ID);
    case ObjectType.Language:
      return object.childLanguages;
    case ObjectType.Locale:
      if (!object.relatedLocales) return [];
      return [
        ...(object.relatedLocales.moreSpecific ?? []),
        ...(object.relatedLocales.childLanguages ?? []),
        ...(object.relatedLocales.childTerritories ?? []),
      ];
    case ObjectType.Territory:
      return [...(object.containsTerritories ?? []), ...(object.dependentTerritories ?? [])];
    case ObjectType.WritingSystem:
      return object.childWritingSystems ?? [];
    case ObjectType.VariantTag:
      return object.locales;
    case ObjectType.Keyboard:
      return [];
  }
}

export function getObjectFullDescendants(object: ObjectData): ObjectData[] {
  return getObjectChildren(object).reduce<ObjectData[]>(
    (all, child) => (child ? all.concat([child], getObjectFullDescendants(child)) : all),
    [],
  );
}

export function getDescendantsName(object: ObjectData, count: number): string {
  switch (object.type) {
    case ObjectType.Census:
      return 'other census' + (count > 1 ? 'es' : '') + ' in the territory';
    case ObjectType.Language:
      switch (object.scope) {
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
    case ObjectType.Locale:
      return 'related locale' + (count > 1 ? 's' : '');
    case ObjectType.Territory:
      switch (object.scope) {
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
    case ObjectType.WritingSystem:
      return 'child writing system' + (count > 1 ? 's' : '');
    case ObjectType.VariantTag:
      return 'locale' + (count > 1 ? 's' : '');
    case ObjectType.Keyboard:
      return 'keyboard' + (count > 1 ? 's' : '');
  }
}

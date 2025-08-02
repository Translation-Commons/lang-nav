import { ObjectData, TerritoryScope } from '../../types/DataTypes';
import { LanguageScope } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';

export function getObjectParents(object?: ObjectData): (ObjectData | undefined)[] {
  if (object == null) return [];
  switch (object.type) {
    case ObjectType.Census:
      return [object.territory];
    case ObjectType.Language:
      return [...getObjectParents(object.parentLanguage), object.parentLanguage];
    case ObjectType.Locale:
      return [object.language, object.writingSystem, object.territory, object.variantTag];
    case ObjectType.Territory:
      return [...getObjectParents(object.parentUNRegion), object.parentUNRegion];
    case ObjectType.WritingSystem:
      return [object.parentWritingSystem];
    case ObjectType.VariantTag:
      return [object.languages[0]];
  }
}

export function getObjectChildren(object?: ObjectData): (ObjectData | undefined)[] {
  if (object == null) return [];
  switch (object.type) {
    case ObjectType.Census:
      return [];
    case ObjectType.Language:
      return object.childLanguages;
    case ObjectType.Locale:
      return object.containedLocales ?? [];
    case ObjectType.Territory:
      return [...object.containsTerritories, ...object.dependentTerritories];
    case ObjectType.WritingSystem:
      return object.childWritingSystems;
    case ObjectType.VariantTag:
      return object.locales;
  }
}

export function getDescendantsName(object: ObjectData, count: number): string {
  switch (object.type) {
    case ObjectType.Census:
      return 'n/a';
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
      return 'variant' + (count > 1 ? 's' : '');
    case ObjectType.Territory:
      switch (object.scope) {
        case TerritoryScope.World:
          return 'continent' + (count > 1 ? 's' : '');
        case TerritoryScope.Continent:
        case TerritoryScope.Region:
          return 'region' + (count > 1 ? 's' : '');
        case TerritoryScope.Subcontinent:
          return 'territor' + (count > 1 ? 'ies' : 'y');
        case TerritoryScope.Country:
        case TerritoryScope.Dependency:
          return 'subdivision' + (count > 1 ? 's' : '');
      }
    // eslint-disable-next-line no-fallthrough
    case ObjectType.WritingSystem:
      return 'child writing system' + (count > 1 ? 's' : '');
    case ObjectType.VariantTag:
      return 'locale' + (count > 1 ? 's' : '');
  }
}

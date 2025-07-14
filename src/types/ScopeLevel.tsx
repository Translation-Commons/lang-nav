import {
  ObjectData,
  TerritoryData,
  TerritoryType,
  WritingSystemData,
  WritingSystemScope,
} from './DataTypes';
import { LanguageData, LanguageScope } from './LanguageTypes';
import { ObjectType } from './PageParamTypes';

export enum ScopeLevel {
  Groups = 'Groups', // Continents, Language Families
  Individuals = 'Individuals', // Countries, Languages
  Parts = 'Parts', // Dependencies, Dialects
  Other = 'Other', // Control Codes, No declared scope
}

export function getObjectScopeLevel(object: ObjectData): ScopeLevel {
  switch (object.type) {
    case ObjectType.Language:
      return getLanguageScopeLevel(object);
    case ObjectType.Locale:
      return object.scope;
    case ObjectType.Territory:
      return getTerritoryScopeLevel(object);
    case ObjectType.WritingSystem:
      return getWritingSystemScopeLevel(object);
    case ObjectType.Census:
      return ScopeLevel.Individuals; // Not well-defined for censuses
  }
}

export function getLanguageScopeLevel(lang: LanguageData): ScopeLevel {
  switch (lang.scope) {
    case LanguageScope.Family:
      return ScopeLevel.Groups;
    case LanguageScope.Macrolanguage:
    case LanguageScope.Language:
      return ScopeLevel.Individuals;
    case LanguageScope.Dialect:
      return ScopeLevel.Parts;
  }
  return ScopeLevel.Other;
}

export function getTerritoryScopeLevel(territory: TerritoryData): ScopeLevel {
  switch (territory.territoryType) {
    case TerritoryType.World:
    case TerritoryType.Continent:
    case TerritoryType.Subcontinent:
    case TerritoryType.Region:
      return ScopeLevel.Groups;
    case TerritoryType.Country:
      return ScopeLevel.Individuals;
    case TerritoryType.Dependency:
      return ScopeLevel.Parts;
  }
}

function getWritingSystemScopeLevel(writingSystem: WritingSystemData): ScopeLevel {
  switch (writingSystem.scope) {
    case WritingSystemScope.Group:
      return ScopeLevel.Groups;
    case WritingSystemScope.IndividualScript:
      return ScopeLevel.Individuals;
    case WritingSystemScope.Variation:
      return ScopeLevel.Parts;
    case WritingSystemScope.SpecialCode:
      return ScopeLevel.Other;
  }
}

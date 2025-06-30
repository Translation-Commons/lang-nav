import {
  ObjectData,
  TerritoryData,
  TerritoryType,
  WritingSystemData,
  WritingSystemScope,
} from './DataTypes';
import { LanguageData, LanguageScope } from './LanguageTypes';
import { ObjectType } from './PageParamTypes';

export enum Granularity {
  Macro = 'Macro', // Continents, Language Families
  Base = 'Base', // Countries, Languages
  Micro = 'Micro', // Dependencies, Dialects
  Special = 'Special', // Control Codes, No declared scope
}

export function getObjectGranularity(object: ObjectData): Granularity {
  switch (object.type) {
    case ObjectType.Language:
      return getLanguageGranularity(object);
    case ObjectType.Locale:
      return object.granularity;
    case ObjectType.Territory:
      return getTerritoryGranularity(object);
    case ObjectType.WritingSystem:
      return getWritingSystemGranularity(object);
    case ObjectType.Census:
      return Granularity.Base; // Not well-defined for censuses
  }
}

export function getLanguageGranularity(lang: LanguageData): Granularity {
  switch (lang.scope) {
    case LanguageScope.Family:
      return Granularity.Macro;
    case LanguageScope.Macrolanguage:
    case LanguageScope.Language:
      return Granularity.Base;
    case LanguageScope.Dialect:
      return Granularity.Micro;
  }
  return Granularity.Special;
}

function getTerritoryGranularity(territory: TerritoryData): Granularity {
  switch (territory.territoryType) {
    case TerritoryType.World:
    case TerritoryType.Continent:
    case TerritoryType.Subcontinent:
    case TerritoryType.Region:
      return Granularity.Macro;
    case TerritoryType.Country:
      return Granularity.Base;
    case TerritoryType.Dependency:
      return Granularity.Micro;
  }
}

function getWritingSystemGranularity(writingSystem: WritingSystemData): Granularity {
  switch (writingSystem.scope) {
    case WritingSystemScope.Group:
      return Granularity.Macro;
    case WritingSystemScope.IndividualScript:
      return Granularity.Base;
    case WritingSystemScope.Variation:
      return Granularity.Micro;
    case WritingSystemScope.SpecialCode:
      return Granularity.Special;
  }
}

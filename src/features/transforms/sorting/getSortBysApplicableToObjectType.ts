import { ObjectType } from '@features/params/PageParamTypes';

import { SortBy } from './SortTypes';

const COMMON_SORT_BYS = [SortBy.Code, SortBy.Name, SortBy.Population];

/** Not necessarily exhaustive, just the ones that will appear in the sidebar */
export default function getSortBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  return [...COMMON_SORT_BYS, ...getSortBysSpecificToObjectType(objectType)];
}

function getSortBysSpecificToObjectType(objectType: ObjectType): SortBy[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        SortBy.Endonym,
        SortBy.PopulationDirectlySourced,
        SortBy.Literacy,
        SortBy.PercentOfOverallLanguageSpeakers,
        SortBy.PercentOfTerritoryPopulation,
        SortBy.CountOfLanguages,
        SortBy.Language,
        SortBy.WritingSystem,
        SortBy.Territory,
      ];
    case ObjectType.Territory:
      return [
        SortBy.Endonym,
        SortBy.Literacy,
        SortBy.CountOfLanguages,
        SortBy.CountOfTerritories,
        SortBy.Latitude,
        SortBy.Longitude,
        SortBy.Area,
        SortBy.Language,
        SortBy.WritingSystem,
        SortBy.Territory, // Equivalent to DisplayName for territories
        SortBy.PopulationDirectlySourced,
        SortBy.PercentOfTerritoryPopulation,
        SortBy.PopulationPercentInBiggestDescendantLanguage,
      ];
    case ObjectType.Language:
      return [
        SortBy.Endonym,
        SortBy.Literacy,
        SortBy.CountOfTerritories,
        SortBy.CountOfLanguages,
        SortBy.Language, // Equivalent to DisplayName for languages
        SortBy.WritingSystem,
        SortBy.Territory,
        SortBy.PopulationDirectlySourced,
        SortBy.PopulationOfDescendants,
        SortBy.PercentOfOverallLanguageSpeakers,
        SortBy.VitalityMetascore,
        SortBy.ISOStatus,
        SortBy.VitalityEthnologue2013,
        SortBy.VitalityEthnologue2025,
        SortBy.Latitude,
        SortBy.Longitude,
      ];
    case ObjectType.Census:
      return [
        SortBy.Date,
        SortBy.PopulationDirectlySourced,
        SortBy.PercentOfTerritoryPopulation,
        SortBy.Territory,
        SortBy.CountOfLanguages,
      ];
    case ObjectType.WritingSystem:
      return [
        SortBy.Endonym,
        // SortBy.Literacy, Data not available yet
        SortBy.Language,
        SortBy.CountOfLanguages,
        SortBy.PopulationOfDescendants,
        SortBy.Territory,
        SortBy.WritingSystem, // Equivalent to DisplayName for writing systems
      ];
    case ObjectType.VariantTag:
      return [SortBy.Date, SortBy.CountOfLanguages, SortBy.Language];
  }
}

import { ObjectType } from '@features/params/PageParamTypes';

import { SortBy } from './SortTypes';

/** Not necessarily exhaustive, just the ones that will appear in the sidebar */
export default function getSortBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        SortBy.PopulationDirectlySourced,
        SortBy.Literacy,
        SortBy.PercentOfOverallLanguageSpeakers,
        SortBy.CountOfLanguages,
        SortBy.Language,
        SortBy.WritingSystem,
        SortBy.Territory,
      ];
    case ObjectType.Territory:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Population,
        SortBy.Literacy,
        SortBy.CountOfLanguages,
        SortBy.CountOfTerritories,
        SortBy.Latitude,
        SortBy.Longitude,
        SortBy.Area,
      ];
    case ObjectType.Language:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        SortBy.Literacy,
        SortBy.CountOfTerritories,
        SortBy.CountOfLanguages,
        SortBy.WritingSystem,
        SortBy.Territory,
        SortBy.PopulationDirectlySourced,
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
        SortBy.Code,
        SortBy.Name,
        SortBy.Population,
        SortBy.Territory,
        SortBy.CountOfLanguages,
      ];
    case ObjectType.WritingSystem:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        // SortBy.Literacy, Data not available yet
        SortBy.Language,
        SortBy.CountOfLanguages,
        SortBy.PopulationOfDescendants,
      ];
    case ObjectType.VariantTag:
      return [SortBy.Date, SortBy.Code, SortBy.Name, SortBy.Population, SortBy.CountOfLanguages];
  }
}

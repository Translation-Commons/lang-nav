import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageSource } from '@entities/language/LanguageTypes';
import {
  getCountOfLanguages,
  getCountOfTerritories,
  getObjectDateAsNumber,
  getObjectLiteracy,
  getObjectMostImportantLanguageName,
} from '@entities/lib/getObjectMiscFields';
import {
  getObjectPercentOfTerritoryPopulation,
  getObjectPopulation,
  getObjectPopulationAttested,
  getObjectPopulationOfDescendants,
  getObjectPopulationPercentInBiggestDescendantLanguage,
  getObjectPopulationRelativeToOverallLanguageSpeakers,
} from '@entities/lib/getObjectPopulation';
import { ObjectData } from '@entities/types/DataTypes';

import { ColorBy } from '../coloring/ColorTypes';
import {
  getTerritoriesRelevantToObject,
  getWritingSystemsRelevantToObject,
} from '../filtering/filterByConnections';
import { SortBy } from '../sorting/SortTypes';

export function getSortField(
  object: ObjectData,
  sortBy: ColorBy,
  effectiveLanguageSource: LanguageSource = LanguageSource.Combined,
): string | number | undefined {
  if (sortBy === 'None') return undefined;

  switch (sortBy) {
    case SortBy.Code:
      return object.codeDisplay;
    case SortBy.Name:
      return object.nameDisplay;
    case SortBy.Endonym:
      return object.nameEndonym;
    case SortBy.CountOfTerritories:
      return getCountOfTerritories(object);
    case SortBy.CountOfLanguages:
      return getCountOfLanguages(object);
    case SortBy.Literacy:
      return getObjectLiteracy(object);
    case SortBy.Date:
      return getObjectDateAsNumber(object);
    case SortBy.Language:
      return getObjectMostImportantLanguageName(object);
    case SortBy.WritingSystem:
      return getWritingSystemsRelevantToObject(object)?.[0]?.nameDisplay;
    case SortBy.Territory:
      return getTerritoriesRelevantToObject(object)?.[0]?.nameDisplay;
    case SortBy.Latitude:
      return object.type === ObjectType.Language || object.type === ObjectType.Territory
        ? object.latitude
        : undefined;
    case SortBy.Longitude:
      return object.type === ObjectType.Language || object.type === ObjectType.Territory
        ? object.longitude
        : undefined;
    case SortBy.Area:
      return object.type === ObjectType.Territory ? object.landArea : undefined;

    // Population
    case SortBy.Population:
      return getObjectPopulation(object);
    case SortBy.PopulationAttested:
      return getObjectPopulationAttested(object);
    case SortBy.PopulationOfDescendants:
      return getObjectPopulationOfDescendants(object, effectiveLanguageSource);
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
      return getObjectPopulationPercentInBiggestDescendantLanguage(object);
    case SortBy.PercentOfTerritoryPopulation:
      return getObjectPercentOfTerritoryPopulation(object);
    case SortBy.PercentOfOverallLanguageSpeakers:
      return getObjectPopulationRelativeToOverallLanguageSpeakers(object);

    // Vitality
    case SortBy.VitalityMetascore:
      if (object.type === ObjectType.Language) return object.vitalityMetascore;
      if (object.type === ObjectType.Locale) return object.language?.vitalityMetascore;
      return undefined;
    case SortBy.ISOStatus:
      if (object.type === ObjectType.Language) return object.ISO.status;
      if (object.type === ObjectType.Locale) return object.language?.ISO.status;
      return undefined;
    case SortBy.VitalityEthnologue2013:
      if (object.type === ObjectType.Locale) return object.language?.vitalityEth2013;
      if (object.type === ObjectType.Language) return object.vitalityEth2013;
      return undefined;
    case SortBy.VitalityEthnologue2025:
      if (object.type === ObjectType.Locale) return object.language?.vitalityEth2025;
      if (object.type === ObjectType.Language) return object.vitalityEth2025;
      return undefined;
  }
}

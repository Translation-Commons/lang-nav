import { ObjectType } from '@features/params/PageParamTypes';

import {
  getCountOfCensuses,
  getCountOfLanguages,
  getCountOfWritingSystems,
  getObjectDateAsNumber,
  getObjectLiteracy,
  getObjectMostImportantLanguageName,
  getWritingSystemsInObject,
} from '@entities/lib/getObjectMiscFields';
import {
  getObjectPercentOfTerritoryPopulation,
  getObjectPopulation,
  getObjectPopulationDirectlySourced,
  getObjectPopulationOfDescendants,
  getObjectPopulationPercentInBiggestDescendantLanguage,
  getObjectPopulationRelativeToOverallLanguageSpeakers,
} from '@entities/lib/getObjectPopulation';
import {
  getContainingTerritories,
  getCountOfChildTerritories,
  getCountOfCountries,
} from '@entities/lib/getObjectRelatedTerritories';
import { ObjectData } from '@entities/types/DataTypes';

import { ColorBy } from '../coloring/ColorTypes';
import { SortBy } from '../sorting/SortTypes';

export function getSortField(object: ObjectData, sortBy: ColorBy): string | number | undefined {
  if (sortBy === 'None') return undefined;

  switch (sortBy) {
    case SortBy.Code:
      return object.codeDisplay;
    case SortBy.Name:
      return object.nameDisplay;
    case SortBy.Endonym:
      return object.nameEndonym;
    case SortBy.CountOfLanguages:
      return getCountOfLanguages(object);
    case SortBy.CountOfCountries:
      return getCountOfCountries(object);
    case SortBy.CountOfChildTerritories:
      return getCountOfChildTerritories(object);
    case SortBy.CountOfWritingSystems:
      return getCountOfWritingSystems(object);
    case SortBy.CountOfCensuses:
      return getCountOfCensuses(object);
    case SortBy.Literacy:
      return getObjectLiteracy(object);
    case SortBy.Date:
      return getObjectDateAsNumber(object);
    case SortBy.Language:
      return getObjectMostImportantLanguageName(object);
    case SortBy.WritingSystem:
      return getWritingSystemsInObject(object)?.[0]?.nameDisplay;
    case SortBy.Territory:
      return getContainingTerritories(object)?.[0]?.nameDisplay;
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
    case SortBy.PopulationDirectlySourced:
      return getObjectPopulationDirectlySourced(object);
    case SortBy.PopulationOfDescendants:
      return getObjectPopulationOfDescendants(object);
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
      return getObjectPopulationPercentInBiggestDescendantLanguage(object);
    case SortBy.PercentOfTerritoryPopulation:
      return getObjectPercentOfTerritoryPopulation(object);
    case SortBy.PercentOfOverallLanguageSpeakers:
      return getObjectPopulationRelativeToOverallLanguageSpeakers(object);

    // Vitality
    case SortBy.VitalityMetascore:
      if (object.type === ObjectType.Language) return object.vitality?.meta;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.meta;
      return undefined;
    case SortBy.ISOStatus:
      if (object.type === ObjectType.Language) return object.vitality?.iso;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.iso;
      return undefined;
    case SortBy.VitalityEthnologue2013:
      if (object.type === ObjectType.Language) return object.vitality?.ethFine;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.ethFine;
      return undefined;
    case SortBy.VitalityEthnologue2025:
      if (object.type === ObjectType.Language) return object.vitality?.ethCoarse;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.ethCoarse;
      return undefined;
    case SortBy.Modality:
      if (object.type === ObjectType.Language) return object.modality;
      if (object.type === ObjectType.Locale) return object.language?.modality;
      return undefined;
  }
}

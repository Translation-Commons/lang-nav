import { ObjectType } from '@features/params/PageParamTypes';

import {
  getCountOfCensuses,
  getCountOfLanguages,
  getCountOfWritingSystems,
  getDepth,
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

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from './Field';

function getField(object: ObjectData, field: Field): string | number | undefined {
  switch (field) {
    case Field.None:
      return undefined;
    case Field.Code:
      return object.codeDisplay;
    case Field.Name:
      return object.nameDisplay;
    case Field.Endonym:
      return object.nameEndonym;
    // Counts of Related Objects
    case Field.CountOfLanguages:
      return getCountOfLanguages(object);
    case Field.CountOfCountries:
      return getCountOfCountries(object);
    case Field.CountOfChildTerritories:
      return getCountOfChildTerritories(object);
    case Field.CountOfWritingSystems:
      return getCountOfWritingSystems(object);
    case Field.CountOfCensuses:
      return getCountOfCensuses(object);

    case Field.Depth:
      return getDepth(object);
    case Field.Literacy:
      return getObjectLiteracy(object);
    case Field.Date:
      return getObjectDateAsNumber(object);
    case Field.Language:
      return getObjectMostImportantLanguageName(object);
    case Field.WritingSystem:
      return getWritingSystemsInObject(object)?.[0]?.nameDisplay;
    case Field.Territory:
      return getContainingTerritories(object)?.[0]?.nameDisplay;
    case Field.Latitude:
      return object.type === ObjectType.Language || object.type === ObjectType.Territory
        ? object.latitude
        : undefined;
    case Field.Longitude:
      return object.type === ObjectType.Language || object.type === ObjectType.Territory
        ? object.longitude
        : undefined;
    case Field.Area:
      return object.type === ObjectType.Territory ? object.landArea : undefined;

    // Population
    case Field.Population:
      return getObjectPopulation(object);
    case Field.PopulationDirectlySourced:
      return getObjectPopulationDirectlySourced(object);
    case Field.PopulationOfDescendants:
      return getObjectPopulationOfDescendants(object);
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return getObjectPopulationPercentInBiggestDescendantLanguage(object);
    case Field.PercentOfTerritoryPopulation:
      return getObjectPercentOfTerritoryPopulation(object);
    case Field.PercentOfOverallLanguageSpeakers:
      return getObjectPopulationRelativeToOverallLanguageSpeakers(object);

    // Vitality
    case Field.VitalityMetascore:
      if (object.type === ObjectType.Language) return object.vitality?.meta;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.meta;
      return undefined;
    case Field.ISOStatus:
      if (object.type === ObjectType.Language) return object.vitality?.iso;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.iso;
      return undefined;
    case Field.VitalityEthnologueFine:
      if (object.type === ObjectType.Language) return object.vitality?.ethFine;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.ethFine;
      return undefined;
    case Field.VitalityEthnologueCoarse:
      if (object.type === ObjectType.Language) return object.vitality?.ethCoarse;
      if (object.type === ObjectType.Locale) return object.language?.vitality?.ethCoarse;
      return undefined;
    case Field.Modality:
      if (object.type === ObjectType.Language) return object.modality;
      if (object.type === ObjectType.Locale) return object.language?.modality;
      return undefined;

    default:
      enforceExhaustiveSwitch(field);
  }
}

export default getField;

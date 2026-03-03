import { ObjectType } from '@features/params/PageParamTypes';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
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
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from './Field';

// Get's a primitive value for a given object and field, used for sorting and filtering.
// Returns undefined if the field is not applicable to the object type or if the value is missing.
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

    case Field.Depth:
      return getDepth(object);
    case Field.Literacy:
      return getObjectLiteracy(object);
    case Field.Date:
      return getObjectDateAsNumber(object);
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

    case Field.LanguageScope:
      return getLanguageForEntity(object)?.scope;
    case Field.TerritoryScope:
      return getTerritoryForEntity(object)?.scope;
    case Field.LanguageFormedHere:
      return object.type !== ObjectType.Locale || object.langFormedHere == null
        ? undefined
        : object.langFormedHere
          ? 1
          : 0;
    case Field.HistoricPresence:
      return object.type !== ObjectType.Locale || object.historicPresence == null
        ? undefined
        : object.historicPresence
          ? 1
          : 0;

    // Related objects
    case Field.Language:
      return getObjectMostImportantLanguageName(object);
    case Field.WritingSystem:
      return getWritingSystemsInObject(object)?.[0]?.nameDisplay;
    case Field.Territory:
      return getContainingTerritories(object)?.[0]?.nameDisplay;

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
      return getLanguageForEntity(object)?.vitality?.meta;
    case Field.ISOStatus:
      return getLanguageForEntity(object)?.vitality?.iso;
    case Field.VitalityEthnologueFine:
      return getLanguageForEntity(object)?.vitality?.ethFine;
    case Field.VitalityEthnologueCoarse:
      return getLanguageForEntity(object)?.vitality?.ethCoarse;
    case Field.Modality:
      return getLanguageForEntity(object)?.modality;

    // Keyboard fields
    case Field.Platform:
      return getKeyboardForEntity(object)?.platform;
    case Field.InputScript:
      return getKeyboardForEntity(object)?.inputWritingSystem?.nameDisplay;
    case Field.OutputScript:
      return getKeyboardForEntity(object)?.outputWritingSystem?.nameDisplay;
    case Field.VariantTag:
      return getKeyboardForEntity(object)?.variantTagCode;

    default:
      enforceExhaustiveSwitch(field);
  }
}

export function getLanguageForEntity(object: ObjectData | undefined): LanguageData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.Language) return object;
  if (object.type === ObjectType.Locale) return object.language;
  if (object.type === ObjectType.Keyboard) return object.language;
  return undefined;
}

export function getTerritoryForEntity(object: ObjectData | undefined): TerritoryData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.Territory) return object;
  if (object.type === ObjectType.Locale) return object.territory;
  if (object.type === ObjectType.Census) return object.territory;
  if (object.type === ObjectType.Keyboard) return object.territory;
  return undefined;
}

export function getKeyboardForEntity(object: ObjectData | undefined): KeyboardData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.Keyboard) return object;
  return undefined;
}

export default getField;

import { ObjectType } from '@features/params/PageParamTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { unique } from '@shared/lib/setUtils';

import Transform from '../TransformEnum';

import Field from './Field';

// Common fields available across most object types
const COMMON_FIELDS: Field[] = [Field.None, Field.Code, Field.Name, Field.Population];

// Specific fields available per object type
function getSpecificFieldsForObjectType(objectType: ObjectType): Field[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        Field.Endonym,
        Field.Depth,
        Field.PopulationDirectlySourced,
        Field.Literacy,
        Field.Modality,
        Field.PercentOfOverallLanguageSpeakers,
        Field.PercentOfTerritoryPopulation,
        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,
        Field.Language,
        Field.WritingSystem,
        Field.Territory,
        Field.LanguageScope,
        Field.TerritoryScope,
        Field.LanguageFormedHere,
        Field.HistoricPresence,
        Field.ISOStatus,
      ];
    case ObjectType.Territory:
      return [
        Field.Endonym,
        Field.Depth,
        Field.Literacy,
        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,
        Field.Latitude,
        Field.Longitude,
        Field.Area,
        Field.Language,
        Field.WritingSystem,
        Field.Territory, // Equivalent to DisplayName for territories
        Field.PopulationDirectlySourced,
        Field.PercentOfTerritoryPopulation,
        Field.PopulationPercentInBiggestDescendantLanguage,
        Field.TerritoryScope,
      ];
    case ObjectType.Language:
      return [
        Field.Endonym,
        Field.Depth,
        Field.Literacy,
        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.Modality,
        Field.Language, // Equivalent to DisplayName for languages
        Field.WritingSystem,
        Field.Territory,
        Field.PopulationDirectlySourced,
        Field.PopulationOfDescendants,
        Field.PopulationPercentInBiggestDescendantLanguage,
        Field.PercentOfOverallLanguageSpeakers,
        Field.VitalityMetascore,
        Field.ISOStatus,
        // Field.VitalityEthnologueFine,
        // Field.VitalityEthnologueCoarse,
        Field.Latitude,
        Field.Longitude,
        Field.LanguageScope,
      ];
    case ObjectType.Census:
      return [
        Field.Date,
        Field.PopulationDirectlySourced,
        Field.PercentOfTerritoryPopulation,
        Field.Territory,
        Field.TerritoryScope,
        Field.CountOfLanguages,
      ];
    case ObjectType.WritingSystem:
      return [
        Field.Endonym,
        Field.Depth,
        // Field.Literacy, Data not available yet
        Field.Language,
        Field.CountOfLanguages,
        Field.CountOfCountries,
        Field.CountOfWritingSystems,
        Field.PopulationOfDescendants,
        Field.Territory,
        Field.WritingSystem, // Equivalent to DisplayName for writing systems
      ];
    case ObjectType.VariantTag:
      return [Field.Date, Field.CountOfLanguages, Field.CountOfChildTerritories, Field.Language];
    case ObjectType.Keyboard:
      return [Field.Language, Field.WritingSystem, Field.Territory];
    default:
      return enforceExhaustiveSwitch(objectType);
  }
}

function getFieldsForTransform(transform: Transform): Field[] {
  switch (transform) {
    case Transform.Sort:
      // Easier to list fields that aren't sortable than to list all that are, since most are
      return Object.values(Field).filter(
        (f) =>
          ![Field.None, Field.VitalityEthnologueCoarse, Field.VitalityEthnologueFine].includes(f),
      );
    case Transform.Color:
      // Ordered by preferred UI grouping: quantitative first, then text fields
      return [
        Field.None,
        Field.Population,
        Field.PopulationDirectlySourced,
        Field.Area,
        Field.Depth,
        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,
        Field.Literacy,
        Field.Modality,
        Field.VitalityMetascore,
        // Field.VitalityEthnologueFine,
        // Field.VitalityEthnologueCoarse,
        Field.ISOStatus,
        Field.Latitude,
        Field.Longitude,
        Field.PercentOfOverallLanguageSpeakers,
        Field.PercentOfTerritoryPopulation,
        Field.PopulationOfDescendants,
        Field.PopulationPercentInBiggestDescendantLanguage,
        Field.Date,
        Field.Name,
        Field.Endonym,
        Field.Code,
        Field.LanguageScope,
        Field.TerritoryScope,
      ];
    case Transform.Scale:
      return [
        Field.None,
        Field.Population,
        Field.PopulationDirectlySourced,
        Field.Area,
        Field.Depth,
        Field.CountOfLanguages,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,
      ];
    case Transform.Search:
      // TODO integrate search better with field types and/or merge with searching
      return [Field.Name, Field.Code, Field.Endonym];
    case Transform.Filter:
      // Ordered by preferred UI grouping: connections first, then vitality, then text fields
      // This also affects which filters happen first
      return [
        Field.Territory,
        Field.WritingSystem,
        Field.Language,
        Field.Modality,
        Field.LanguageScope,
        Field.TerritoryScope,
        Field.ISOStatus,
        // Field.VitalityEthnologueFine, Disabled until clarity on data usage
        // Field.VitalityEthnologueCoarse,
        Field.Name, // Technically filters name and code right now, depending on SearchBy
      ];
    default:
      return enforceExhaustiveSwitch(transform);
  }
}

/**
 * Returns all fields available for a given object type.
 * This is the authoritative list that other UIs (sorting, coloring, scaling) intersect with.
 */
export function getFieldsForObjectType(objectType: ObjectType): Field[] {
  const specific = getSpecificFieldsForObjectType(objectType);
  return unique([...COMMON_FIELDS, ...specific]);
}

/**
 * Helper to intersect the fields available for a transform with fields that exist for an object type.
 * Preserves the order from the transform list.
 */
export function getApplicableFields(transform?: Transform, objectType?: ObjectType): Field[] {
  const transformFields = transform ? getFieldsForTransform(transform) : Object.values(Field);
  const objectFields = objectType ? getFieldsForObjectType(objectType) : Object.values(Field);
  return transformFields.filter((f) => objectFields.includes(f));
}

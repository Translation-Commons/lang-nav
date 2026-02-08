import { ObjectType } from '@features/params/PageParamTypes';

import { unique } from '@shared/lib/setUtils';

import Field from './Field';

// Common fields available across most object types
const COMMON_FIELDS: Field[] = [Field.None, Field.Code, Field.Name, Field.Population];

// Specific fields available per object type
function getSpecificFieldsForObjectType(objectType: ObjectType): Field[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        Field.Endonym,
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
      ];
    case ObjectType.Territory:
      return [
        Field.Endonym,
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
      ];
    case ObjectType.Language:
      return [
        Field.Endonym,
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
        Field.PercentOfOverallLanguageSpeakers,
        Field.VitalityMetascore,
        Field.ISOStatus,
        Field.VitalityEthnologueFine,
        Field.VitalityEthnologueCoarse,
        Field.Latitude,
        Field.Longitude,
      ];
    case ObjectType.Census:
      return [
        Field.Date,
        Field.PopulationDirectlySourced,
        Field.PercentOfTerritoryPopulation,
        Field.Territory,
        Field.CountOfLanguages,
      ];
    case ObjectType.WritingSystem:
      return [
        Field.Endonym,
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
 * Helper to intersect an allowed list with fields that exist for an object type.
 * Preserves the order from the allowed list.
 */
function getApplicableFields(allowed: Field[], objectType: ObjectType): Field[] {
  const objectFields = new Set(getFieldsForObjectType(objectType));
  return allowed.filter((f) => objectFields.has(f));
}

/** Returns sorting fields applicable to the given object type */
export function getSortBysApplicableToObjectType(objectType: ObjectType): Field[] {
  return getApplicableFields(
    Object.values(Field).filter((f) => f != Field.None),
    objectType,
  );
}

/** Returns coloring fields applicable to the given object type */
export function getColorBysApplicableToObjectType(objectType: ObjectType): Field[] {
  // Ordered by preferred UI grouping: quantitative first, then text fields
  const coloringFields = [
    Field.None,
    Field.Population,
    Field.PopulationDirectlySourced,
    Field.Area,
    Field.CountOfLanguages,
    Field.CountOfWritingSystems,
    Field.CountOfCountries,
    Field.CountOfChildTerritories,
    Field.CountOfCensuses,
    Field.Literacy,
    Field.Modality,
    Field.VitalityMetascore,
    Field.VitalityEthnologueFine,
    Field.VitalityEthnologueCoarse,
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
  ];
  return getApplicableFields(coloringFields, objectType);
}

/** Returns scaling fields applicable to the given object type */
export function getScaleBysApplicableToObjectType(objectType: ObjectType): Field[] {
  const scalingFields = [
    Field.None,
    Field.Population,
    Field.PopulationDirectlySourced,
    Field.Area,
    Field.CountOfLanguages,
    Field.CountOfCountries,
    Field.CountOfChildTerritories,
    Field.CountOfCensuses,
  ];
  return getApplicableFields(scalingFields, objectType);
}

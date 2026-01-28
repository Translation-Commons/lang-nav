import { ObjectType } from '@features/params/PageParamTypes';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { unique } from '@shared/lib/setUtils';

// Common fields available across most object types
const COMMON_FIELDS: SortBy[] = [SortBy.Code, SortBy.Name, SortBy.Population];

// Specific fields available per object type
function getSpecificFieldsForObjectType(objectType: ObjectType): SortBy[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        SortBy.Endonym,
        SortBy.PopulationDirectlySourced,
        SortBy.Literacy,
        SortBy.Modality,
        SortBy.PercentOfOverallLanguageSpeakers,
        SortBy.PercentOfTerritoryPopulation,
        SortBy.CountOfLanguages,
        SortBy.CountOfWritingSystems,
        SortBy.CountOfCountries,
        SortBy.CountOfChildTerritories,
        SortBy.CountOfCensuses,
        SortBy.Language,
        SortBy.WritingSystem,
        SortBy.Territory,
      ];
    case ObjectType.Territory:
      return [
        SortBy.Endonym,
        SortBy.Literacy,
        SortBy.CountOfLanguages,
        SortBy.CountOfWritingSystems,
        SortBy.CountOfCountries,
        SortBy.CountOfChildTerritories,
        SortBy.CountOfCensuses,
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
        SortBy.CountOfLanguages,
        SortBy.CountOfWritingSystems,
        SortBy.CountOfCountries,
        SortBy.Modality,
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
        SortBy.CountOfCountries,
        SortBy.CountOfWritingSystems,
        SortBy.PopulationOfDescendants,
        SortBy.Territory,
        SortBy.WritingSystem, // Equivalent to DisplayName for writing systems
      ];
    case ObjectType.VariantTag:
      return [
        SortBy.Date,
        SortBy.CountOfLanguages,
        SortBy.CountOfChildTerritories,
        SortBy.Language,
      ];
  }
}

/**
 * Returns all fields available for a given object type.
 * This is the authoritative list that other UIs (sorting, coloring, scaling) intersect with.
 */
export function getFieldsForObjectType(objectType: ObjectType): SortBy[] {
  const specific = getSpecificFieldsForObjectType(objectType);
  return unique([...COMMON_FIELDS, ...specific]);
}

/**
 * Helper to intersect an allowed list with fields that exist for an object type.
 * Preserves the order from the allowed list.
 */
function getApplicableFields(allowed: SortBy[], objectType: ObjectType): SortBy[] {
  const objectFields = new Set(getFieldsForObjectType(objectType));
  return allowed.filter((f) => objectFields.has(f));
}

/** Returns sorting fields applicable to the given object type */
export function getSortBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  // Currently all SortBy fields are sortable; can be restricted in future
  return getApplicableFields(Object.values(SortBy), objectType);
}

/** Returns coloring fields applicable to the given object type */
export function getColorBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  // Ordered by preferred UI grouping: quantitative first, then text fields
  const coloringFields = [
    SortBy.Population,
    SortBy.PopulationDirectlySourced,
    SortBy.Area,
    SortBy.CountOfLanguages,
    SortBy.CountOfWritingSystems,
    SortBy.CountOfCountries,
    SortBy.CountOfChildTerritories,
    SortBy.CountOfCensuses,
    SortBy.Literacy,
    SortBy.Modality,
    SortBy.VitalityMetascore,
    SortBy.VitalityEthnologue2013,
    SortBy.VitalityEthnologue2025,
    SortBy.ISOStatus,
    SortBy.Latitude,
    SortBy.Longitude,
    SortBy.PercentOfOverallLanguageSpeakers,
    SortBy.PercentOfTerritoryPopulation,
    SortBy.PopulationOfDescendants,
    SortBy.PopulationPercentInBiggestDescendantLanguage,
    SortBy.Date,
    SortBy.Name,
    SortBy.Endonym,
    SortBy.Code,
  ];
  return getApplicableFields(coloringFields, objectType);
}

/** Returns scaling fields applicable to the given object type */
export function getScaleBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  const scalingFields = [
    SortBy.Population,
    SortBy.PopulationDirectlySourced,
    SortBy.Area,
    SortBy.CountOfLanguages,
    SortBy.CountOfCountries,
    SortBy.CountOfChildTerritories,
    SortBy.CountOfCensuses,
  ];
  return getApplicableFields(scalingFields, objectType);
}

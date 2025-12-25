import { ObjectType } from '@features/params/PageParamTypes';
import { SortBy } from '@features/transforms/sorting/SortTypes';

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

/**
 * Returns all fields available for a given object type.
 * This is the authoritative list that other UIs (sorting, coloring, scaling) intersect with.
 */
export function getFieldsForObjectType(objectType: ObjectType): SortBy[] {
  const specific = getSpecificFieldsForObjectType(objectType);
  const deduped = new Set<SortBy>([...COMMON_FIELDS, ...specific]);
  return [...deduped];
}

/** Fields that make sense as sorting inputs */
export function getFieldsForSorting(): SortBy[] {
  // Currently all SortBy fields are sortable; can be restricted in future
  return Object.values(SortBy);
}

/** Fields that make sense as color inputs, ordered by preferred UI grouping */
export function getFieldsForColoring(): SortBy[] {
  return [
    // Quantitative first
    SortBy.Population,
    SortBy.PopulationDirectlySourced,
    SortBy.Area,
    SortBy.CountOfLanguages,
    SortBy.CountOfDialects,
    SortBy.CountOfTerritories,
    SortBy.Literacy,
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
    // Text fields for alphabetical coloring
    SortBy.Name,
    SortBy.Endonym,
    SortBy.Code,
  ];
}

/** Fields that make sense as scale inputs */
export function getFieldsForScaling(): SortBy[] {
  return [
    SortBy.Population,
    SortBy.PopulationDirectlySourced,
    SortBy.Area,
    SortBy.CountOfLanguages,
    SortBy.CountOfDialects,
    SortBy.CountOfTerritories,
  ];
}

/**
 * Intersect an ordered allowed list with fields that exist for an object type.
 * Preserves the order from the allowed list.
 */
export function intersectAllowedWithObjectType(
  allowed: SortBy[],
  objectType: ObjectType,
): SortBy[] {
  const objectFields = new Set(getFieldsForObjectType(objectType));
  return allowed.filter((f) => objectFields.has(f));
}

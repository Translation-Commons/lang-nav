import { ObjectType } from '@features/params/PageParamTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { unique } from '@shared/lib/setUtils';

import Transform from '../TransformEnum';

import Field from './Field';

// Common fields available across most object types
const COMMON_FIELDS: Field[] = [Field.None, Field.Code, Field.Name, Field.Population];

// Fields that are in development and not yet available for use in transforms but there may be placeholder values
export const FIELDS_IN_DEVELOPMENT: Field[] = [
  Field.VitalityEthnologueCoarse,
  Field.VitalityEthnologueFine,
  Field.CountOfVariants,
  Field.SourceType,
  Field.Indigeneity,
  Field.CLDRCoverage,
  Field.DigitalSupport,
  Field.LanguageFamily,
  Field.WritingSystemScope,
  Field.Coordinates,
];

/**
 * These fields are technically available for entities but are redundant with others so
 * they can be used but are hidden from selectors.
 *
 * For example a Language.language is just the Language.name again
 * or Variant.CountOfVariants is 1 (itself)
 *
 * Sometimes though we re-interpret the field meaning, eg. Language.CountOfLanguages is
 * the number of child language nodes.
 */
export const UNINTERESTING_FIELD_COMBINATIONS: Record<ObjectType, Field[]> = {
  [ObjectType.Language]: [Field.Language],
  [ObjectType.Territory]: [Field.Territory, Field.PopulationDirectlySourced],
  [ObjectType.WritingSystem]: [
    Field.WritingSystem,
    Field.CountOfWritingSystems,
    Field.PopulationOfDescendants,
  ],
  [ObjectType.Variant]: [Field.Variant],
  [ObjectType.Locale]: [],
  [ObjectType.Keyboard]: [],
  [ObjectType.Census]: [
    Field.CountOfCensuses,
    Field.CountOfChildTerritories,
    Field.CountOfCountries,
  ],
};

// Specific fields available per object type
function getSpecificFieldsForObjectType(objectType: ObjectType): Field[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        Field.Endonym,
        Field.LanguageScope,
        Field.WritingSystemScope,
        Field.TerritoryScope,
        Field.SourceType,

        Field.Modality,

        Field.DigitalSupport,
        Field.CLDRCoverage,

        Field.Indigeneity,
        Field.LanguageFormedHere,
        Field.HistoricPresence,
        Field.GovernmentStatus,

        Field.VitalityMetascore, // not particularly useful
        Field.ISOStatus,
        Field.VitalityEthnologueCoarse,
        Field.VitalityEthnologueFine,

        Field.PopulationDirectlySourced,
        Field.Literacy,
        Field.PercentOfOverallLanguageSpeakers,
        Field.PercentOfTerritoryPopulation,

        Field.Language,
        Field.LanguageFamily,
        Field.WritingSystem,
        Field.Territory,
        Field.Region,
        // Field.Variant, // Data not available yet
        Field.SourceForPopulation,
        Field.SourceForLanguage,

        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,

        Field.Depth,
      ];
    case ObjectType.Territory:
      return [
        Field.Endonym,
        Field.TerritoryScope,

        Field.Language,
        Field.WritingSystem,
        Field.Territory, // Equivalent to DisplayName for territories
        Field.Region,

        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,

        Field.Depth,
        Field.Literacy,
        Field.Area,

        Field.Coordinates,
        Field.Latitude,
        Field.Longitude,

        Field.PopulationDirectlySourced,
        Field.PopulationOfDescendants,
        Field.PercentOfTerritoryPopulation,
        Field.PopulationPercentInBiggestDescendantLanguage,
      ];
    case ObjectType.Language:
      return [
        Field.Endonym,
        Field.LanguageScope,

        Field.Modality,

        Field.DigitalSupport,
        Field.CLDRCoverage,

        Field.VitalityMetascore,
        Field.ISOStatus,
        Field.VitalityEthnologueFine,
        Field.VitalityEthnologueCoarse,

        Field.Language, // Equivalent to DisplayName for languages
        Field.WritingSystem,
        Field.Territory,
        Field.SourceForPopulation,
        Field.SourceForLanguage,
        // Field.Region, // TODO

        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        // Field.CountOfVariants, // TODO

        Field.Depth,
        Field.Literacy,

        Field.Coordinates,
        Field.Latitude,
        Field.Longitude,

        Field.PopulationDirectlySourced,
        Field.PopulationOfDescendants,
        Field.PopulationPercentInBiggestDescendantLanguage,
        Field.PercentOfOverallLanguageSpeakers,
      ];
    case ObjectType.Census:
      return [
        Field.TerritoryScope,
        Field.SourceType,

        Field.Territory,
        Field.Region,
        Field.SourceForPopulation,

        Field.CountOfLanguages,
        Field.CountOfChildTerritories, // 0 or 1
        Field.CountOfCountries, // 0 or 1
        Field.CountOfCensuses, // always 1 for census objects, but useful for transforms that look at related objects

        Field.PopulationDirectlySourced,
        Field.PercentOfTerritoryPopulation,

        Field.Date,
      ];
    case ObjectType.WritingSystem:
      return [
        Field.Endonym,
        Field.WritingSystemScope,

        Field.Language,
        Field.WritingSystem, // Equivalent to DisplayName for writing systems
        Field.Territory,

        Field.CountOfLanguages,
        Field.CountOfCountries,
        Field.CountOfWritingSystems,

        Field.PopulationOfDescendants,

        Field.Depth,
        Field.UnicodeVersion,
        Field.Example,
        // Field.Literacy, Data not available yet
      ];
    case ObjectType.Variant:
      return [
        Field.Language,
        Field.WritingSystem,
        Field.Territory,
        // Field.Variant, // Equivalent to DisplayName for variant tags
        // Field.Keyboard,

        Field.CountOfLanguages,
        Field.CountOfWritingSystems, // May be poorly defined
        Field.CountOfChildTerritories,
        Field.CountOfCountries, // 0 or 1

        Field.Date,
        Field.Description,
      ];
    case ObjectType.Keyboard:
      return [
        Field.LanguageScope,
        Field.WritingSystemScope, // Technically possible but uninteresting
        Field.TerritoryScope,

        Field.Modality, // the Language's modality
        Field.VitalityMetascore,
        Field.ISOStatus,

        Field.Language,
        Field.WritingSystem,
        Field.Territory,
        Field.Region,
        Field.Platform,
        Field.OutputScript,
        Field.Variant,

        Field.CountOfWritingSystems, // May be poorly defined
        Field.CountOfCountries, // 0 or 1
      ];
    default:
      return enforceExhaustiveSwitch(objectType);
  }
}

function getFieldsForTransform(transform: Transform): Field[] {
  switch (transform) {
    case Transform.Sort:
      // Easier to list fields that aren't sortable than to list all that are, since most are
      return Object.values(Field).filter((f) => ![Field.None].includes(f));
    case Transform.Color:
      // Ordered by preferred UI grouping: quantitative first, then text fields
      return [
        Field.None,
        Field.Population,

        Field.Area,
        Field.Depth,

        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,
        Field.CountOfVariants,

        Field.Literacy,

        Field.Modality,

        Field.DigitalSupport,
        Field.CLDRCoverage,
        Field.UnicodeVersion,

        Field.VitalityMetascore,
        Field.ISOStatus,
        Field.VitalityEthnologueFine,
        Field.VitalityEthnologueCoarse,

        Field.Indigeneity,
        Field.LanguageFormedHere,
        Field.HistoricPresence,
        Field.GovernmentStatus,

        // Field.Coordinates, we don't support 2D color scales right now
        Field.Latitude,
        Field.Longitude,

        Field.PopulationDirectlySourced,
        Field.PercentOfOverallLanguageSpeakers,
        Field.PercentOfTerritoryPopulation,
        Field.PopulationOfDescendants,
        Field.PopulationPercentInBiggestDescendantLanguage,
        Field.Date,

        Field.Name,
        Field.Endonym,
        Field.Code,
        Field.LanguageScope,
        Field.WritingSystemScope,
        Field.TerritoryScope,
      ];
    case Transform.Scale:
      return [
        Field.None,
        Field.Population,
        Field.Area,
        Field.Depth,

        Field.LanguageScope,
        Field.TerritoryScope,

        Field.CountOfLanguages,
        Field.CountOfWritingSystems,
        Field.CountOfCountries,
        Field.CountOfChildTerritories,
        Field.CountOfCensuses,

        Field.PopulationDirectlySourced,
        Field.PercentOfOverallLanguageSpeakers,
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
        Field.SourceForLanguage,
        Field.Modality,
        Field.LanguageScope,
        Field.TerritoryScope,
        Field.ISOStatus,
        Field.VitalityEthnologueFine,
        Field.VitalityEthnologueCoarse,
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
function getFieldsForObjectType(objectType: ObjectType): Field[] {
  const specific = getSpecificFieldsForObjectType(objectType);
  return unique([...COMMON_FIELDS, ...specific]).filter(
    (f) => !UNINTERESTING_FIELD_COMBINATIONS[objectType].includes(f),
  );
}

/**
 * Helper to intersect the fields available for a transform with fields that exist for an object type.
 * Preserves the order from the transform list.
 */
export function getApplicableFields(transform?: Transform, objectType?: ObjectType): Field[] {
  const transformFields = transform ? getFieldsForTransform(transform) : Object.values(Field);
  const objectFields = objectType ? getFieldsForObjectType(objectType) : Object.values(Field);
  return transformFields.filter(
    (f) => objectFields.includes(f) && !FIELDS_IN_DEVELOPMENT.includes(f),
  );
}

export function isFieldApplicable(
  field: Field,
  transform?: Transform,
  objectType?: ObjectType,
): boolean {
  return (
    (transform ? getFieldsForTransform(transform).includes(field) : true) &&
    (objectType ? getFieldsForObjectType(objectType).includes(field) : true) &&
    !FIELDS_IN_DEVELOPMENT.includes(field) &&
    (objectType ? !UNINTERESTING_FIELD_COMBINATIONS[objectType].includes(field) : true)
  );
}

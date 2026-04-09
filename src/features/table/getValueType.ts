import Field from '@features/transforms/fields/Field';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import TableColumn from './TableColumn';
import TableValueType from './TableValueType';

export function getFieldValueType(field?: Field): TableValueType {
  if (field == null) return TableValueType.String; // default to string if no field specified
  switch (field) {
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
      return TableValueType.Population;

    case Field.Literacy:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PercentOfTerritoryPopulation:
    case Field.PopulationPercentInBiggestDescendantLanguage:
    case Field.Coordinates:
    case Field.Longitude:
    case Field.Latitude:
    case Field.Area:
    case Field.UnicodeVersion:
      return TableValueType.Decimal;

    case Field.Date:
      return TableValueType.Date;

    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.CountOfVariants:
    case Field.Depth: // # of nodes
      return TableValueType.Count;

    case Field.Name:
    case Field.Endonym:
    case Field.Code:
    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.Territory:
    case Field.Region:
    case Field.Platform:
    case Field.OutputScript:
    case Field.Variant:
    case Field.SourceForLanguage:
    case Field.SourceForPopulation:
    case Field.Description:
    case Field.Example:
    case Field.None:
      return TableValueType.String;

    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
    case Field.Modality:
    case Field.LanguageScope:
    case Field.WritingSystemScope:
    case Field.TerritoryScope:
    case Field.VariantType:
    case Field.SourceType:
    case Field.Indigeneity:
    case Field.HistoricPresence:
    case Field.LanguageFormedHere:
    case Field.CLDRCoverage:
    case Field.DigitalSupport:
    case Field.GovernmentStatus:
      return TableValueType.Enum;

    default:
      enforceExhaustiveSwitch(field);
  }
}

/**
 * Most columns have value types with declared fields (eg. for sorting) but some may not and
 * instead want to explicitly declare a value type.
 */
export function getValueTypeForColumn<T>(column: TableColumn<T>): TableValueType {
  if (column.valueType) return column.valueType;
  if (column.field) return getFieldValueType(column.field);
  return TableValueType.String;
}

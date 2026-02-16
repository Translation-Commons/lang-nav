import Field from '@features/transforms/fields/Field';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import TableColumn from './TableColumn';
import TableValueType from './TableValueType';

function getFieldValueType(field?: Field): TableValueType {
  if (field == null) return TableValueType.String; // default to string if no field specified
  switch (field) {
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
      return TableValueType.Population;
    case Field.Literacy:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PercentOfTerritoryPopulation:
    case Field.Longitude:
    case Field.Latitude:
    case Field.Area:
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return TableValueType.Decimal;
    case Field.Date:
      return TableValueType.Date;
    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.Depth: // # of nodes
      return TableValueType.Count;
    case Field.Name:
    case Field.Endonym:
    case Field.Code:
    case Field.Language:
    case Field.WritingSystem:
    case Field.Territory:
    case Field.None:
      return TableValueType.String;
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
    case Field.Modality:
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

import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from '../fields/Field';
import getField from '../fields/getField';

import { SortBehavior, SortDirection } from './SortTypes';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

export function getSortFunction(): SortByFunctionType {
  const { sortBy, sortBehavior } = usePageParams();

  return getSortFunctionParameterized(sortBy, sortBehavior);
}

export function getSortFunctionParameterized(
  sortBy: Field,
  sortDirection: SortBehavior = SortBehavior.Normal,
): SortByFunctionType {
  const direction = getNormalSortDirection(sortBy) * sortDirection;
  return (a: ObjectData, b: ObjectData) => {
    const aField = getField(a, sortBy);
    const bField = getField(b, sortBy);
    if (aField == null) return bField == null ? 0 : 1;
    if (bField == null) return -1; // puts last regardless of ascending/descending
    if (aField > bField) return direction;
    if (bField > aField) return -direction;
    return 0;
  };
}

export function getNormalSortDirection(sortBy: Field): SortDirection {
  if (sortBy == null) return SortDirection.Ascending; // default to ascending if no sortBy

  switch (sortBy) {
    case Field.None:
    case Field.Name:
    case Field.Endonym:
    case Field.Code:
    case Field.Language:
    case Field.WritingSystem:
    case Field.Territory:
    case Field.Longitude:
    case Field.Latitude:
    case Field.Modality:
      return SortDirection.Ascending; // A to Z
    case Field.Date:
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
    case Field.PercentOfTerritoryPopulation:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.Literacy:
    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
    case Field.Area:
      return SortDirection.Descending; // High to Low
    default:
      enforceExhaustiveSwitch(sortBy);
  }
}

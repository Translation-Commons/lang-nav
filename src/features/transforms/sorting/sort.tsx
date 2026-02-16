import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from '../fields/Field';
import getField from '../fields/getField';

import { SortBehavior, SortDirection } from './SortTypes';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

export function getSortFunction(): SortByFunctionType {
  const { sortBy, secondarySortBy, sortBehavior } = usePageParams();

  return getSortFunctionParameterized(sortBy, sortBehavior, secondarySortBy);
}

export function getSortFunctionParameterized(
  sortBy: Field,
  sortDirection: SortBehavior = SortBehavior.Normal,
  secondarySortBy?: Field,
): SortByFunctionType {
  const direction = getNormalSortDirection(sortBy) * sortDirection;
  const secondaryDirection =
    secondarySortBy != null && secondarySortBy !== Field.None
      ? getNormalSortDirection(secondarySortBy) * sortDirection
      : null;

  const effectiveSecondary: Field | null =
    secondarySortBy != null && secondarySortBy !== Field.None && secondarySortBy !== sortBy
      ? secondarySortBy
      : null;

  return (a: ObjectData, b: ObjectData) => {
    const compareSecondary = (): number => {
      if (secondaryDirection == null || effectiveSecondary == null) return 0;
      const aSecondary = getField(a, effectiveSecondary);
      const bSecondary = getField(b, effectiveSecondary);
      if (aSecondary == null) return bSecondary == null ? 0 : 1;
      if (bSecondary == null) return -1;
      if (aSecondary > bSecondary) return secondaryDirection;
      if (bSecondary > aSecondary) return -secondaryDirection;
      return 0;
    };

    const aField = getField(a, sortBy);
    const bField = getField(b, sortBy);
    // If both primary fields are missing, fall back to the secondary sort if available
    if (aField == null && bField == null) {
      return compareSecondary();
    }

    // If only one primary field is missing, keep the previous behavior: nulls last
    if (aField == null) return 1;
    if (bField == null) return -1; // puts last regardless of ascending/descending

    if (aField > bField) return direction;
    if (bField > aField) return -direction;
    // Tie on primary: break by secondary sort if configured and different from primary
    return compareSecondary();
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
    case Field.Depth:
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
    case Field.LanguageScope:
    case Field.TerritoryScope:
      return SortDirection.Descending; // High to Low
    default:
      enforceExhaustiveSwitch(sortBy);
  }
}

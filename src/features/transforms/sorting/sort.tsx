import usePageParams from '@features/params/usePageParams';

import { getObjectPopulation } from '@entities/lib/getObjectPopulation';
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
    case Field.Description:
    case Field.Modality:
    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.OutputScript:
    case Field.Territory:
    case Field.Region:
    case Field.VariantTag:
    case Field.Platform:
    case Field.SourceForLanguage:
    case Field.SourceForPopulation:
    case Field.Coordinates:
    case Field.Longitude:
    case Field.Latitude:
    case Field.Depth:
    case Field.Example:
    case Field.UnicodeVersion:
      return SortDirection.Ascending; // A to Z, min to max
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
    case Field.CountOfVariantTags:
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
    case Field.Area:
    case Field.LanguageScope:
    case Field.WritingSystemScope:
    case Field.TerritoryScope:
    case Field.SourceType:
    case Field.DigitalSupport:
    case Field.CLDRCoverage:
    case Field.Indigeneity:
    case Field.GovernmentStatus:
    case Field.LanguageFormedHere:
    case Field.HistoricPresence:
      return SortDirection.Descending; // High to Low, most recent to least
    default:
      enforceExhaustiveSwitch(sortBy);
  }
}

export function sortByPopulation(a: ObjectData, b: ObjectData): number {
  const aPopulation = getObjectPopulation(a);
  const bPopulation = getObjectPopulation(b);
  if (aPopulation == null) return bPopulation == null ? 0 : 1;
  if (bPopulation == null) return -1;
  if (aPopulation > bPopulation) return -1;
  if (bPopulation > aPopulation) return 1;
  return 0;
}

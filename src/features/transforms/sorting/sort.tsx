import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { getSortField } from '../fields/getField';

import { SortBehavior, SortBy, SortDirection } from './SortTypes';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

export function getSortFunction(languageSource?: LanguageSource): SortByFunctionType {
  const { sortBy, languageSource: languageSourcePageParam, sortBehavior } = usePageParams();
  const effectiveLanguageSource = languageSource ?? languageSourcePageParam;

  return getSortFunctionParameterized(sortBy, effectiveLanguageSource, sortBehavior);
}

export function getSortFunctionParameterized(
  sortBy: SortBy,
  effectiveLanguageSource: LanguageSource = LanguageSource.Combined,
  sortDirection: SortBehavior = SortBehavior.Normal,
): SortByFunctionType {
  const direction = getNormalSortDirection(sortBy) * sortDirection;
  return (a: ObjectData, b: ObjectData) => {
    const aField = getSortField(a, sortBy, effectiveLanguageSource);
    const bField = getSortField(b, sortBy, effectiveLanguageSource);
    if (aField == null) return bField == null ? 0 : 1;
    if (bField == null) return -1; // puts last regardless of ascending/descending
    if (aField > bField) return direction;
    if (bField > aField) return -direction;
    return 0;
  };
}

export function getNormalSortDirection(sortBy: SortBy): SortDirection {
  switch (sortBy) {
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
    case SortBy.Longitude:
    case SortBy.Latitude:
      return SortDirection.Ascending; // A to Z
    case SortBy.Date:
    case SortBy.Population:
    case SortBy.PopulationDirectlySourced:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.Literacy:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfDialects:
    case SortBy.CountOfTerritories:
    case SortBy.VitalityMetascore:
    case SortBy.ISOStatus:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
    case SortBy.Area:
      return SortDirection.Descending; // High to Low
  }
}

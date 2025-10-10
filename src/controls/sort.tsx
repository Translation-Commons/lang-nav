import { ObjectData } from '../types/DataTypes';
import { LanguageSource } from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';
import { DisplaySortDirection, SortBy, TechnicalSortDirection } from '../types/SortTypes';
import {
  getCountOfLanguages,
  getCountOfTerritories,
  getObjectDate,
  getObjectLiteracy,
} from '../views/common/getObjectMiscFields';
import {
  getObjectBiggestDescendentRelativePopulation,
  getObjectPopulation,
  getObjectPopulationAttested,
  getObjectPopulationOfDescendents,
  getObjectPopulationRelativeToOverallLanguageSpeakers,
  getObjectPopulationRelativeToTerritory,
} from '../views/common/getObjectPopulation';

import { usePageParams } from './PageParamsContext';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

export function getSortFunction(languageSource?: LanguageSource): SortByFunctionType {
  const { sortBy, languageSource: languageSourcePageParam, sortDirection } = usePageParams();
  const effectiveLanguageSource = languageSource ?? languageSourcePageParam;

  return getSortFunctionParameterized(sortBy, effectiveLanguageSource, sortDirection);
}

function getSortField(
  object: ObjectData,
  sortBy: SortBy,
  effectiveLanguageSource: LanguageSource,
): string | number | undefined {
  switch (sortBy) {
    case SortBy.Code:
      return object.codeDisplay;
    case SortBy.Name:
      return object.nameDisplay;
    case SortBy.Endonym:
      return object.nameEndonym;
    case SortBy.CountOfTerritories:
      return getCountOfTerritories(object);
    case SortBy.CountOfLanguages:
      return getCountOfLanguages(object);
    case SortBy.Literacy:
      return getObjectLiteracy(object);
    case SortBy.Date:
      return getObjectDate(object);

    // Population
    case SortBy.Population:
      return getObjectPopulation(object);
    case SortBy.PopulationAttested:
      return getObjectPopulationAttested(object);
    case SortBy.PopulationOfDescendents:
      return getObjectPopulationOfDescendents(object, effectiveLanguageSource);
    case SortBy.BiggestDescendentRelativePopulation:
      return getObjectBiggestDescendentRelativePopulation(object);
    case SortBy.PercentOfTerritoryPopulation:
      return getObjectPopulationRelativeToTerritory(object);
    case SortBy.PercentOfOverallLanguageSpeakers:
      return getObjectPopulationRelativeToOverallLanguageSpeakers(object);
  }
}

function getSortFunctionParameterized(
  sortBy: SortBy,
  effectiveLanguageSource: LanguageSource,
  sortDirection: DisplaySortDirection,
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

export function getNormalSortDirection(sortBy: SortBy): TechnicalSortDirection {
  switch (sortBy) {
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
      return TechnicalSortDirection.Ascending; // A to Z
    case SortBy.Date:
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendents:
    case SortBy.BiggestDescendentRelativePopulation:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.Literacy:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
      return TechnicalSortDirection.Descending; // High to Low
  }
}

/** Not necessarily exhaustive, just the ones that will appear in the sidebar */
export function getSortBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        SortBy.Literacy,
        SortBy.PercentOfOverallLanguageSpeakers,
        SortBy.CountOfLanguages,
      ];
    case ObjectType.Territory:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Population,
        SortBy.Literacy,
        SortBy.CountOfLanguages,
        SortBy.CountOfTerritories,
      ];
    case ObjectType.Language:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        SortBy.Literacy,
        SortBy.CountOfTerritories,
        SortBy.CountOfLanguages,
        SortBy.PopulationAttested,
      ];
    case ObjectType.Census:
      return [SortBy.Date, SortBy.Code, SortBy.Name, SortBy.Population, SortBy.CountOfLanguages];
    case ObjectType.WritingSystem:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        // SortBy.Literacy, Data not available yet
        SortBy.CountOfLanguages,
        SortBy.PopulationOfDescendents,
      ];
    case ObjectType.VariantTag:
      return [SortBy.Date, SortBy.Code, SortBy.Name, SortBy.Population, SortBy.CountOfLanguages];
  }
}

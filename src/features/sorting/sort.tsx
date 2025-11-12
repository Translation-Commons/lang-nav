import {
  getTerritoriesRelevantToObject,
  getWritingSystemsRelevantToObject,
} from '@features/filtering/filterByConnections';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { getVitalityMetascore } from '@entities/language/vitality/LanguageVitalityComputation';
import {
  getCountOfLanguages,
  getCountOfTerritories,
  getObjectDateAsNumber,
  getObjectLiteracy,
  getObjectMostImportantLanguageName,
} from '@entities/lib/getObjectMiscFields';
import {
  getObjectPopulation,
  getObjectPopulationAttested,
  getObjectPopulationOfDescendents,
  getObjectPopulationPercentInBiggestDescendentLanguage,
  getObjectPopulationRelativeToOverallLanguageSpeakers,
  getObjectPercentOfTerritoryPopulation,
} from '@entities/lib/getObjectPopulation';
import { ObjectData } from '@entities/types/DataTypes';

import { SortBehavior, SortBy, SortDirection } from './SortTypes';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

export function getSortFunction(languageSource?: LanguageSource): SortByFunctionType {
  const { sortBy, languageSource: languageSourcePageParam, sortBehavior } = usePageParams();
  const effectiveLanguageSource = languageSource ?? languageSourcePageParam;

  return getSortFunctionParameterized(sortBy, effectiveLanguageSource, sortBehavior);
}

export function getSortField(
  object: ObjectData,
  sortBy: SortBy,
  effectiveLanguageSource: LanguageSource = LanguageSource.All,
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
      return getObjectDateAsNumber(object);
    case SortBy.Language:
      return getObjectMostImportantLanguageName(object);
    case SortBy.WritingSystem:
      return getWritingSystemsRelevantToObject(object)?.[0]?.nameDisplay;
    case SortBy.Territory:
      return getTerritoriesRelevantToObject(object)?.[0]?.nameDisplay;
    case SortBy.Latitude:
      return object.type === ObjectType.Language ? object.latitude : undefined;
    case SortBy.Longitude:
      return object.type === ObjectType.Language ? object.longitude : undefined;

    // Population
    case SortBy.Population:
      return getObjectPopulation(object);
    case SortBy.PopulationAttested:
      return getObjectPopulationAttested(object);
    case SortBy.PopulationOfDescendents:
      return getObjectPopulationOfDescendents(object, effectiveLanguageSource);
    case SortBy.PopulationPercentInBiggestDescendentLanguage:
      return getObjectPopulationPercentInBiggestDescendentLanguage(object);
    case SortBy.PercentOfTerritoryPopulation:
      return getObjectPercentOfTerritoryPopulation(object);
    case SortBy.PercentOfOverallLanguageSpeakers:
      return getObjectPopulationRelativeToOverallLanguageSpeakers(object);

    // Vitality
    case SortBy.VitalityMetascore:
      if (object.type !== ObjectType.Language) return undefined;
      return getVitalityMetascore(object);
    case SortBy.VitalityISO:
      if (object.type !== ObjectType.Language) return undefined;
      return object.vitalityISO;
    case SortBy.VitalityEthnologue2013:
      if (object.type !== ObjectType.Language) return undefined;
      return object.vitalityEth2013;
    case SortBy.VitalityEthnologue2025:
      if (object.type !== ObjectType.Language) return undefined;
      return object.vitalityEth2025;
  }
}

export function getSortFunctionParameterized(
  sortBy: SortBy,
  effectiveLanguageSource: LanguageSource = LanguageSource.All,
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
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendents:
    case SortBy.PopulationPercentInBiggestDescendentLanguage:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.Literacy:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
    case SortBy.VitalityMetascore:
    case SortBy.VitalityISO:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
      return SortDirection.Descending; // High to Low
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
        SortBy.Language,
        SortBy.WritingSystem,
        SortBy.Territory,
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
        SortBy.WritingSystem,
        SortBy.Territory,
        SortBy.PopulationAttested,
        SortBy.VitalityMetascore,
        SortBy.VitalityISO,
        SortBy.VitalityEthnologue2013,
        SortBy.VitalityEthnologue2025,
        SortBy.Latitude,
        SortBy.Longitude,
      ];
    case ObjectType.Census:
      return [
        SortBy.Date,
        SortBy.Code,
        SortBy.Name,
        SortBy.Population,
        SortBy.Territory,
        SortBy.CountOfLanguages,
      ];
    case ObjectType.WritingSystem:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        // SortBy.Literacy, Data not available yet
        SortBy.Language,
        SortBy.CountOfLanguages,
        SortBy.PopulationOfDescendents,
      ];
    case ObjectType.VariantTag:
      return [SortBy.Date, SortBy.Code, SortBy.Name, SortBy.Population, SortBy.CountOfLanguages];
  }
}

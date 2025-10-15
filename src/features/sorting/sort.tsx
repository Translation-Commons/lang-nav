import { LanguageSource } from '@entities/language/LanguageTypes';
import {
  computeVitalityMetascore,
  getEthnologue2013Score,
  getEthnologue2025Score,
  getISOScore,
} from '@entities/language/LanguageVitalityComputation';
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
import { usePageParams } from '@widgets/PageParamsProvider';
import { ObjectType } from '@widgets/PageParamTypes';

import { SortBehavior, SortBy, SortDirection } from './SortTypes';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

export function getSortFunction(languageSource?: LanguageSource): SortByFunctionType {
  const { sortBy, languageSource: languageSourcePageParam, sortBehavior } = usePageParams();
  const effectiveLanguageSource = languageSource ?? languageSourcePageParam;

  return getSortFunctionParameterized(sortBy, effectiveLanguageSource, sortBehavior);
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
      return getObjectDateAsNumber(object);
    case SortBy.Language:
      return getObjectMostImportantLanguageName(object);

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
      return computeVitalityMetascore(object)?.score ?? undefined;
    case SortBy.VitalityISO:
      if (object.type !== ObjectType.Language) return undefined;
      return getISOScore(object.vitalityISO ?? '') ?? undefined;
    case SortBy.VitalityEthnologue2013:
      if (object.type !== ObjectType.Language) return undefined;
      return getEthnologue2013Score(object.vitalityEth2013 ?? '') ?? undefined;
    case SortBy.VitalityEthnologue2025:
      if (object.type !== ObjectType.Language) return undefined;
      return getEthnologue2025Score(object.vitalityEth2025 ?? '') ?? undefined;
  }
}

export function getSortFunctionParameterized(
  sortBy: SortBy,
  effectiveLanguageSource: LanguageSource,
  sortDirection: SortBehavior,
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
        // New vitality sorts
        SortBy.VitalityMetascore,
        SortBy.VitalityISO,
        SortBy.VitalityEthnologue2013,
        SortBy.VitalityEthnologue2025,
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

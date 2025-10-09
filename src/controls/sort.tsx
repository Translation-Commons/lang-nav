import { uniqueBy } from '../generic/setUtils';
import { ObjectData } from '../types/DataTypes';
import { LanguageData, LanguageSource } from '../types/LanguageTypes';
import { ObjectType, SortBy } from '../types/PageParamTypes';
import {
  getObjectPopulation,
  getObjectPopulationAttested,
  getObjectPopulationOfDescendents,
} from '../views/common/ObjectField';
import {
  computeVitalityMetascore,
  getEthnologue2013Score,
  getEthnologue2025Score,
  getISOScore,
} from '../views/language/LanguageVitalityComputation';

import { usePageParams } from './PageParamsContext';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

// TODO, it may be more performant to make a sortKey function
export function getSortFunction(languageSource?: LanguageSource): SortByFunctionType {
  const { sortBy, languageSource: languageSourcePageParam, sortDirection } = usePageParams();
  const effectiveLanguageSource = languageSource ?? languageSourcePageParam;

  const sortFunction = getSortFunctionParameterized(sortBy, effectiveLanguageSource);
  if (sortDirection === 'reverse') {
    return (a, b) => -sortFunction(a, b);
  }
  return sortFunction;
}

export function getSortFunctionParameterized(
  sortBy: SortBy,
  effectiveLanguageSource: LanguageSource,
): SortByFunctionType {
  switch (sortBy) {
    case SortBy.Code:
      return (a: ObjectData, b: ObjectData) => {
        if (a.codeDisplay > b.codeDisplay) return 1;
        if (b.codeDisplay > a.codeDisplay) return -1;
        return 0;
      };
    case SortBy.Name:
      return (a: ObjectData, b: ObjectData) => {
        if (a.nameDisplay > b.nameDisplay) return 1;
        if (b.nameDisplay > a.nameDisplay) return -1;
        return 0;
      };
    case SortBy.Endonym:
      return (a: ObjectData, b: ObjectData) => {
        if (a.nameEndonym == null) return b.nameEndonym == null ? 0 : 1;
        if (b.nameEndonym == null) return -1;
        if (a.nameEndonym > b.nameEndonym) return 1;
        if (b.nameEndonym > a.nameEndonym) return -1;
        return 0;
      };
    case SortBy.CountOfTerritories:
      return (a: ObjectData, b: ObjectData) => {
        return getCountOfTerritories(b) - getCountOfTerritories(a);
      };
    case SortBy.CountOfLanguages:
      return (a: ObjectData, b: ObjectData) => {
        return getCountOfLanguages(b) - getCountOfLanguages(a);
      };
    case SortBy.Population:
      return (a: ObjectData, b: ObjectData) => {
        // Default order is descending (bigger populations first)
        return getObjectPopulation(b) - getObjectPopulation(a);
      };
    case SortBy.PopulationAttested:
      return (a: ObjectData, b: ObjectData) => {
        return getObjectPopulationAttested(b) - getObjectPopulationAttested(a);
      };
    case SortBy.PopulationOfDescendents:
      return (a: ObjectData, b: ObjectData) => {
        return (
          getObjectPopulationOfDescendents(b, effectiveLanguageSource) -
          getObjectPopulationOfDescendents(a, effectiveLanguageSource)
        );
      };
    case SortBy.RelativePopulation:
      return (a: ObjectData, b: ObjectData) => {
        switch (a.type) {
          case ObjectType.Census:
          case ObjectType.WritingSystem:
          case ObjectType.VariantTag:
            // No relative population to sort by
            return 0;
          case ObjectType.Language:
            return b.type === ObjectType.Language
              ? (b.largestDescendant?.populationEstimate ?? 0) / (b.populationEstimate ?? 1) -
                  (a.largestDescendant?.populationEstimate ?? 0) / (a.populationEstimate ?? 1)
              : -1;
          case ObjectType.Locale:
            return b.type === ObjectType.Locale
              ? (b.populationSpeakingPercent ?? 0) - (a.populationSpeakingPercent ?? 0)
              : -1;
          case ObjectType.Territory:
            return b.type === ObjectType.Territory
              ? // Err, this is not the same percent as above.
                b.population / (b.parentUNRegion?.population ?? 1) -
                  a.population / (a.parentUNRegion?.population ?? 1)
              : -1;
        }
      };
    case SortBy.Literacy:
      return (a: ObjectData, b: ObjectData) => {
        switch (a.type) {
          case ObjectType.Census:
          case ObjectType.Language:
          case ObjectType.WritingSystem:
          case ObjectType.VariantTag:
            // No literacy value to sort by
            return 0;
          case ObjectType.Locale:
            return b.type === ObjectType.Locale
              ? (b.literacyPercent ?? 0) - (a.literacyPercent ?? 0)
              : -1;
          case ObjectType.Territory:
            return b.type === ObjectType.Territory
              ? // Err, this is not the same percent as above.
                (b.literacyPercent ?? 0) - (a.literacyPercent ?? 0)
              : -1;
        }
      };

    case SortBy.Date:
      return (a, b) => getDate(b) - getDate(a);

    case SortBy.VitalityMetascore:
      return (a: ObjectData, b: ObjectData) => {
        const aVal =
          a.type === ObjectType.Language
            ? (computeVitalityMetascore(a as LanguageData).score ?? -1)
            : -1;
        const bVal =
          b.type === ObjectType.Language
            ? (computeVitalityMetascore(b as LanguageData).score ?? -1)
            : -1;
        return (bVal as number) - (aVal as number);
      };

    case SortBy.VitalityISO:
      return (a: ObjectData, b: ObjectData) => {
        const aVal =
          a.type === ObjectType.Language
            ? (getISOScore((a as LanguageData).vitalityISO ?? '') ?? -1)
            : -1;
        const bVal =
          b.type === ObjectType.Language
            ? (getISOScore((b as LanguageData).vitalityISO ?? '') ?? -1)
            : -1;
        return bVal - aVal;
      };

    case SortBy.VitalityEthnologue2013:
      return (a: ObjectData, b: ObjectData) => {
        const aVal =
          a.type === ObjectType.Language
            ? (getEthnologue2013Score((a as LanguageData).vitalityEth2013 ?? '') ?? -1)
            : -1;
        const bVal =
          b.type === ObjectType.Language
            ? (getEthnologue2013Score((b as LanguageData).vitalityEth2013 ?? '') ?? -1)
            : -1;
        return bVal - aVal;
      };

    case SortBy.VitalityEthnologue2025:
      return (a: ObjectData, b: ObjectData) => {
        const aVal =
          a.type === ObjectType.Language
            ? (getEthnologue2025Score((a as LanguageData).vitalityEth2025 ?? '') ?? -1)
            : -1;
        const bVal =
          b.type === ObjectType.Language
            ? (getEthnologue2025Score((b as LanguageData).vitalityEth2025 ?? '') ?? -1)
            : -1;
        return bVal - aVal;
      };
  }
}

export function getSortBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  switch (objectType) {
    case ObjectType.Locale:
      return [
        SortBy.Code,
        SortBy.Name,
        SortBy.Endonym,
        SortBy.Population,
        SortBy.Literacy,
        SortBy.RelativePopulation,
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
        // SortBy.Literacy, Data not available yet
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

export function getUniqueTerritoriesForLanguage(lang: LanguageData): string[] {
  return uniqueBy(
    lang.locales
      .sort((a, b) => (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0))
      .map((l) => l.territory?.nameDisplay ?? l.territoryCode)
      .filter((name) => name != null)
      .filter((name) => name !== ''),
    (name) => name,
  );
}

function getDate(object: ObjectData): number {
  switch (object.type) {
    case ObjectType.Census:
      return object.yearCollected;
    case ObjectType.VariantTag:
      return object.dateAdded?.getTime() ?? 0;
    default:
      return 0;
  }
}

function getCountOfLanguages(object: ObjectData): number {
  switch (object.type) {
    case ObjectType.Language:
      return object.childLanguages.length;
    case ObjectType.Locale:
      return object.containedLocales?.length || 0;
    case ObjectType.Census:
      return object.languageCount;
    case ObjectType.WritingSystem:
      return object.languages ? Object.values(object.languages).length : 0;
    case ObjectType.Territory:
      return object.locales?.length || 0;
    case ObjectType.VariantTag:
      return object.languageCodes?.length || 0;
    default:
      return 0;
  }
}

function getCountOfTerritories(object: ObjectData): number {
  switch (object.type) {
    case ObjectType.Language:
      return getUniqueTerritoriesForLanguage(object).length;
    case ObjectType.Territory:
      return object.containsTerritories?.length || 0;
    case ObjectType.Locale:
    case ObjectType.Census:
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      return 0;
  }
}

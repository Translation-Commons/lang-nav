import { useCallback } from 'react';

import { ObjectType, SearchableField } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { LanguageScope, LanguageData } from '@entities/language/LanguageTypes';
import {
  VitalityISO,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { LocaleData, ObjectData, TerritoryData, TerritoryScope } from '@entities/types/DataTypes';
import { getSearchableField } from '@entities/ui/ObjectField';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

export type FilterFunctionType = (a: ObjectData) => boolean;
/**
 * Provide a function that returns true for items that match filters based on substrings of their code or name.
 */
export function getFilterBySubstring(): FilterFunctionType {
  const { searchBy, searchString } = usePageParams();
  if (searchString == '') return () => true;
  return getSubstringFilterOnQuery(searchString.toLowerCase(), searchBy);
}

export function getSubstringFilterOnQuery(
  query: string,
  searchBy: SearchableField,
): FilterFunctionType {
  // Convert query to lowercase and remove accents for accent-insensitive matching
  const queryLowerCase = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  switch (searchBy) {
    case SearchableField.Code:
    case SearchableField.Endonym:
    case SearchableField.EngName:
    case SearchableField.NameOrCode:
      return (a: ObjectData) => anyWordStartsWith(getSearchableField(a, searchBy), queryLowerCase);
    case SearchableField.AllNames:
      return (a: ObjectData) =>
        a.names
          .map((name) => anyWordStartsWith(name, queryLowerCase))
          .reduce((anyPasses, thisPasses) => anyPasses || thisPasses, false);
  }
}
/**
 * Provide a function that returns true for items that are relevant to a territory.
 */
export function getFilterByTerritory(): FilterFunctionType {
  const { territoryFilter } = usePageParams();
  // Split up strings like "United States [US]" into "US" and "United States"
  const splitFilter = territoryFilter.split('[');
  const nameMatch = splitFilter[0]?.toLowerCase().trim();
  let codeMatch = '';
  if (territoryFilter.length === 2) {
    codeMatch = territoryFilter.toUpperCase(); // ISO 3166 alpha-2 code
  } else if (territoryFilter.length === 3 && territoryFilter.match(/^[0-9]{3}$/)) {
    codeMatch = territoryFilter; // UN M.49 code (eg. 419 = Latin America and the Caribbean)
  } else if (splitFilter.length > 1) {
    codeMatch = splitFilter[1].split(']')[0]?.toUpperCase();
  }

  return useCallback(
    (object: ObjectData) => {
      if (territoryFilter == '') return true;
      const territories = getTerritoriesRelevantToObject(object);
      if (codeMatch !== '') return territories.some((t) => t.ID === codeMatch);
      return territories.some((t) => t.nameDisplay.toLowerCase().startsWith(nameMatch));
    },
    [territoryFilter, codeMatch, nameMatch],
  );
}

function getTerritoriesRelevantToObject(object: ObjectData): TerritoryData[] {
  switch (object.type) {
    case ObjectType.Territory:
      return [object, object.parentUNRegion, object.sovereign].filter((t) => t != null);
    case ObjectType.Locale:
      return [object.territory].filter((t) => t != null);
    case ObjectType.Census:
      return [object.territory].filter((t) => t != null);
    case ObjectType.Language:
      return object.locales.map((l) => l.territory).filter((t) => t != null);
    case ObjectType.WritingSystem:
      return [object.territoryOfOrigin].filter((t) => t != null);
    case ObjectType.VariantTag:
      return [];
  }
}
/**
 * Provides a function that filters on the scope of an object
 */
export function getScopeFilter(): FilterFunctionType {
  const { languageScopes, territoryScopes } = usePageParams();

  const filterByScope = useCallback(
    (object: ObjectData): boolean => {
      switch (object.type) {
        case ObjectType.Language:
          return (
            languageScopes.length === 0 ||
            languageScopes.includes(object.scope ?? LanguageScope.SpecialCode)
          );
        case ObjectType.Territory:
          return territoryScopes.length === 0 || territoryScopes.includes(object.scope);
        case ObjectType.Locale:
          return doesLocaleMatchScope(object, languageScopes, territoryScopes);
        case ObjectType.Census:
        case ObjectType.WritingSystem:
        case ObjectType.VariantTag:
          return true;
      }
    },
    [languageScopes, territoryScopes],
  );

  return filterByScope;
}

function doesLocaleMatchScope(
  locale: LocaleData,
  languageScopes: LanguageScope[],
  territoryScopes: TerritoryScope[],
): boolean {
  const languageMatches = languageScopes.includes(
    locale.language?.scope ?? LanguageScope.SpecialCode,
  );
  const territoryMatches = territoryScopes.includes(
    locale.territory?.scope ?? TerritoryScope.Country,
  );
  return (
    (languageScopes.length == 0 || languageMatches) &&
    (territoryScopes.length == 0 || territoryMatches)
  );
}

/**
 * Creates a filter function for language vitality based on ISO and Ethnologue status.
 * @param params Vitality parameters from ISO and Ethnologue (2013/2025)
 * @returns Filter function that matches objects against the vitality criteria
 *
 * Non-language objects pass through. Languages must match all active filters,
 * and those with missing data are excluded when that filter is active.
 */
export function buildVitalityFilterFunction(params: {
  vitalityISO: VitalityISO[];
  vitalityEth2013: VitalityEthnologueFine[];
  vitalityEth2025: VitalityEthnologueCoarse[];
}): FilterFunctionType {
  const { vitalityISO, vitalityEth2013, vitalityEth2025 } = params;

  return (object: ObjectData): boolean => {
    // Only filter language objects
    if (object.type !== ObjectType.Language) {
      return true;
    }

    const language = object as LanguageData;

    // No filters active = pass all
    if (!vitalityISO.length && !vitalityEth2013.length && !vitalityEth2025.length) {
      return true;
    }

    // For each active filter, check if language matches
    // Languages with missing data are excluded when that filter is active
    const isoMatches =
      !vitalityISO.length ||
      (language.vitalityISO != null && vitalityISO.includes(language.vitalityISO));

    const eth2013Matches =
      !vitalityEth2013.length ||
      (language.vitalityEth2013 != null && vitalityEth2013.includes(language.vitalityEth2013));

    const eth2025Matches =
      !vitalityEth2025.length ||
      (language.vitalityEth2025 != null && vitalityEth2025.includes(language.vitalityEth2025));

    // Must match all active filters
    return isoMatches && eth2013Matches && eth2025Matches;
  };
}

/**
 * React hook version of the vitality filter function.
 * Provides a memoized function that filters languages based on their vitality status.
 */
export function getFilterByVitality(): FilterFunctionType {
  const { vitalityISO, vitalityEth2013, vitalityEth2025 } = usePageParams();

  return useCallback(
    buildVitalityFilterFunction({ vitalityISO, vitalityEth2013, vitalityEth2025 }),
    [vitalityISO, vitalityEth2013, vitalityEth2025],
  );
}

export function getSliceFunction<T>(): (arr: T[]) => T[] {
  const { page, limit } = usePageParams();
  return (arr: T[]) =>
    limit < 1 || arr.length < limit ? arr : arr.slice(limit * (page - 1), limit * page);
}

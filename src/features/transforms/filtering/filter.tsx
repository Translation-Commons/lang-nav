import { useCallback } from 'react';

import { ObjectType, SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageScope, LanguageData } from '@entities/language/LanguageTypes';
import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  LanguageISOStatus,
} from '@entities/language/vitality/VitalityTypes';
import { LocaleData, ObjectData, TerritoryScope } from '@entities/types/DataTypes';
import { getSearchableField } from '@entities/ui/ObjectField';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

export type FilterFunctionType = (a: ObjectData) => boolean;
/**
 * Provide a function that returns true for items that match filters based on substrings of their code or name.
 */
export function getFilterBySubstring(): FilterFunctionType {
  const { searchBy, searchString } = usePageParams();
  if (searchString == '') return () => true;
  return getSubstringFilterOnQuery(searchString, searchBy);
}

export function getSubstringFilterOnQuery(
  query: string,
  searchBy: SearchableField,
): FilterFunctionType {
  // Case and accent normalization is handled in anyWordStartsWith
  switch (searchBy) {
    case SearchableField.Code:
    case SearchableField.Endonym:
    case SearchableField.EngName:
    case SearchableField.NameOrCode:
      return (a: ObjectData) => anyWordStartsWith(getSearchableField(a, searchBy), query);
    case SearchableField.AllNames:
      return (a: ObjectData) =>
        a.names
          .map((name) => anyWordStartsWith(name, query))
          .reduce((anyPasses, thisPasses) => anyPasses || thisPasses, false);
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
  isoStatus: LanguageISOStatus[];
  vitalityEth2013: VitalityEthnologueFine[];
  vitalityEth2025: VitalityEthnologueCoarse[];
}): FilterFunctionType {
  const { isoStatus, vitalityEth2013, vitalityEth2025 } = params;
  const filterByVitality = (object: ObjectData | undefined): boolean => {
    // Only filter language objects
    if (object?.type === ObjectType.Locale) return filterByVitality(object.language);
    if (object?.type !== ObjectType.Language) return true;

    const language = object as LanguageData;

    // No filters active = pass all
    if (!isoStatus.length && !vitalityEth2013.length && !vitalityEth2025.length) {
      return true;
    }

    // For each active filter, check if language matches
    // Languages with missing data are excluded when that filter is active
    const isoMatches =
      !isoStatus.length || (language.ISO.status != null && isoStatus.includes(language.ISO.status));

    const eth2013Matches =
      !vitalityEth2013.length ||
      (language.vitalityEth2013 != null && vitalityEth2013.includes(language.vitalityEth2013));

    const eth2025Matches =
      !vitalityEth2025.length ||
      (language.vitalityEth2025 != null && vitalityEth2025.includes(language.vitalityEth2025));

    // Must match all active filters
    return isoMatches && eth2013Matches && eth2025Matches;
  };

  return filterByVitality;
}

/**
 * React hook version of the vitality filter function.
 * Provides a memoized function that filters languages based on their vitality status.
 */
export function getFilterByVitality(): FilterFunctionType {
  const { isoStatus, vitalityEth2013, vitalityEth2025 } = usePageParams();

  return useCallback(buildVitalityFilterFunction({ isoStatus, vitalityEth2013, vitalityEth2025 }), [
    isoStatus,
    vitalityEth2013,
    vitalityEth2025,
  ]);
}

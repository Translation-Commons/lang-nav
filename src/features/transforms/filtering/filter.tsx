import { useCallback } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { LocaleData, ObjectData, TerritoryScope } from '@entities/types/DataTypes';

export type FilterFunctionType = (a: ObjectData) => boolean;

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
export function buildVitalityFilterFunction(
  isoFilter: LanguageISOStatus[],
  ethFineFilter: VitalityEthnologueFine[],
  ethCoarseFilter: VitalityEthnologueCoarse[],
): FilterFunctionType {
  const filterByVitality = (object: ObjectData | undefined): boolean => {
    // Only filter language objects
    if (object?.type === ObjectType.Locale) return filterByVitality(object.language);
    if (object?.type !== ObjectType.Language) return true;

    const language = object as LanguageData;

    // No filters active = pass all
    if (!isoFilter.length && !ethFineFilter.length && !ethCoarseFilter.length) {
      return true;
    }

    // For each active filter, check if language matches
    const { iso, ethFine, ethCoarse } = language.vitality || {};
    const isoMatches = !isoFilter.length || (iso != null && isoFilter.includes(iso));
    const ethFineMatches =
      !ethFineFilter.length || (ethFine != null && ethFineFilter.includes(ethFine));
    const ethCoarseMatches =
      !ethCoarseFilter.length || (ethCoarse != null && ethCoarseFilter.includes(ethCoarse));

    // Must match all active filters
    return isoMatches && ethFineMatches && ethCoarseMatches;
  };

  return filterByVitality;
}

/**
 * React hook version of the vitality filter function.
 * Provides a memoized function that filters languages based on their vitality status.
 */
export function getFilterByVitality(): FilterFunctionType {
  const { isoStatus, vitalityEth2013, vitalityEth2025 } = usePageParams();

  return useCallback(buildVitalityFilterFunction(isoStatus, vitalityEth2013, vitalityEth2025), [
    isoStatus,
    vitalityEth2013,
    vitalityEth2025,
  ]);
}

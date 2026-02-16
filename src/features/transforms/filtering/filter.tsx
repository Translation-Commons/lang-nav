import { useCallback } from 'react';

import usePageParams from '@features/params/usePageParams';

import { LanguageScope } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { getLanguageForEntity, getTerritoryForEntity } from '../fields/getField';

export type FilterFunctionType = (a: ObjectData) => boolean;

/**
 * Provides a function that filters on the scope of an object
 */
export function getScopeFilter(): FilterFunctionType {
  const filterByLanguageScope = getFilterByLanguageScope();
  const filterByModality = getFilterByModality();
  const filterByTerritoryScope = getFilterByTerritoryScope();

  const filterByScope = useCallback(
    (object: ObjectData): boolean =>
      filterByLanguageScope(object) && filterByModality(object) && filterByTerritoryScope(object),
    [filterByLanguageScope, filterByModality, filterByTerritoryScope],
  );

  return filterByScope;
}

export function getFilterByLanguageScope(): FilterFunctionType {
  const { languageScopes } = usePageParams();

  const filterByLanguageScope = useCallback(
    (object: ObjectData | undefined): boolean => {
      if (languageScopes.length === 0 || !object) return true;
      const lang = getLanguageForEntity(object);
      if (!lang) return true; // If languages don't apply, don't filter out
      return languageScopes.includes(lang.scope ?? LanguageScope.SpecialCode);
    },
    [languageScopes],
  );

  return filterByLanguageScope;
}

export function getFilterByModality(): FilterFunctionType {
  const { modalityFilter } = usePageParams();

  const filterByModality = useCallback(
    (object: ObjectData | undefined): boolean => {
      if (modalityFilter.length === 0 || !object) return true;
      const lang = getLanguageForEntity(object);
      if (!lang) return true; // If languages don't apply, don't filter out
      return lang.modality != null && modalityFilter.includes(lang.modality);
    },
    [modalityFilter],
  );

  return filterByModality;
}

export function getFilterByTerritoryScope(): FilterFunctionType {
  const { territoryScopes } = usePageParams();

  const filterByTerritoryScope = useCallback(
    (object: ObjectData | undefined): boolean => {
      if (territoryScopes.length === 0 || !object) return true;
      const terr = getTerritoryForEntity(object);
      if (!terr) return true; // If territories don't apply, don't filter out
      return territoryScopes.includes(terr.scope);
    },
    [territoryScopes],
  );

  return filterByTerritoryScope;
}

/**
 * Creates a filter function for language vitality based on ISO and Ethnologue status.
 * @param params Vitality parameters from ISO and Ethnologue (Fine and Coarse)
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
    if (!object) return true;
    const lang = getLanguageForEntity(object);
    if (!lang) return true; // If languages don't apply, don't filter out

    // No filters active = pass all
    if (!isoFilter.length && !ethFineFilter.length && !ethCoarseFilter.length) {
      return true;
    }

    // For each active filter, check if language matches
    const { iso, ethFine, ethCoarse } = lang.vitality || {};
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
  const { isoStatus, vitalityEthFine, vitalityEthCoarse } = usePageParams();

  return useCallback(buildVitalityFilterFunction(isoStatus, vitalityEthFine, vitalityEthCoarse), [
    isoStatus,
    vitalityEthFine,
    vitalityEthCoarse,
  ]);
}

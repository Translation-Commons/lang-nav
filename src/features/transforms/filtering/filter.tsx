import { EntityData } from '@entities/types/DataTypes';

import Field from '../fields/Field';

import useFilters from './useFilters';

export type FilterFunctionType = (a: EntityData) => boolean;

/**
 * These functions are left here to avoid a huge refactor but long term customers should use `useFilters` directly.
 */
export function useScopeFilter(): FilterFunctionType {
  const filterBy = useFilters();
  return (ent: EntityData) =>
    filterBy[Field.TerritoryScope](ent) &&
    filterBy[Field.LanguageScope](ent) &&
    filterBy[Field.Modality](ent);
}

// The other vitality filters have been removed until we resolve the data source (if we do)
export function useFilterByVitality(): FilterFunctionType {
  const filterBy = useFilters();
  return (ent: EntityData) => filterBy[Field.ISOStatus](ent);
}

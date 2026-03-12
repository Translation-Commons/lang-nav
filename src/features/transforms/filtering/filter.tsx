import { ObjectData } from '@entities/types/DataTypes';

import Field from '../fields/Field';

import useFilters from './useFilters';

export type FilterFunctionType = (a: ObjectData) => boolean;

/**
 * These functions are left here to avoid a huge refactor but long term customers should use `useFilters` directly.
 */
export function getScopeFilter(): FilterFunctionType {
  const filterBy = useFilters();
  return (object: ObjectData) =>
    filterBy[Field.TerritoryScope](object) &&
    filterBy[Field.LanguageScope](object) &&
    filterBy[Field.Modality](object);
}

// The other vitality filters have been removed until we resolve the data source (if we do)
export function getFilterByVitality(): FilterFunctionType {
  const filterBy = useFilters();
  return (object: ObjectData) =>
    filterBy[Field.ISOStatus](object) &&
    filterBy[Field.VitalityEthnologueCoarse](object) &&
    filterBy[Field.VitalityEthnologueFine](object);
}

export function getFilterByPopulation(): FilterFunctionType {
  const filterBy = useFilters();
  return (object: ObjectData) => filterBy[Field.Population](object);
}

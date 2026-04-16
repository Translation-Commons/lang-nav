import { getDefaultParams } from '@features/params/Profiles';

import { getObjectPopulation } from '@entities/lib/getObjectPopulation';
import { ObjectData } from '@entities/types/DataTypes';

import { FilterFunctionType } from './filter';

export function buildFilterByPopulation(
  populationMin: number,
  populationMax: number,
): FilterFunctionType {
  const defaults = getDefaultParams();
  if (populationMin === defaults.populationMin && populationMax === defaults.populationMax)
    return () => true;

  return (object: ObjectData): boolean => {
    const population = getObjectPopulation(object);
    if (population == null) return false;
    return population >= populationMin && population <= populationMax;
  };
}

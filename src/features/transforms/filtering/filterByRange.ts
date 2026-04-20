import { getDefaultParams } from '@features/params/Profiles';

import { getObjectPopulation } from '@entities/lib/getObjectPopulation';
import { ObjectData } from '@entities/types/DataTypes';

import { FilterFunctionType } from './filter';

export function buildFilterByPopulation(
  populationMin: number,
  populationMax: number,
): FilterFunctionType {
  const defaults = getDefaultParams();
  const populationUpperBound =
    populationMax < 0 || populationMax >= defaults.populationMax
      ? Number.MAX_SAFE_INTEGER
      : populationMax;
  if (populationMin === defaults.populationMin && populationMax >= defaults.populationMax)
    return () => true;

  return (object: ObjectData): boolean => {
    const population = getObjectPopulation(object) ?? -1; // treat undefined population as -1 for optional filtering
    return population >= populationMin && population <= populationUpperBound;
  };
}

import { getDefaultParams } from '@features/params/Profiles';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';
import { EntityData } from '@entities/types/DataTypes';

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

  return (ent: EntityData): boolean => {
    const population = getEntityPopulation(ent) ?? -1; // treat undefined population as -1 for optional filtering
    return population >= populationMin && population <= populationUpperBound;
  };
}

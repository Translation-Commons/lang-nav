import { getDefaultParams } from '@features/params/Profiles';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';
import { EntityData, EntityType } from '@entities/types/EntityTypes';

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

export function buildFilterByDigitalSupport(
  digitalSupportMin: number,
  digitalSupportMax: number,
): FilterFunctionType {
  const defaults = getDefaultParams();
  const digitalSupportUpperBound =
    digitalSupportMax < 0 || digitalSupportMax >= defaults.digitalSupportMax
      ? Number.MAX_SAFE_INTEGER
      : digitalSupportMax;
  if (
    digitalSupportMin === defaults.digitalSupportMin &&
    digitalSupportMax >= defaults.digitalSupportMax
  )
    return () => true;

  const filterFunction = (ent?: EntityData): boolean => {
    if (ent?.type === EntityType.Locale) return filterFunction(ent.language);
    if (ent?.type !== EntityType.Language) return true; // cannot filter
    const digitalSupport = ent.digitalSupportScore?.overall ?? -1; // treat undefined digitalSupport as -1
    return digitalSupport >= digitalSupportMin && digitalSupport <= digitalSupportUpperBound;
  };

  return filterFunction;
}

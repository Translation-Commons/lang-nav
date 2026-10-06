import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';

import { isTerritoryGroup, TerritoryData } from '@entities/territory/TerritoryTypes';

export default function useCountries(): TerritoryData[] {
  const { territories } = useDataContext();
  return useMemo(() => territories.filter((t) => !isTerritoryGroup(t.scope)), [territories]);
}

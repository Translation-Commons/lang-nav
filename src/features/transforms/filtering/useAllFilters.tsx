import { useMemo } from 'react';

import { EntityData } from '@entities/types/EntityTypes';

import useFilters from './useFilters';

const useAllFilters = () => {
  const filters = useFilters();

  const filterFunction = useMemo(
    () => (ent: EntityData) => Object.values(filters).every((filter) => filter(ent)),
    [filters],
  );
  return filterFunction;
};

export default useAllFilters;

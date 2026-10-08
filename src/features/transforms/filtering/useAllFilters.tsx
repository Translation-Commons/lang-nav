import { useMemo } from 'react';

import { EntityData } from '@entities/types/EntityTypes';

import { getFilterFields } from '../fields/FieldApplicability';

import useFilters from './useFilters';

const useAllFilters = () => {
  const filters = useFilters();
  const filterFields = useMemo(() => getFilterFields(), []);

  const filterFunction = useMemo(
    () => (ent: EntityData) => filterFields.every((field) => filters[field](ent)),
    [filters, filterFields],
  );
  return filterFunction;
};

export default useAllFilters;

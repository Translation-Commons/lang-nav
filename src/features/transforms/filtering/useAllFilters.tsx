import { useMemo } from 'react';

import { EntityData } from '@entities/types/EntityTypes';

import { useWhyDidYouUpdate } from '@shared/hooks/useWhyDidYouUpdate';

import { getFilterFields } from '../fields/FieldApplicability';

import useFilters from './useFilters';

const useAllFilters = () => {
  const filters = useFilters();
  const filterFields = getFilterFields();

  const filterFunction = useMemo(
    () => (ent: EntityData) => filterFields.every((field) => filters[field](ent)),
    [filters, filterFields],
  );
  useWhyDidYouUpdate(`useAllFilters`, { filters, filterFields });
  return filterFunction;
};

export default useAllFilters;

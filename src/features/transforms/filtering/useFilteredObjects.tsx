import { useMemo } from 'react';

import useEntities from '@features/data/context/useEntities';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { ObjectData } from '@entities/types/DataTypes';

import getFilterBySubstring from '../search/getFilterBySubstring';

import { getFilterByVitality, getScopeFilter } from './filter';
import { getFilterByConnections } from './filterByConnections';
import useFilters from './useFilters';

type UseFilteredObjectsParams<T extends ObjectData> = {
  // TODO use Fields to specify which filters should be used, not these generalized booleans
  useScope?: boolean;
  useSubstring?: boolean;
  useConnections?: boolean;
  useVitality?: boolean;
  usePopulation?: boolean;
  inputObjects?: T[];
};

const useFilteredObjects = <T extends ObjectData>({
  useScope = true,
  useSubstring = true,
  useConnections = true,
  useVitality = true,
  usePopulation = true,
  inputObjects,
}: UseFilteredObjectsParams<T>): { filteredObjects: T[]; allObjectsInType: T[] } => {
  // Implementation of filtering logic goes here
  const pageObjects = useEntities() as T[]; // Get all objects of the relevant type from context
  // TODO use useFilters for all of these
  const filters = useFilters();
  const filterByScope = useScope ? getScopeFilter() : () => true;
  const filterBySubstring = useSubstring ? getFilterBySubstring() : () => true;
  const filterByConnections = useConnections ? getFilterByConnections() : () => true;
  const filterByVitality = useVitality ? getFilterByVitality() : () => true;
  const filterByPopulation = usePopulation ? filters.Population : () => true;
  const sortFunction = getSortFunction();
  const allObjectsInType = inputObjects ?? pageObjects;

  const filteredObjects = useMemo(() => {
    return allObjectsInType
      .filter(
        (obj) =>
          filterByScope(obj) &&
          filterBySubstring(obj) &&
          filterByConnections(obj) &&
          filterByVitality(obj) &&
          filterByPopulation(obj),
      )
      .sort(sortFunction);
  }, [
    allObjectsInType,
    filterByScope,
    filterBySubstring,
    filterByConnections,
    filterByVitality,
    filterByPopulation,
    sortFunction,
  ]);

  return { filteredObjects, allObjectsInType };
};

export default useFilteredObjects;

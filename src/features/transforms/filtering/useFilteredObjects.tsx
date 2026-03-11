import { useMemo } from 'react';

import useEntities from '@features/data/context/useEntities';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { ObjectData } from '@entities/types/DataTypes';

import getFilterBySubstring from '../search/getFilterBySubstring';

import { getFilterByVitality, getScopeFilter } from './filter';
import { getFilterByConnections } from './filterByConnections';

type UseFilteredObjectsParams = {
  // TODO use Fields to specify which filters should be used, not these generalized booleans
  useScope?: boolean;
  useSubstring?: boolean;
  useConnections?: boolean;
  useVitality?: boolean;
  inputObjects?: ObjectData[];
};

const useFilteredObjects = ({
  useScope = true,
  useSubstring = true,
  useConnections = true,
  useVitality = true,
  inputObjects,
}: UseFilteredObjectsParams): { filteredObjects: ObjectData[]; allObjectsInType: ObjectData[] } => {
  // Implementation of filtering logic goes here
  const pageObjects = useEntities();
  // TODO use useFilters
  const filterByScope = useScope ? getScopeFilter() : () => true;
  const filterBySubstring = useSubstring ? getFilterBySubstring() : () => true;
  const filterByConnections = useConnections ? getFilterByConnections() : () => true;
  const filterByVitality = useVitality ? getFilterByVitality() : () => true;
  const sortFunction = getSortFunction();
  const allObjectsInType = inputObjects ?? pageObjects;

  const filteredObjects = useMemo(() => {
    return allObjectsInType
      .filter(
        (obj) =>
          filterByScope(obj) &&
          filterBySubstring(obj) &&
          filterByConnections(obj) &&
          filterByVitality(obj),
      )
      .sort(sortFunction);
  }, [
    allObjectsInType,
    filterByScope,
    filterBySubstring,
    filterByConnections,
    filterByVitality,
    sortFunction,
  ]);

  return { filteredObjects, allObjectsInType };
};

export default useFilteredObjects;

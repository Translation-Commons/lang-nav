import { useMemo } from 'react';

import { getSortFunction } from '@features/transforms/sorting/sort';

import { ObjectData } from '@entities/types/DataTypes';

import getFilterBySubstring from '../search/getFilterBySubstring';

import { getFilterByVitality, getScopeFilter } from './filter';
import { getFilterByConnections } from './filterByConnections';

// You may not always want to use all filters, for example, if we want to show
// language families in the hierarchy view
export type FilterOptions = {
  scope?: boolean;
  substring?: boolean;
  connections?: boolean;
  vitality?: boolean;
};

const useFilters = <T extends ObjectData>(objects: T[], options: FilterOptions): T[] => {
  const { scope = true, substring = true, connections = true, vitality = true } = options;
  const filterByScope = scope ? getScopeFilter() : () => true;
  const filterBySubstring = substring ? getFilterBySubstring() : () => true;
  const filterByConnections = connections ? getFilterByConnections() : () => true;
  const filterByVitality = vitality ? getFilterByVitality() : () => true;
  const sortFunction = getSortFunction();

  return useMemo(() => {
    return objects
      .filter(
        (obj) =>
          filterByScope(obj) &&
          filterBySubstring(obj) &&
          filterByConnections(obj) &&
          filterByVitality(obj),
      )
      .sort(sortFunction);
  }, [
    objects,
    filterByScope,
    filterBySubstring,
    filterByConnections,
    filterByVitality,
    sortFunction,
  ]);
};

export default useFilters;

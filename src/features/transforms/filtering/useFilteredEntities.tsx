import { useCallback } from 'react';

import useEntities from '@features/data/context/useEntities';
import usePageParams from '@features/params/usePageParams';
import { useSortFunction } from '@features/transforms/sorting/sort';

import { EntityData } from '@entities/types/EntityTypes';

import Field from '../fields/Field';
import useFilterBySubstring from '../search/useFilterBySubstring';

import { useFilterByVitality, useScopeFilter } from './filter';
import { useFilterByConnections } from './filterByConnections';
import useAsyncFilterSort from './useAsyncFilterSort';
import useFilters from './useFilters';

const alwaysTrueFilter = () => true;

type UseFilteredEntitiesParams<T extends EntityData> = {
  // TODO use Fields to specify which filters should be used, not these generalized booleans
  useScope?: boolean;
  useSubstring?: boolean;
  useConnections?: boolean;
  useVitality?: boolean;
  usePopulation?: boolean;
  useLanguageSource?: boolean;
  inputEnts?: T[];
};

const useFilteredEntities = <T extends EntityData>({
  useScope = true,
  useSubstring = true,
  useConnections = true,
  useVitality = true,
  usePopulation = true,
  useLanguageSource = true,
  inputEnts,
}: UseFilteredEntitiesParams<T>): {
  filteredEntities: T[];
  allEntities: T[];
  isPending: boolean;
} => {
  // Implementation of filtering logic goes here
  const pageEntities = useEntities() as T[]; // Get all entities of the relevant type from context
  const { pinned } = usePageParams();
  // TODO use useFilters for all of these
  const filters = useFilters();
  const filterByScope = useScopeFilter();
  const filterBySubstring = useFilterBySubstring();
  const filterByConnections = useFilterByConnections();
  const filterByVitality = useFilterByVitality();
  const filterByPopulation = usePopulation ? filters.Population : alwaysTrueFilter;
  const filterByLanguageSource = useLanguageSource
    ? filters[Field.SourceForLanguage]
    : alwaysTrueFilter;
  const filterByDigitalSupport = filters[Field.DigitalSupport];
  const sortFunction = useSortFunction();
  const allEntities = inputEnts ?? pageEntities;
  const filterFunction = useCallback(
    (ent: T) =>
      // Pinned entities always remain visible regardless of the active filters.
      pinned.includes(ent.ID) ||
      ((!useScope || filterByScope(ent)) &&
        (!useSubstring || filterBySubstring(ent)) &&
        (!useConnections || filterByConnections(ent)) &&
        (!useVitality || filterByVitality(ent)) &&
        filterByPopulation(ent) &&
        filterByLanguageSource(ent) &&
        filterByDigitalSupport(ent)),
    [
      pinned,
      filterByScope,
      filterBySubstring,
      filterByConnections,
      filterByVitality,
      filterByPopulation,
      filterByLanguageSource,
      filterByDigitalSupport,
      useScope,
      useSubstring,
      useConnections,
      useVitality,
    ],
  );
  const { items: filteredEntities, isPending } = useAsyncFilterSort({
    items: allEntities,
    predicate: filterFunction,
    compare: sortFunction,
  });

  return { filteredEntities, allEntities, isPending };
};

export default useFilteredEntities;

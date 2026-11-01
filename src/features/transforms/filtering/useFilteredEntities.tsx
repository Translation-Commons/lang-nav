import { useCallback } from 'react';

import useEntities from '@features/data/context/useEntities';
import usePageParams from '@features/params/usePageParams';
import { useSortFunction } from '@features/transforms/sorting/sort';

import { EntityData } from '@entities/types/EntityTypes';

import { useWhyDidYouUpdate } from '@shared/hooks/useWhyDidYouUpdate';

import Field from '../fields/Field';
import getFilterBySubstring from '../search/getFilterBySubstring';

import { useFilterByVitality, useScopeFilter } from './filter';
import { getFilterByConnections } from './filterByConnections';
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
  const filterByScope = useScope ? useScopeFilter() : alwaysTrueFilter;
  const filterBySubstring = useSubstring ? getFilterBySubstring() : alwaysTrueFilter;
  const filterByConnections = useConnections ? getFilterByConnections() : alwaysTrueFilter;
  const filterByVitality = useVitality ? useFilterByVitality() : alwaysTrueFilter;
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
      (filterByScope(ent) &&
        filterBySubstring(ent) &&
        filterByConnections(ent) &&
        filterByVitality(ent) &&
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
    ],
  );
  const { items: filteredEntities, isPending } = useAsyncFilterSort({
    items: allEntities,
    predicate: filterFunction,
    compare: sortFunction,
  });
  useWhyDidYouUpdate('useFilteredEntities', {
    useScope,
    useSubstring,
    useConnections,
    useVitality,
    usePopulation,
    useLanguageSource,
    inputEnts,
    pinned,
  });

  return { filteredEntities, allEntities, isPending };
};

export default useFilteredEntities;

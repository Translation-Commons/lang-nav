import { useMemo } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { getSortFunction } from '@features/sorting/sort';

import { ObjectData } from '@entities/types/DataTypes';

import { getFilterBySubstring, getFilterByVitality, getScopeFilter } from './filter';
import { getFilterByConnections } from './filterByConnections';

type UseFilteredObjectsParams = {
  useScope?: boolean;
  useSubstring?: boolean;
  useConnections?: boolean;
  useVitality?: boolean;
};

const useFilteredObjects = ({
  useScope = true,
  useSubstring = true,
  useConnections = true,
  useVitality = true,
}: UseFilteredObjectsParams): { filteredObjects: ObjectData[]; allObjectsInType: ObjectData[] } => {
  // Implementation of filtering logic goes here
  const { objectType } = usePageParams();
  const { languagesInSelectedSource, locales, territories, writingSystems, variantTags, censuses } =
    useDataContext();
  const filterByScope = useScope ? getScopeFilter() : () => true;
  const filterBySubstring = useSubstring ? getFilterBySubstring() : () => true;
  const filterByConnections = useConnections ? getFilterByConnections() : () => true;
  const filterByVitality = useVitality ? getFilterByVitality() : () => true;
  const sortFunction = getSortFunction();

  const objects = useMemo(() => {
    switch (objectType) {
      case ObjectType.Census:
        return Object.values(censuses);
      case ObjectType.Language:
        return languagesInSelectedSource;
      case ObjectType.Locale:
        return locales;
      case ObjectType.Territory:
        return territories;
      case ObjectType.WritingSystem:
        return writingSystems;
      case ObjectType.VariantTag:
        return variantTags;
    }
  }, [
    objectType,
    censuses,
    languagesInSelectedSource,
    locales,
    territories,
    writingSystems,
    variantTags,
  ]);

  const filteredObjects = useMemo(() => {
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

  return { filteredObjects, allObjectsInType: objects };
};

export default useFilteredObjects;

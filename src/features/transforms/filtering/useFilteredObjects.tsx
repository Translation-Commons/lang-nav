import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { ObjectData } from '@entities/types/DataTypes';

import getFilterBySubstring from '../search/getFilterBySubstring';

import { getFilterByVitality, getScopeFilter } from './filter';
import { getFilterByConnections } from './filterByConnections';

type UseFilteredObjectsParams = {
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
  const { objectType } = usePageParams();
  const { languagesInSelectedSource, locales, territories, writingSystems, variantTags, censuses, keyboards } =
    useDataContext();
  const filterByScope = useScope ? getScopeFilter() : () => true;
  const filterBySubstring = useSubstring ? getFilterBySubstring() : () => true;
  const filterByConnections = useConnections ? getFilterByConnections() : () => true;
  const filterByVitality = useVitality ? getFilterByVitality() : () => true;
  const sortFunction = getSortFunction();

  const objects = useMemo(() => {
    if (inputObjects) return inputObjects;
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
      case ObjectType.Keyboard:
        return keyboards;
    }
  }, [
    objectType,
    censuses,
    languagesInSelectedSource,
    locales,
    territories,
    writingSystems,
    variantTags,
    keyboards,
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

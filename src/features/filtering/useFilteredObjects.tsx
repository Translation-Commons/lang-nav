import { useMemo } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getFilterByVitality,
  getScopeFilter,
} from './filter';

type UseFilteredObjectsParams = {
  useScope?: boolean;
  useSubstring?: boolean;
  useTerritory?: boolean;
  useVitality?: boolean;
};

const useFilteredObjects = ({
  useScope = true,
  useSubstring = true,
  useTerritory = true,
  useVitality = true,
}: UseFilteredObjectsParams) => {
  // Implementation of filtering logic goes here
  const { objectType } = usePageParams();
  const { languagesInSelectedSource, locales, territories, writingSystems, variantTags, censuses } =
    useDataContext();
  const filterByScope = useScope ? getScopeFilter() : () => true;
  const filterBySubstring = useSubstring ? getFilterBySubstring() : () => true;
  const filterByTerritory = useTerritory ? getFilterByTerritory() : () => true;
  const filterByVitality = useVitality ? getFilterByVitality() : () => true;

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
    return objects.filter(
      (obj) =>
        filterByScope(obj) &&
        filterBySubstring(obj) &&
        filterByTerritory(obj) &&
        filterByVitality(obj),
    );
  }, [objects, filterByScope, filterBySubstring, filterByTerritory, filterByVitality]);

  return filteredObjects;
};

export default useFilteredObjects;

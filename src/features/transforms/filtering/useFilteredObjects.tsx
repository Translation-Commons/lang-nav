import useObjects, { ObjectDataByType } from '@features/data/context/useObjects';

import useFilters, { FilterOptions } from './useFilters';

function useFilteredObjects<K extends keyof ObjectDataByType>(
  type: K,
  { scope = true, substring = true, connections = true, vitality = true }: FilterOptions,
): {
  filteredObjects: ObjectDataByType[K][];
  allObjectsInType: ObjectDataByType[K][];
} {
  const objects = useObjects(type);

  const filteredObjects = useFilters(objects, {
    scope,
    substring,
    connections,
    vitality,
  });

  return { filteredObjects, allObjectsInType: objects };
}

export default useFilteredObjects;

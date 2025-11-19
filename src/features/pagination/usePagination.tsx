import { useCallback } from 'react';

import usePageParams from '@features/page-params/usePageParams';

/**
 * This gets a function that trims the visible data based on the page parameters
 *
 * Note you do have to indicate the type of data being sliced for typescript.
 *
 * Example usage:
 * const getCurrentObjects = useSliceFunction<ObjectData>();
 * const currentObjects = getCurrentObjects(objects);
 */
function usePagination<T>(): { getCurrentObjects: (arr: T[]) => T[] } {
  const { page, limit } = usePageParams();

  const getCurrentObjects = useCallback(
    (arr: T[]) => {
      // If the limit is not a countable number, return all elements
      // Commonly -1 is used as a stand-in for infinity.
      // Also, if the limit is longer than the array, you can just return the full array.
      if (limit < 1 || arr.length < limit) return arr;

      // If we're past the last page, return the first page.
      if (arr.length <= limit * (page - 1)) return arr.slice(0, limit);

      // Otherwise cut into the data
      return arr.slice(limit * (page - 1), limit * page);
    },
    [page, limit],
  );

  return { getCurrentObjects };
}

export default usePagination;

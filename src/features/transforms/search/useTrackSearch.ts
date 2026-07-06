import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import usePageParams from '@features/params/usePageParams';

import { SearchTrigger, trackSearchTyped } from '@shared/lib/amplitude';

import useFilteredEntities from '../filtering/useFilteredEntities';

import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';

// Fires explore_search_typed from the search component so it can report
// result_count and whether the search was typed or a suggestion click.
export default function useTrackSearch(): (query: string, trigger: SearchTrigger) => void {
  const location = useLocation();
  const { objectType, view, searchBy } = usePageParams();
  // Entities passing every active filter except search, so result_count
  // reflects the results shown for the query rather than raw substring matches.
  const { filteredEntities } = useFilteredEntities({ useSubstring: false });

  return useCallback(
    (query: string, trigger: SearchTrigger) => {
      const resultCount =
        query === ''
          ? 0
          : filteredEntities.filter(getSubstringFilterOnQuery(query, searchBy)).length;
      trackSearchTyped({
        path: location.pathname,
        entity: objectType,
        view,
        search_string: query,
        search_by: searchBy,
        result_count: resultCount,
        cleared: query === '',
        trigger,
      });
    },
    [location.pathname, objectType, view, searchBy, filteredEntities],
  );
}

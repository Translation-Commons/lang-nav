import { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';
import { getScopeFilter } from '@features/transforms/filtering/filter';

import { uniqueBy } from '@shared/lib/setUtils';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedObjectField from './HighlightedObjectField';

const SEARCH_RESULTS_LIMIT = 10; // even though it is filtered again later, this seems to prevent render lag.

export default function useSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy, objectType } = usePageParams();
  const { censuses, territories, languagesInSelectedSource, locales, writingSystems, variantTags } =
    useDataContext();
  const scopeFilter = getScopeFilter();

  const objects = useMemo(() => {
    switch (objectType) {
      case ObjectType.Language:
        return languagesInSelectedSource;
      case ObjectType.Locale:
        return locales;
      case ObjectType.Territory:
        return territories;
      case ObjectType.WritingSystem:
        return writingSystems;
      case ObjectType.Census:
        return Object.values(censuses);
      case ObjectType.VariantTag:
        return variantTags;
    }
  }, [
    censuses,
    languagesInSelectedSource,
    locales,
    territories,
    variantTags,
    writingSystems,
    objectType,
    searchBy,
  ]);

  const getSuggestions = useCallback(
    async (query: string) => {
      const substringFilter = getSubstringFilterOnQuery(query, searchBy);
      return uniqueBy(
        (objects || [])
          .filter(substringFilter)
          .sort((a, b) => (scopeFilter(a) ? -1 : 1) - (scopeFilter(b) ? -1 : 1))
          .slice(0, SEARCH_RESULTS_LIMIT)
          .map((object) => {
            const label = (
              <HighlightedObjectField
                object={object}
                field={searchBy}
                query={query}
                showOriginalName={true}
              />
            );
            const searchString = getSearchableField(object, searchBy);
            return { objectID: object.ID, searchString, label };
          }),
        (item) => item.objectID,
      );
    },
    [objects, scopeFilter, searchBy],
  );

  return getSuggestions;
}

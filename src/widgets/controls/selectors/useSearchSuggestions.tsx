import { useMemo } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { ObjectType, SearchableField } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';
import { getScopeFilter, getSubstringFilterOnQuery } from '@features/transforms/filtering/filter';

import { getSearchableField, HighlightedObjectField } from '@entities/ui/ObjectField';

import { uniqueBy } from '@shared/lib/setUtils';

const SEARCH_RESULTS_LIMIT = 10; // even though it is filtered again later, this seems to prevent render lag.

export function useSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
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

  const getSuggestions = useMemo(() => {
    return async (query: string) => {
      const substringFilter = getSubstringFilterOnQuery(query, searchBy);
      return uniqueBy(
        (objects || [])
          .filter(scopeFilter)
          .filter(substringFilter)
          .slice(0, SEARCH_RESULTS_LIMIT)
          .map((object) => {
            let label = <HighlightedObjectField object={object} field={searchBy} query={query} />;
            const searchString = getSearchableField(object, searchBy);
            if (searchBy === SearchableField.Code) {
              label = (
                <>
                  {object.nameDisplay} [{label}]
                </>
              );
            }
            return { objectID: object.ID, searchString, label };
          }),
        (item) => item.objectID,
      );
    };
  }, [objects, scopeFilter, searchBy]);

  return getSuggestions;
}

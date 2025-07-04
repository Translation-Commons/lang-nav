import { useMemo } from 'react';

import { useDataContext } from '../../data/DataContext';
import { uniqueBy } from '../../generic/setUtils';
import { ObjectType, SearchableField } from '../../types/PageParamTypes';
import { getSearchableField, HighlightedObjectField } from '../../views/common/ObjectField';
import { Suggestion } from '../components/TextInput';
import { getGranularityFilter, getSubstringFilterOnQuery } from '../filter';
import { usePageParams } from '../PageParamsContext';

const SEARCH_RESULTS_LIMIT = 10; // even though it is filtered again later, this seems to prevent render lag.

export function useSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy, objectType } = usePageParams();
  const { languages, locales, territories, writingSystems } = useDataContext();
  const filterByGranularity = getGranularityFilter();

  const objects = useMemo(() => {
    if (searchBy === SearchableField.Territory) {
      return Object.values(territories);
    } else {
      switch (objectType) {
        case ObjectType.Language:
          return Object.values(languages);
        case ObjectType.Locale:
          return Object.values(locales);
        case ObjectType.Territory:
          return Object.values(territories);
        case ObjectType.WritingSystem:
          return Object.values(writingSystems);
      }
    }
  }, [objectType, languages, locales, territories, writingSystems, searchBy]);

  const getSuggestions = useMemo(() => {
    return async (query: string) => {
      const filterBySubstring = getSubstringFilterOnQuery(
        query,
        searchBy === SearchableField.Territory ? SearchableField.NameOrCode : searchBy,
      );
      return uniqueBy(
        (objects || [])
          .filter(filterByGranularity)
          .filter(filterBySubstring)
          .slice(0, SEARCH_RESULTS_LIMIT)
          .map((object) => {
            let label = <HighlightedObjectField object={object} field={searchBy} query={query} />;
            let searchString = getSearchableField(object, searchBy);
            if (searchBy === SearchableField.Code) {
              label = (
                <>
                  {object.nameDisplay} [{label}]
                </>
              );
            } else if (searchBy === SearchableField.Territory) {
              searchString = object.nameDisplay;
            }
            return { objectID: object.ID, searchString, label };
          }),
        (item) => item.objectID,
      );
    };
  }, [objects, filterByGranularity, searchBy]);

  return getSuggestions;
}

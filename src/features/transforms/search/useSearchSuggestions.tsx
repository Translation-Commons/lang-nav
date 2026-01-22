import { useCallback, useMemo } from 'react';

import useObjects from '@features/data/context/useObjects';
import { Suggestion, SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';
import {
  getFilterByLanguageScope,
  getFilterByTerritoryScope,
} from '@features/transforms/filtering/filter';

import { ObjectData } from '@entities/types/DataTypes';

import {
  getFilterByLanguage,
  getFilterByTerritory,
  getFilterByWritingSystem,
} from '../filtering/filterByConnections';
import { getFilterLabels } from '../filtering/FilterLabels';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedObjectField from './HighlightedObjectField';

export default function useSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy, objectType } = usePageParams();
  const filterByLanguageScope = getFilterByLanguageScope();
  const filterByTerritoryScope = getFilterByTerritoryScope();
  const filterByWritingSystem = getFilterByWritingSystem();
  const filterByLanguage = getFilterByLanguage();
  const filterByTerritory = getFilterByTerritory();
  const filterLabels = getFilterLabels();

  const objects = useObjects(objectType);

  const [getMatchDistance, getMatchGroup] = useMemo(() => {
    const getMatchDistance = (object: ObjectData): number => {
      let dist = 0;
      if (!filterByLanguage(object)) dist += 1;
      if (!filterByWritingSystem(object)) dist += 2;
      if (!filterByTerritory(object)) dist += 4;
      if (!filterByTerritoryScope(object)) dist += 8;
      if (!filterByLanguageScope(object)) dist += 16;
      return dist;
    };
    const getMatchGroup = (object: ObjectData): string => {
      if (!filterByLanguage(object)) return 'not ' + filterLabels.languageFilter;
      if (!filterByWritingSystem(object)) return 'not ' + filterLabels.writingSystemFilter;
      if (!filterByTerritory(object)) return 'not ' + filterLabels.territoryFilter;
      if (!filterByTerritoryScope(object)) return 'not ' + filterLabels.territoryScope;
      if (!filterByLanguageScope(object)) return 'not ' + filterLabels.languageScope;
      return 'matched';
    };
    return [getMatchDistance, getMatchGroup];
  }, [
    filterByLanguage,
    filterByWritingSystem,
    filterByTerritory,
    filterByTerritoryScope,
    filterByLanguageScope,
    filterLabels,
  ]);

  const getSuggestions = useCallback(
    async (query: string) => {
      const substringFilter = getSubstringFilterOnQuery(query, searchBy);
      return (objects || [])
        .filter(substringFilter)
        .sort((a, b) => getMatchDistance(a) - getMatchDistance(b))
        .slice(0, SUGGESTION_LIMIT)
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
          return { objectID: object.ID, searchString, label, group: getMatchGroup(object) };
        });
    },
    [objects, searchBy, getMatchDistance, getMatchGroup],
  );

  return getSuggestions;
}

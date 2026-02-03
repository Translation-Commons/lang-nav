import { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import { Suggestion, SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';
import {
  getFilterByLanguageScope,
  getFilterByModality,
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
  const { censuses, territories, languagesInSelectedSource, locales, writingSystems, variantTags } =
    useDataContext();
  const filterByLanguageScope = getFilterByLanguageScope();
  const filterByModality = getFilterByModality();
  const filterByTerritoryScope = getFilterByTerritoryScope();
  const filterByWritingSystem = getFilterByWritingSystem();
  const filterByLanguage = getFilterByLanguage();
  const filterByTerritory = getFilterByTerritory();
  const filterLabels = getFilterLabels();

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

  const [getMatchDistance, getMatchGroup] = useMemo(() => {
    const getMatchDistance = (object: ObjectData): number => {
      let dist = 0;
      if (!filterByLanguage(object)) dist += 1;
      if (!filterByWritingSystem(object)) dist += 2;
      if (!filterByTerritory(object)) dist += 4;
      if (!filterByTerritoryScope(object)) dist += 8;
      if (!filterByModality(object)) dist += 16;
      if (!filterByLanguageScope(object)) dist += 32;
      return dist;
    };
    const getMatchGroup = (object: ObjectData): string => {
      if (!filterByLanguage(object)) return 'not ' + filterLabels.languageFilter;
      if (!filterByWritingSystem(object)) return 'not ' + filterLabels.writingSystemFilter;
      if (!filterByTerritory(object)) return 'not ' + filterLabels.territoryFilter;
      if (!filterByTerritoryScope(object)) return 'not ' + filterLabels.territoryScope;
      if (!filterByModality(object)) return 'not ' + filterLabels.modalityFilter;
      if (!filterByLanguageScope(object)) return 'not ' + filterLabels.languageScope;
      return 'matched';
    };
    return [getMatchDistance, getMatchGroup];
  }, [
    filterByLanguage,
    filterByWritingSystem,
    filterByTerritory,
    filterByTerritoryScope,
    filterByModality,
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

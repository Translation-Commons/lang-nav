import { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import { Suggestion, SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { getFilterLabels } from '../filtering/FilterLabels';
import useFilters from '../filtering/useFilters';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedObjectField from './HighlightedObjectField';

export default function useSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy, objectType } = usePageParams();
  const { censuses, territories, languagesInSelectedSource, locales, writingSystems, variantTags } =
    useDataContext();
  const filterBy = useFilters();
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
      if (!filterBy.Language?.(object)) dist += 1;
      if (!filterBy['Writing System']?.(object)) dist += 2;
      if (!filterBy.Territory?.(object)) dist += 4;
      if (!filterBy['Territory Scope']?.(object)) dist += 8;
      if (!filterBy.Modality?.(object)) dist += 16;
      if (!filterBy['Language Scope']?.(object)) dist += 32;
      return dist;
    };
    const getMatchGroup = (object: ObjectData): string => {
      if (!filterBy.Language?.(object)) return 'not ' + filterLabels.languageFilter;
      if (!filterBy['Writing System']?.(object)) return 'not ' + filterLabels.writingSystemFilter;
      if (!filterBy.Territory?.(object)) return 'not ' + filterLabels.territoryFilter;
      if (!filterBy['Territory Scope']?.(object)) return 'not ' + filterLabels.territoryScope;
      if (!filterBy.Modality?.(object)) return 'not ' + filterLabels.modalityFilter;
      if (!filterBy['Language Scope']?.(object)) return 'not ' + filterLabels.languageScope;
      return 'matched';
    };
    return [getMatchDistance, getMatchGroup];
  }, [
    filterBy.Language,
    filterBy['Writing System'],
    filterBy.Territory,
    filterBy['Territory Scope'],
    filterBy.Modality,
    filterBy['Language Scope'],
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

import { useCallback } from 'react';

import useEntities from '@features/data/context/useEntities';
import type { Suggestion } from '@features/params/Suggestion';
import { SUGGESTION_LIMIT } from '@features/params/Suggestion';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/EntityTypes';

import Field from '../fields/Field';
import { useFilterLabels } from '../filtering/FilterLabels';
import useFilters from '../filtering/useFilters';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedEntityField from './HighlightedEntityField';

export default function useSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy } = usePageParams();
  const pageEntities = useEntities();
  const filterBy = useFilters();
  const filterLabels = useFilterLabels();

  const getMatchGroup = useCallback(
    (ent: EntityData): string => {
      if (!filterBy[Field.LanguageFamily]?.(ent))
        return 'not ' + filterLabels[Field.LanguageFamily];
      if (!filterBy[Field.LanguageList]?.(ent)) return 'not ' + filterLabels[Field.LanguageList];
      if (!filterBy[Field.WritingSystem]?.(ent)) return 'not ' + filterLabels[Field.WritingSystem];
      if (!filterBy[Field.TerritoryList]?.(ent)) return 'not ' + filterLabels[Field.TerritoryList];
      if (!filterBy[Field.TerritoryScope]?.(ent))
        return 'not ' + filterLabels[Field.TerritoryScope];
      if (!filterBy[Field.Modality]?.(ent)) return 'not ' + filterLabels[Field.Modality];
      if (!filterBy[Field.LanguageScope]?.(ent)) return 'not ' + filterLabels[Field.LanguageScope];
      return 'matched';
    },
    [
      filterBy[Field.LanguageList],
      filterBy[Field.LanguageFamily],
      filterBy[Field.WritingSystem],
      filterBy[Field.TerritoryList],
      filterBy[Field.TerritoryScope],
      filterBy[Field.Modality],
      filterBy[Field.LanguageScope],
      filterLabels,
    ],
  );

  const getMatchDistance = useCallback(
    (ent: EntityData): number => {
      let dist = 0;
      if (!filterBy[Field.LanguageFamily]?.(ent)) dist += 1;
      if (!filterBy[Field.LanguageList]?.(ent)) dist += 2;
      if (!filterBy[Field.WritingSystem]?.(ent)) dist += 4;
      if (!filterBy[Field.TerritoryList]?.(ent)) dist += 8;
      if (!filterBy[Field.TerritoryScope]?.(ent)) dist += 16;
      if (!filterBy[Field.Modality]?.(ent)) dist += 32;
      if (!filterBy[Field.LanguageScope]?.(ent)) dist += 64;
      return dist;
    },
    [
      filterBy[Field.LanguageList],
      filterBy[Field.LanguageFamily],
      filterBy[Field.WritingSystem],
      filterBy[Field.TerritoryList],
      filterBy[Field.TerritoryScope],
      filterBy[Field.Modality],
      filterBy[Field.LanguageScope],
      filterLabels,
    ],
  );

  const getSuggestions = useCallback(
    async (query: string) => {
      const substringFilter = getSubstringFilterOnQuery(query, searchBy);
      return (pageEntities || [])
        .filter(substringFilter)
        .map((ent) => ({ ent, distance: getMatchDistance(ent) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, SUGGESTION_LIMIT)
        .map(({ ent }) => {
          const label = (
            <HighlightedEntityField
              ent={ent}
              field={searchBy}
              query={query}
              showOriginalName={true}
            />
          );
          const searchString = getSearchableField(ent, searchBy);
          return {
            entID: ent.ID,
            searchString,
            label,
            group: getMatchGroup(ent),
            ent,
          };
        });
    },
    [pageEntities, searchBy, getMatchDistance, getMatchGroup],
  );

  return getSuggestions;
}

import { useCallback, useMemo } from 'react';

import useEntities from '@features/data/context/useEntities';
import { Suggestion, SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import Field from '../fields/Field';
import { getFilterLabels } from '../filtering/FilterLabels';
import useFilters from '../filtering/useFilters';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedEntityField from './HighlightedEntityField';

export default function useSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy } = usePageParams();
  const pageEntities = useEntities();
  const filterBy = useFilters();
  const filterLabels = getFilterLabels();

  const [getMatchDistance, getMatchGroup] = useMemo(() => {
    const getMatchDistance = (ent: EntityData): number => {
      let dist = 0;
      if (!filterBy[Field.LanguageFamily]?.(ent)) dist += 1;
      if (!filterBy[Field.Language]?.(ent)) dist += 2;
      if (!filterBy[Field.WritingSystem]?.(ent)) dist += 4;
      if (!filterBy[Field.Territory]?.(ent)) dist += 8;
      if (!filterBy[Field.TerritoryScope]?.(ent)) dist += 16;
      if (!filterBy[Field.Modality]?.(ent)) dist += 32;
      if (!filterBy[Field.LanguageScope]?.(ent)) dist += 64;
      return dist;
    };
    const getMatchGroup = (ent: EntityData): string => {
      if (!filterBy[Field.LanguageFamily]?.(ent)) return 'not ' + filterLabels.languageFamilyFilter;
      if (!filterBy[Field.Language]?.(ent)) return 'not ' + filterLabels.languageFilter;
      if (!filterBy[Field.WritingSystem]?.(ent)) return 'not ' + filterLabels.writingSystemFilter;
      if (!filterBy[Field.Territory]?.(ent)) return 'not ' + filterLabels.territoryFilter;
      if (!filterBy[Field.TerritoryScope]?.(ent)) return 'not ' + filterLabels.territoryScope;
      if (!filterBy[Field.Modality]?.(ent)) return 'not ' + filterLabels.modalityFilter;
      if (!filterBy[Field.LanguageScope]?.(ent)) return 'not ' + filterLabels.languageScope;
      return 'matched';
    };
    return [getMatchDistance, getMatchGroup];
  }, [
    filterBy[Field.Language],
    filterBy[Field.LanguageFamily],
    filterBy[Field.WritingSystem],
    filterBy[Field.Territory],
    filterBy[Field.TerritoryScope],
    filterBy[Field.Modality],
    filterBy[Field.LanguageScope],
    filterLabels,
  ]);

  const getSuggestions = useCallback(
    async (query: string) => {
      const substringFilter = getSubstringFilterOnQuery(query, searchBy);
      return (pageEntities || [])
        .filter(substringFilter)
        .sort((a, b) => getMatchDistance(a) - getMatchDistance(b))
        .slice(0, SUGGESTION_LIMIT)
        .map((ent) => {
          const label = (
            <HighlightedEntityField
              ent={ent}
              field={searchBy}
              query={query}
              showOriginalName={true}
            />
          );
          const searchString = getSearchableField(ent, searchBy);
          return { entID: ent.ID, searchString, label, group: getMatchGroup(ent) };
        });
    },
    [pageEntities, searchBy, getMatchDistance, getMatchGroup],
  );

  return getSuggestions;
}

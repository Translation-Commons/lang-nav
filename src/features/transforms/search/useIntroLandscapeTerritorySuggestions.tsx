import { useCallback } from 'react';

import useEntities from '@features/data/context/useEntities';
import { EntityType } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { isTerritoryGroup } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedEntityField from './HighlightedEntityField';

const SUGGESTION_LIMIT = 8;

export default function useIntroLandscapeTerritorySuggestions(): (
  query: string,
) => Promise<Suggestion[]> {
  const { searchBy } = usePageParams();
  const territories = useEntities(EntityType.Territory);

  return useCallback(
    async (query: string) => {
      const toSuggestion = (ent: EntityData) => ({
        entID: ent.ID,
        searchString: getSearchableField(ent, searchBy),
        label: <HighlightedEntityField ent={ent} field={searchBy} query={query} showOriginalName />,
        ent,
      });
      const countries = territories.filter(
        (ent) => ent.type === EntityType.Territory && !isTerritoryGroup(ent.scope),
      );

      if (!query) {
        return [...countries].sort(sortByPopulation).slice(0, SUGGESTION_LIMIT).map(toSuggestion);
      }

      const matches = getSubstringFilterOnQuery(query, searchBy);
      return countries.filter(matches).slice(0, SUGGESTION_LIMIT).map(toSuggestion);
    },
    [territories, searchBy],
  );
}

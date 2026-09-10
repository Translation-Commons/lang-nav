import { useCallback } from 'react';

import useEntities from '@features/data/context/useEntities';
import { EntityType } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';

import { isTerritoryGroup } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedEntityField from './HighlightedEntityField';

const GROUP_LIMIT = 5;

export default function useIntroSearchSuggestions(): (query: string) => Promise<Suggestion[]> {
  const { searchBy } = usePageParams();
  const languages = useEntities(EntityType.Language);
  const territories = useEntities(EntityType.Territory);

  return useCallback(
    async (query: string) => {
      if (!query) return [];
      const matches = getSubstringFilterOnQuery(query, searchBy);
      const toSuggestion = (group: string) => (ent: EntityData) => ({
        entID: ent.ID,
        searchString: getSearchableField(ent, searchBy),
        label: <HighlightedEntityField ent={ent} field={searchBy} query={query} showOriginalName />,
        group,
        ent,
      });
      return [
        ...languages.filter(matches).slice(0, GROUP_LIMIT).map(toSuggestion('Languages')),
        ...territories
          .filter((ent) => ent.type === EntityType.Territory && !isTerritoryGroup(ent.scope))
          .filter(matches)
          .slice(0, GROUP_LIMIT)
          .map(toSuggestion('Countries')),
      ];
    },
    [languages, territories, searchBy],
  );
}

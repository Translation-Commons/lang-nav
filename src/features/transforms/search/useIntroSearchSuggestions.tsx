import { useCallback } from 'react';

import useEntities from '@features/data/context/useEntities';
import { EntityType } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageScope } from '@entities/language/LanguageTypes';
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
      const toSuggestion = (group: string) => (ent: EntityData) => ({
        entID: ent.ID,
        searchString: getSearchableField(ent, searchBy),
        label: <HighlightedEntityField ent={ent} field={searchBy} query={query} showOriginalName />,
        group,
        ent,
      });
      const countries = territories.filter(
        (ent) => ent.type === EntityType.Territory && !isTerritoryGroup(ent.scope),
      );

      // No query yet: show the biggest languages and countries instead of an empty list.
      if (!query) {
        const topLanguages = languages.filter(
          (ent) =>
            ent.type === EntityType.Language &&
            (ent.scope === LanguageScope.Language || ent.scope === LanguageScope.Macrolanguage),
        );
        return [
          ...[...topLanguages]
            .sort(sortByPopulation)
            .slice(0, GROUP_LIMIT)
            .map(toSuggestion('Languages')),
          ...[...countries]
            .sort(sortByPopulation)
            .slice(0, GROUP_LIMIT)
            .map(toSuggestion('Countries')),
        ];
      }

      const matches = getSubstringFilterOnQuery(query, searchBy);
      return [
        ...languages.filter(matches).slice(0, GROUP_LIMIT).map(toSuggestion('Languages')),
        ...countries.filter(matches).slice(0, GROUP_LIMIT).map(toSuggestion('Countries')),
      ];
    },
    [languages, territories, searchBy],
  );
}

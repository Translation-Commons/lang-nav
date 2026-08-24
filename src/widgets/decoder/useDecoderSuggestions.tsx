import { useCallback } from 'react';

import useEntities from '@features/data/context/useEntities';
import { EntityType, SearchableField } from '@features/params/PageParamTypes';
import { SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';

import { LanguageData } from '@entities/language/LanguageTypes';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

type GetDecoderSuggestions = (query: string) => Promise<LanguageData[]>;

/**
 * Instead of the full filter for `useSearchSuggestions` this is limited to the decoder-specific fields.
 * Additionally, instead of limiting strictly by the search query, it will just prioritize by it.
 */
const useDecoderSuggestions = (): GetDecoderSuggestions => {
  const searchBy = SearchableField.CodeOrNameAny;
  const pageObjects = useEntities(EntityType.Language) as LanguageData[];
  const filterBy = useFilters();

  const getMatchDistance = useCallback(
    // presuming query is already lowercased and trimmed
    (query: string, ent: LanguageData): number => {
      let dist = 0; // Low is good

      // Check if the query makes the object name fully or partially matches
      if (ent.nameDisplay.toLowerCase() !== query) {
        dist += anyWordStartsWith(ent.nameDisplay, query) ? 1 : 2;

        // Check if any of the other names fully or partially match
        if (!ent.names.some((n) => n.toLowerCase() === query))
          dist += ent.names.some((n) => anyWordStartsWith(n, query)) ? 2 : 10;

        // Check if the language code partially or fully matches the query
        if (ent.codeDisplay !== query) dist += ent.codeDisplay.startsWith(query) ? 1 : 5;
      }

      // Check if the language is known to be found in the territory
      if (!filterBy[Field.Territory]?.(ent)) dist += 10;

      // Check if the language is at the right scope level
      if (!filterBy[Field.LanguageScope]?.(ent)) dist += 4;

      return dist - Math.log(ent.pop.overall || 1) / 10; // Include a small population tiebreaker
    },
    [filterBy[Field.Territory], filterBy[Field.LanguageScope]],
  );

  const getSuggestions = useCallback(
    async (query: string) => {
      const queryLower = query.toLowerCase().trim();
      const substringFilter = getSubstringFilterOnQuery(queryLower, searchBy);
      return (pageObjects || [])
        .filter(substringFilter) // Require at least any name to match
        .sort((a, b) => getMatchDistance(queryLower, a) - getMatchDistance(queryLower, b))
        .slice(0, SUGGESTION_LIMIT);
    },
    [pageObjects, searchBy, getMatchDistance],
  );

  return getSuggestions;
};

export default useDecoderSuggestions;

import { SearchableField } from '@features/params/PageParamTypes';
import { Suggestion, SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';

import { EntityData } from '@entities/types/DataTypes';

import getSubstringFilterOnQuery from '../search/getSubstringFilterOnQuery';
import HighlightedEntityField from '../search/HighlightedEntityField';

export function getSuggestionsFunction<T extends EntityData>(
  ents: T[],
  getMatchDistance: (ent: T) => number,
  getMatchGroup: (ent: T) => string,
): (query: string) => Promise<Suggestion[]> {
  return async (query: string): Promise<Suggestion[]> => {
    const trimmedQuery = query.split('[')[0].trim();
    const filterFunction = getSubstringFilterOnQuery(trimmedQuery, SearchableField.CodeOrNameAny);
    return ents
      .filter(filterFunction)
      .sort((a, b) => getMatchDistance(a) - getMatchDistance(b))
      .slice(0, SUGGESTION_LIMIT)
      .map((ent) => {
        const label = (
          <HighlightedEntityField
            ent={ent}
            field={SearchableField.CodeOrNameAny}
            query={trimmedQuery}
            showOriginalName={true}
          />
        );
        const searchString = ent.nameDisplay + ' [' + ent.ID + ']';
        return {
          entID: ent.ID,
          searchString,
          label,
          group: getMatchGroup(ent),
        };
      });
  };
}

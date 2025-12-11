import { SearchableField } from '@features/params/PageParamTypes';
import { Suggestion, SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';

import { ObjectData } from '@entities/types/DataTypes';

import getSubstringFilterOnQuery from '../search/getSubstringFilterOnQuery';
import HighlightedObjectField from '../search/HighlightedObjectField';

export function getSuggestionsFunction<T extends ObjectData>(
  objects: T[],
  getMatchDistance: (object: T) => number,
  getMatchGroup: (object: T) => string,
): (query: string) => Promise<Suggestion[]> {
  return async (query: string): Promise<Suggestion[]> => {
    const trimmedQuery = query.split('[')[0].trim();
    const filterFunction = getSubstringFilterOnQuery(trimmedQuery, SearchableField.CodeOrNameAny);
    return objects
      .filter(filterFunction)
      .sort((a, b) => getMatchDistance(a) - getMatchDistance(b))
      .slice(0, SUGGESTION_LIMIT)
      .map((object) => {
        const label = (
          <HighlightedObjectField
            object={object}
            field={SearchableField.CodeOrNameAny}
            query={trimmedQuery}
            showOriginalName={true}
          />
        );
        const searchString = object.nameDisplay + ' [' + object.ID + ']';
        return {
          objectID: object.ID,
          searchString,
          label,
          group: getMatchGroup(object),
        };
      });
  };
}

import { SearchableField } from '@features/params/PageParamTypes';
import type { Suggestion } from '@features/params/Suggestion';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { EntityData } from '@entities/types/EntityTypes';

import getSearchableField from './getSearchableField';
import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';
import HighlightedEntityField from './HighlightedEntityField';

// With no query yet, show the most populous entities instead of an empty list.
export function getTopMatches<T extends EntityData>(
  ents: T[],
  query: string,
  searchBy: SearchableField,
  limit: number,
): T[] {
  if (!query) return [...ents].sort(sortByPopulation).slice(0, limit);
  return ents.filter(getSubstringFilterOnQuery(query, searchBy)).slice(0, limit);
}

export function toIntroSuggestion(
  ent: EntityData,
  query: string,
  searchBy: SearchableField,
  group?: string,
): Suggestion {
  return {
    entID: ent.ID,
    searchString: getSearchableField(ent, searchBy),
    label: <HighlightedEntityField ent={ent} field={searchBy} query={query} showOriginalName />,
    group,
    ent,
  };
}

import { SearchableField } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import Field from '@features/transforms/fields/Field';
import {
  buildFilterByLanguage,
  buildFilterByLanguageFamily,
  buildFilterByTerritory,
  buildFilterByWritingSystem,
} from '@features/transforms/filtering/filterByConnections';
import {
  buildFilterByISOStatus,
  buildFilterByLanguageScope,
  buildFilterByLanguageSource,
  buildFilterByModality,
  buildFilterByTerritoryScope,
} from '@features/transforms/filtering/filterByEnum';
import { buildFilterByPopulation } from '@features/transforms/filtering/filterByRange';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';
import { getSortFunctionParameterized } from '@features/transforms/sorting/sort';

import { LanguageSource } from '@entities/language/LanguageTypes';
import type { EntityData } from '@entities/types/EntityTypes';

import type { Query } from '../query/QueryTypes';

type Filter = (ent: EntityData) => boolean;

/** The filters useFilteredEntities combines, built from a Query instead of page params. */
function buildCurrentFilters(query: Query): Filter[] {
  const filters = query.filters ?? {};
  const defaults = getDefaultParams();
  const searchString = query.search?.query ?? '';
  const searchBy = (query.search?.by ?? SearchableField.CodeOrNameAny) as SearchableField;
  return [
    searchString === '' ? () => true : getSubstringFilterOnQuery(searchString, searchBy),
    buildFilterByTerritory(filters.territory ?? ''),
    buildFilterByWritingSystem(filters.writingSystem ?? ''),
    buildFilterByLanguage(filters.language ?? ''),
    buildFilterByLanguageFamily(filters.languageFamily ?? ''),
    buildFilterByTerritoryScope(filters.territoryScopes ?? []),
    buildFilterByLanguageScope(filters.languageScopes ?? []),
    buildFilterByModality(filters.modalities ?? []),
    buildFilterByISOStatus(filters.isoStatuses ?? []),
    buildFilterByPopulation(
      filters.populationMin ?? defaults.populationMin,
      filters.populationMax ?? defaults.populationMax,
    ),
    buildFilterByLanguageSource(
      (filters.languageSource ?? LanguageSource.Combined) as LanguageSource,
    ),
  ];
}

/** Same slicing as usePagination. */
function paginate<T>(arr: T[], page: Query['page']): T[] {
  if (!page || page.limit < 1 || arr.length < page.limit) return arr;
  if (arr.length <= page.limit * (page.page - 1)) return arr.slice(0, page.limit);
  return arr.slice(page.limit * (page.page - 1), page.limit * page.page);
}

/** Filtering, pinning, and sorting exactly as useFilteredEntities does, then pagination. */
export function runCurrentQuery(ents: EntityData[], query: Query): EntityData[] {
  const filters = buildCurrentFilters(query);
  const pinned = query.pinned ?? [];
  const sort = query.sort;
  const sortFunction = getSortFunctionParameterized(
    sort?.field ?? Field.None,
    sort?.behavior,
    sort?.secondary,
    sort?.secondaryBehavior,
  );
  const filtered = ents
    .filter((ent) => pinned.includes(ent.ID) || filters.every((filter) => filter(ent)))
    .sort((a, b) => {
      const aIndex = pinned.indexOf(a.ID);
      const bIndex = pinned.indexOf(b.ID);
      const aPinned = aIndex !== -1;
      const bPinned = bIndex !== -1;
      if (aPinned && bPinned) return aIndex - bIndex;
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      return sortFunction(a, b);
    });
  return paginate(filtered, query.page);
}

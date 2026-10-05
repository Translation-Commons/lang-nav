import { useCallback } from 'react';

import { Query } from '@features/data/api/core/defineEndpoint';
import { getPageSlice } from '@features/pagination/usePagination';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { EntityData } from '@entities/types/EntityTypes';

import { BaseRow, TablePage } from './tableContract';

/**
 * Files implementation of a table endpoint. Filters and sort come from the page params
 * (the query mirrors them); page and limit come from the query, so `fetch` can ask for all rows.
 */
export function useTablePageFromFiles<T extends EntityData, R extends BaseRow>(
  ents: T[],
  toRow: (ent: T) => R,
): (query: Query) => TablePage<R> {
  const { filteredEntities } = useFilteredEntities({ inputEnts: ents });
  return useCallback(
    (query) => ({
      total: ents.length,
      count: filteredEntities.length,
      rows: getPageSlice(filteredEntities, Number(query.page), Number(query.limit)).map(toRow),
    }),
    [ents, filteredEntities, toRow],
  );
}

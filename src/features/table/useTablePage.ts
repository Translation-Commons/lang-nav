import { useEffect, useMemo, useState } from 'react';

import { apiGet, DataSource, getDataSource } from '@features/data/api/apiClient';
import { useApiAvailable } from '@features/data/api/useDataSource';
import usePagination from '@features/pagination/usePagination';
import { buildNextURLSearchParams } from '@features/params/getNewURLSearchParams';
import { PageParamKey, PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { EntityData } from '@entities/types/EntityTypes';

/** One page of rows, shaped like the entity type the table's columns already read. */
export type TablePageResponse<T> = { total: number; results: T[] };

type TablePageStatus = 'ready' | 'loading' | 'error';

type TablePage<T> = {
  isApi: boolean;
  currentEntities: T[];
  filteredEntities: T[]; // In API mode only the current page is known.
  totalCount?: number; // Set in API mode, where the client cannot count the filtered rows.
  status: TablePageStatus;
};

const NO_ENTS: EntityData[] = []; // Stable reference so the skipped client pass stays memoized.

/** Sends resolved values (defaults applied) so the backend need not re-derive profile defaults. */
export function toApiQuery(params: PageParams): string {
  const picked = Object.fromEntries(
    Object.values(PageParamKey)
      .filter((key) => key !== PageParamKey.columns)
      .map((key) => [key, params[key as keyof PageParams]])
      .filter(([, value]) => value != null),
  ) as Partial<PageParams>;
  const query = buildNextURLSearchParams(picked, new URLSearchParams());
  query.sort(); // Stable order, so equal queries are equal strings (and cache keys).
  return query.toString();
}

/** The rows for the current table page: filtered, sorted and sliced locally, or fetched from the API. */
function useTablePage<T extends EntityData>(ents: T[], apiPath?: string): TablePage<T> {
  const params = usePageParams();
  const wantsApi =
    apiPath != null && params.paramsLevel === 'global' && getDataSource() === DataSource.API;
  const apiAvailable = useApiAvailable(wantsApi);
  // Treated as API while the health check runs, so the table does not flash local rows first.
  const isApi = wantsApi && apiAvailable !== false;
  const canFetch = wantsApi && apiAvailable === true;

  // In API mode the server filters, sorts and pages, so the client pass runs on nothing.
  const { getCurrentEntities } = usePagination<T>();
  const { filteredEntities } = useFilteredEntities({ inputEnts: isApi ? (NO_ENTS as T[]) : ents });

  const query = useMemo(() => (isApi ? toApiQuery(params) : ''), [isApi, params]);
  const [page, setPage] = useState<{ rows: T[]; total?: number; status: TablePageStatus }>({
    rows: [],
    status: 'loading',
  });

  useEffect(() => {
    if (!canFetch || apiPath == null) return;
    const controller = new AbortController();
    // Keep the previous rows on screen while the next page loads.
    setPage((prev) => ({ ...prev, status: 'loading' }));
    apiGet<TablePageResponse<T>>(apiPath, query, controller.signal)
      .then(({ results, total }) => {
        // A response in another contract shows the error state instead of crashing the table.
        if (!Array.isArray(results) || typeof total !== 'number') {
          throw new Error(`Unexpected response shape from ${apiPath}`);
        }
        if (!controller.signal.aborted) setPage({ rows: results, total, status: 'ready' });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Error loading table page:', err);
        setPage((prev) => ({ ...prev, status: 'error' }));
      });
    return () => controller.abort();
  }, [canFetch, apiPath, query]);

  if (!isApi) {
    return {
      isApi,
      currentEntities: getCurrentEntities(filteredEntities),
      filteredEntities,
      status: 'ready',
    };
  }
  return {
    isApi,
    currentEntities: page.rows,
    filteredEntities: page.rows,
    totalCount: page.total ?? 0,
    status: page.status,
  };
}

export default useTablePage;

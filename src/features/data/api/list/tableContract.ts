import { PageParams } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

/** A related entity, embedded so a row renders without the graph. */
export type EntityRef = { id: string; name: string };

/** Fields every table row carries, for the shared Pin/Code/Name/Endonym columns. */
export type BaseRow = { id: string; code: string; name: string; endonym?: string };

/** What every table endpoint returns: counts for the meter, and the requested page of rows. */
export type TablePage<R extends BaseRow> = {
  /** Rows before any filter. */
  total: number;
  /** Rows after filters (pinned rows included), across all pages. */
  count: number;
  rows: R[];
};

/** Page params every table endpoint honors; entity endpoints add their own filters. */
export function toBasePageQuery(params: PageParams): Record<string, string> {
  const query: Record<string, string> = {
    languageSource: params.languageSource,
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy,
    sortBehavior: String(params.sortBehavior),
    searchBy: params.searchBy,
    searchString: params.searchString,
    pinned: params.pinned.join(','),
    populationMin: String(params.populationMin),
    populationMax: String(params.populationMax),
    languageFilter: params.languageFilter,
    languageFamilyFilter: params.languageFamilyFilter,
    territoryFilter: params.territoryFilter,
    writingSystemFilter: params.writingSystemFilter,
    orgFilter: params.orgFilter,
  };
  if (params.secondarySortBy !== Field.None) {
    query.secondarySortBy = params.secondarySortBy;
    query.secondarySortBehavior = String(params.secondarySortBehavior);
  }
  return query;
}

/** Query for every filtered row, e.g. for an export. `limit < 1` means no limit. */
export function allRowsQuery<Q extends Record<string, string>>(query: Q): Q {
  return { ...query, page: '1', limit: '-1' };
}

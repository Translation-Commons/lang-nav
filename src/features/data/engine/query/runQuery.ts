import Field from '@features/transforms/fields/Field';

import Bitset from '../bitset/Bitset';
import type { TypeIndexes } from '../indexes/buildTypeIndexes';
import { computeSortOrder, resolveSort, type SortKey, type SortSpec } from '../indexes/sortOrder';
import { type EntityStore, getActiveIndexes, getTable, type TypeTable } from '../store/EntityStore';

import { planQuery, type QueryPlan } from './planQuery';
import type { PlanStep, Query, QueryResult } from './QueryTypes';
import { getQueryCacheKey, ResultCache } from './ResultCache';

/** Intersects index steps smallest first, then runs residual predicates on what is left. */
function executePlan(table: TypeTable, indexes: TypeIndexes, plan: QueryPlan) {
  const steps: PlanStep[] = [];
  const counted = plan.index
    .map((step) => ({ step, count: step.rows.count() }))
    .sort((a, b) => a.count - b.count);
  const matches = indexes.universe.clone();
  for (const { step, count } of counted) {
    steps.push({ name: step.name, kind: 'index', count });
    if (!matches.isEmpty()) matches.and(step.rows);
  }
  for (const step of plan.residual) {
    const failing: number[] = [];
    matches.forEach((row) => {
      if (!step.test(table.entities[row])) failing.push(row);
    });
    failing.forEach((row) => matches.remove(row));
    steps.push({ name: step.name, kind: 'residual', count: failing.length });
  }
  return { matches, steps };
}

/** Pinned entities come first in pinned order, even when filtered out; unknown IDs are ignored. */
function resolvePinned(table: TypeTable, pinned: string[] | undefined): number[] {
  const rows: number[] = [];
  for (const id of pinned ?? []) {
    const row = table.rowById.get(id);
    if (row != null && row < table.queryable && !rows.includes(row)) rows.push(row);
  }
  return rows;
}

function getSortKeys(indexes: TypeIndexes, field: Field | null): SortKey[] | null {
  if (field == null || field === Field.None) return null;
  const keys = indexes.sortKeys[field];
  if (!keys) throw new Error(`Sort keys for "${field}" were not compiled into the snapshot`);
  return keys;
}

export function getSortOrder(
  store: EntityStore,
  table: TypeTable,
  indexes: TypeIndexes,
  sort: SortSpec | undefined,
): Uint32Array {
  const resolved = resolveSort(sort, store.meta.sortDirections);
  const cached = indexes.orders.get(resolved.key);
  if (cached) return cached;
  const order = computeSortOrder(
    table.queryable,
    getSortKeys(indexes, resolved.primary),
    resolved.direction,
    getSortKeys(indexes, resolved.secondary),
    resolved.secondaryDirection,
  );
  indexes.orders.set(resolved.key, order);
  return order;
}

/** Forgets sort orders computed at runtime, keeping the precomputed ones (for cold timings). */
export function clearComputedSortOrders(store: EntityStore): void {
  for (const indexes of store.indexes ?? []) {
    for (const key of indexes.orders.keys()) {
      if (!indexes.precomputedOrderKeys.has(key)) indexes.orders.delete(key);
    }
  }
}

export function isSortPrecomputed(store: EntityStore, query: Query): boolean {
  const key = resolveSort(query.sort, store.meta.sortDirections).key;
  return getActiveIndexes(store, query.type).precomputedOrderKeys.has(key);
}

function orderRows(order: Uint32Array, matches: Bitset, pinned: number[]): Uint32Array {
  const pinnedSet = Bitset.fromRows(matches.size, pinned);
  const out = pinned.slice();
  for (let i = 0; i < order.length; i++) {
    const row = order[i];
    if (matches.has(row) && !pinnedSet.has(row)) out.push(row);
  }
  return Uint32Array.from(out);
}

/** Same slicing as usePagination, including returning the first page when past the end. */
function paginate(rows: Uint32Array, page: Query['page']): Uint32Array {
  if (!page || page.limit < 1 || rows.length < page.limit) return rows;
  if (rows.length <= page.limit * (page.page - 1)) return rows.subarray(0, page.limit);
  return rows.subarray(page.limit * (page.page - 1), page.limit * page.page);
}

export function executeQuery(store: EntityStore, query: Query): QueryResult {
  const table = getTable(store, query.type);
  const indexes = getActiveIndexes(store, query.type);
  const { matches, steps } = executePlan(table, indexes, planQuery(store, query));
  const ordered = orderRows(
    getSortOrder(store, table, indexes, query.sort),
    matches,
    resolvePinned(table, query.pinned),
  );
  const rows = paginate(ordered, query.page);
  const entities = Array.from(rows, (row) => table.entities[row]);
  return {
    total: ordered.length,
    rows,
    entities,
    ids: entities.map((ent) => ent.ID),
    plan: steps,
    version: store.version,
  };
}

export type QueryEngine = {
  run: (query: Query, options?: { useCache?: boolean }) => QueryResult;
  cache: ResultCache;
};

export function createQueryEngine(store: EntityStore, cacheSize = 64): QueryEngine {
  const cache = new ResultCache(cacheSize);
  return {
    cache,
    run(query, { useCache = true } = {}) {
      if (!useCache) return executeQuery(store, query);
      const key = getQueryCacheKey(query, store.version);
      const hit = cache.get(key);
      if (hit) return hit;
      const result = executeQuery(store, query);
      cache.set(key, result);
      return result;
    },
  };
}

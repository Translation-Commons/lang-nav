import type { LanguageSource } from '@entities/language/LanguageTypes';
import type { EntityData } from '@entities/types/EntityTypes';

import Bitset from '../bitset/Bitset';
import type { TypeIndexes } from '../indexes/buildTypeIndexes';
import { matchEnum } from '../indexes/EnumIndex';
import { rangeRows } from '../indexes/RangeIndex';
import { matchPrefix } from '../indexes/StringIndex';
import { normalizeForSearch } from '../search/normalizeSearch';
import { ConnectionKind, EnumKind, type EnumValue } from '../snapshot/SnapshotTypes';
import { type EntityStore, getActiveIndexes } from '../store/EntityStore';

import { resolveConnectionFilter } from './connectionFilter';
import type { Query } from './QueryTypes';
import { getIndexedSearchColumns, matchesSearch, SEARCH_MODE } from './searchModes';

const COMBINED_SOURCE: `${LanguageSource.Combined}` = 'Combined';

export type IndexStep = { name: string; rows: Bitset };
export type ResidualStep = { name: string; test: (ent: EntityData) => boolean };
export type QueryPlan = { index: IndexStep[]; residual: ResidualStep[] };

function planSearch(query: Query, indexes: TypeIndexes, plan: QueryPlan): void {
  const text = query.search?.query ?? '';
  if (text === '') return; // getFilterBySubstring skips an empty search string
  const mode = query.search?.by ?? SEARCH_MODE.CodeOrNameAny;
  const columns = getIndexedSearchColumns(mode);
  const normalized = normalizeForSearch(text);
  if (columns == null || normalized === '') {
    plan.residual.push({ name: `search:${mode}`, test: (ent) => matchesSearch(ent, text, mode) });
    return;
  }
  const rows = new Bitset(indexes.size);
  for (const column of columns)
    rows.or(matchPrefix(indexes.search[column], normalized, indexes.size));
  plan.index.push({ name: `search:${mode}`, rows });
}

function planEnum(
  plan: QueryPlan,
  indexes: TypeIndexes,
  kind: EnumKind,
  values: readonly EnumValue[] | undefined,
): void {
  if (!values?.length) return;
  plan.index.push({ name: `enum:${kind}`, rows: matchEnum(indexes.enums[kind], values) });
}

/** Mirrors buildFilterByPopulation, with the defaults recorded at compile time. */
function planPopulation(store: EntityStore, query: Query, indexes: TypeIndexes, plan: QueryPlan) {
  const defaults = store.meta.populationDefaults;
  const min = query.filters?.populationMin ?? defaults.min;
  const max = query.filters?.populationMax ?? defaults.max;
  if (min === defaults.min && max >= defaults.max) return;
  const upper = max < 0 || max >= defaults.max ? Number.MAX_SAFE_INTEGER : max;
  plan.index.push({
    name: 'range:population',
    rows: rangeRows(indexes.population, min, upper, indexes.size),
  });
}

function planConnections(store: EntityStore, query: Query, plan: QueryPlan): void {
  const filters = query.filters ?? {};
  const values: [ConnectionKind, string | undefined][] = [
    [ConnectionKind.Territory, filters.territory],
    [ConnectionKind.WritingSystem, filters.writingSystem],
    [ConnectionKind.Language, filters.language],
    [ConnectionKind.LanguageFamily, filters.languageFamily],
  ];
  for (const [kind, value] of values) {
    const rows = resolveConnectionFilter(store, query.type, kind, value);
    if (rows) plan.index.push({ name: `connection:${kind}`, rows });
  }
}

export function planQuery(store: EntityStore, query: Query): QueryPlan {
  const indexes = getActiveIndexes(store, query.type);
  const filters = query.filters ?? {};
  const plan: QueryPlan = { index: [], residual: [] };
  planSearch(query, indexes, plan);
  planConnections(store, query, plan);
  planEnum(plan, indexes, EnumKind.TerritoryScope, filters.territoryScopes);
  planEnum(plan, indexes, EnumKind.LanguageScope, filters.languageScopes);
  planEnum(plan, indexes, EnumKind.Modality, filters.modalities);
  planEnum(plan, indexes, EnumKind.ISOStatus, filters.isoStatuses);
  planPopulation(store, query, indexes, plan);
  const source = filters.languageSource;
  if (source && source !== COMBINED_SOURCE)
    planEnum(plan, indexes, EnumKind.LanguageSource, [source]);
  return plan;
}

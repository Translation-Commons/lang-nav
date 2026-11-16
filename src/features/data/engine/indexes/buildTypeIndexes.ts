import Bitset from '../bitset/Bitset';
import { decodeColumn } from '../snapshot/snapshotCodec';
import {
  ConnectionKind,
  type DerivedTypeJson,
  EnumKind,
  SearchColumn,
} from '../snapshot/SnapshotTypes';

import { type EnumIndex, enumIndexFromJson } from './EnumIndex';
import { type Csr, csrFromJson } from './Postings';
import { buildRangeIndex, type RangeIndex } from './RangeIndex';
import type { SortKey } from './sortOrder';
import { type StringIndex, stringIndexFromJson } from './StringIndex';

export type TypeIndexes = {
  size: number;
  universe: Bitset;
  codes: (string | null)[];
  codeRows: Map<string, number[]>;
  search: Record<SearchColumn, StringIndex>;
  /** Keyed by row of the target type, lists rows of this type connected to it. */
  connections: Partial<Record<ConnectionKind, Csr>>;
  enums: Record<EnumKind, EnumIndex>;
  population: RangeIndex;
  sortKeys: Record<string, SortKey[]>;
  orders: Map<string, Uint32Array>;
  /** Orders shipped in the snapshot; others are computed on first use and cached in `orders`. */
  precomputedOrderKeys: Set<string>;
};

function groupRowsByCode(codes: (string | null)[]): Map<string, number[]> {
  const out = new Map<string, number[]>();
  codes.forEach((code, row) => {
    if (code == null) return;
    const rows = out.get(code);
    if (rows) rows.push(row);
    else out.set(code, [row]);
  });
  return out;
}

function mapValues<K extends string, A, B>(obj: Record<K, A>, fn: (value: A) => B): Record<K, B> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value as A)]),
  ) as Record<K, B>;
}

export function buildTypeIndexes(
  derived: DerivedTypeJson,
  size: number,
  queryable: number,
): TypeIndexes {
  const connections: Partial<Record<ConnectionKind, Csr>> = {};
  for (const kind of Object.values(ConnectionKind)) {
    const json = derived.connections[kind];
    if (json) connections[kind] = csrFromJson(json);
  }
  // Missing population is treated as -1, like buildFilterByPopulation
  const population = buildRangeIndex(decodeColumn<unknown>(derived.population.slice()), -1);
  return {
    size,
    universe: Bitset.range(size, queryable),
    codes: derived.codes,
    codeRows: groupRowsByCode(derived.codes),
    search: mapValues(derived.search, stringIndexFromJson),
    connections,
    enums: mapValues(derived.enums, (json) => enumIndexFromJson(json, size)),
    population,
    sortKeys: mapValues(derived.sortKeys, (column) => decodeColumn<SortKey>(column.slice())),
    orders: new Map(
      Object.entries(derived.orders).map(([key, rows]) => [key, Uint32Array.from(rows)]),
    ),
    precomputedOrderKeys: new Set(Object.keys(derived.orders)),
  };
}

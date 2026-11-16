import Field from '@features/transforms/fields/Field';
import getField from '@features/transforms/fields/getField';
import { getNormalSortDirection } from '@features/transforms/sorting/sort';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { computeSortOrder, resolveSort, type SortKey, type SortSpec } from '../indexes/sortOrder';
import { encodeNumber } from '../snapshot/snapshotCodec';

import type { RowTable } from './rowTables';

/** Fields with precomputed sort keys. Sorting by any other field is rejected by the engine. */
export const COMPILED_SORT_FIELDS: Field[] = [
  Field.Name,
  Field.Code,
  Field.Endonym,
  Field.Population,
  Field.PopulationSpeaking,
  Field.PopulationWriting,
  Field.PopulationOfDescendants,
  Field.CountOfCountries,
  Field.CountOfLanguages,
  Field.CountOfWritingSystems,
  Field.LanguageScope,
  Field.TerritoryScope,
  Field.ISOStatus,
  Field.Depth,
];

/** Orders shipped in the snapshot so the default views never sort at runtime. */
const PRECOMPUTED_ORDERS: SortSpec[] = [
  { field: Field.Population, behavior: SortBehavior.Normal },
  { field: Field.Name, behavior: SortBehavior.Normal },
];

export function getSortDirections(): Record<string, number> {
  return Object.fromEntries(
    COMPILED_SORT_FIELDS.map((field) => [field, getNormalSortDirection(field)]),
  );
}

function encodeSortKey(value: SortKey): unknown {
  return typeof value === 'number' ? encodeNumber(value) : (value ?? null);
}

export function deriveSortKeys(table: RowTable): {
  sortKeys: Record<string, unknown[]>;
  orders: Record<string, number[]>;
} {
  const raw: Record<string, SortKey[]> = {};
  for (const field of COMPILED_SORT_FIELDS) {
    raw[field] = Array.from({ length: table.queryable }, (_, row) =>
      getField(table.entities[row], field),
    );
  }
  const directions = getSortDirections();
  const orders: Record<string, number[]> = {};
  for (const spec of PRECOMPUTED_ORDERS) {
    const resolved = resolveSort(spec, directions);
    const order = computeSortOrder(
      table.queryable,
      raw[resolved.primary],
      resolved.direction,
      resolved.secondary ? raw[resolved.secondary] : null,
      resolved.secondaryDirection,
    );
    orders[resolved.key] = Array.from(order);
  }
  const sortKeys = Object.fromEntries(
    Object.entries(raw).map(([field, keys]) => [field, keys.map(encodeSortKey)]),
  );
  return { sortKeys, orders };
}

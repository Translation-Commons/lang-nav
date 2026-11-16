import Bitset from '../bitset/Bitset';
import type { EnumIndexJson, EnumValue } from '../snapshot/SnapshotTypes';

/** `pass` holds rows the filter never excludes (eg. entities without a language). */
export type EnumIndex = { pass: Bitset; values: Map<string, Bitset> };

// Keeps 3 and '3' apart, matching the strict equality of Array.includes in the current filters
export function enumTag(value: EnumValue): string {
  return `${typeof value}:${value}`;
}

export function buildEnumIndexJson(
  valuesByRow: readonly (readonly EnumValue[] | 'pass')[],
): EnumIndexJson {
  const pass: number[] = [];
  const byTag = new Map<string, [EnumValue, number[]]>();
  valuesByRow.forEach((values, row) => {
    if (values === 'pass') {
      pass.push(row);
      return;
    }
    for (const value of values) {
      const tag = enumTag(value);
      const entry = byTag.get(tag) ?? [value, []];
      byTag.set(tag, entry);
      if (entry[1][entry[1].length - 1] !== row) entry[1].push(row);
    }
  });
  return { pass, values: [...byTag.values()] };
}

export function enumIndexFromJson(json: EnumIndexJson, size: number): EnumIndex {
  const values = new Map<string, Bitset>();
  for (const [value, rows] of json.values) values.set(enumTag(value), Bitset.fromRows(size, rows));
  return { pass: Bitset.fromRows(size, json.pass), values };
}

export function matchEnum(index: EnumIndex, wanted: readonly EnumValue[]): Bitset {
  const out = index.pass.clone();
  for (const value of wanted) {
    const rows = index.values.get(enumTag(value));
    if (rows) out.or(rows);
  }
  return out;
}

import Bitset from '../bitset/Bitset';

/** Rows sorted by value, for inclusive range lookups. NaN never satisfies a range, so it is left out. */
export type RangeIndex = { values: Float64Array; rows: Uint32Array };

export function buildRangeIndex(values: readonly unknown[], missingValue: number): RangeIndex {
  const rows: number[] = [];
  const valueOf = new Float64Array(values.length);
  values.forEach((raw, row) => {
    const value = typeof raw === 'number' ? raw : missingValue;
    if (Number.isNaN(value)) return;
    valueOf[row] = value;
    rows.push(row);
  });
  rows.sort((a, b) => valueOf[a] - valueOf[b] || a - b);
  return { values: Float64Array.from(rows, (row) => valueOf[row]), rows: Uint32Array.from(rows) };
}

function firstIndexWhere(values: Float64Array, test: (value: number) => boolean): number {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (test(values[mid])) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

export function rangeRows(index: RangeIndex, min: number, max: number, size: number): Bitset {
  const out = new Bitset(size);
  const start = firstIndexWhere(index.values, (value) => value >= min);
  const end = firstIndexWhere(index.values, (value) => value > max);
  for (let i = start; i < end; i++) out.add(index.rows[i]);
  return out;
}

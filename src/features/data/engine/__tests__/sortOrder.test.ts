import { describe, expect, it } from 'vitest';

import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { computeSortOrder, resolveSort, type SortKey } from '../indexes/sortOrder';

const DIRECTIONS = { [Field.Name]: 1, [Field.Population]: -1, [Field.CountOfCountries]: -1 };

function order(
  primary: SortKey[] | null,
  direction: number,
  secondary?: SortKey[],
  secondaryDirection = 1,
) {
  const count = primary?.length ?? secondary?.length ?? 0;
  return Array.from(
    computeSortOrder(count, primary, direction, secondary ?? null, secondaryDirection),
  );
}

describe('computeSortOrder', () => {
  it('puts missing values last in both directions', () => {
    const keys = [5, null, 9, undefined, 1];
    expect(order(keys, 1)).toEqual([4, 0, 2, 1, 3]);
    expect(order(keys, -1)).toEqual([2, 0, 4, 1, 3]);
  });

  it('breaks ties by the secondary key, then by row', () => {
    const primary = [1, 1, 2, 1];
    const secondary = ['b', 'a', 'z', 'a'];
    expect(order(primary, -1, secondary, 1)).toEqual([2, 1, 3, 0]);
  });

  it('orders rows missing the primary key by the secondary key', () => {
    const primary = [null, 3, null, null];
    const secondary = ['c', 'x', null, 'a'];
    expect(order(primary, 1, secondary, 1)).toEqual([1, 3, 0, 2]);
  });

  it('keeps input order for full ties, like a stable sort', () => {
    expect(order(['x', 'x', 'x'], -1)).toEqual([0, 1, 2]);
    expect(order(null, 1)).toEqual([]);
  });

  it('compares strings by code unit like the current comparator', () => {
    expect(order(['b', 'B', 'a', 'é'], 1)).toEqual([1, 2, 0, 3]);
  });
});

describe('resolveSort', () => {
  it('applies the normal direction and the behavior', () => {
    expect(resolveSort({ field: Field.Population }, DIRECTIONS).direction).toBe(-1);
    expect(
      resolveSort({ field: Field.Population, behavior: SortBehavior.Reverse }, DIRECTIONS)
        .direction,
    ).toBe(1);
  });

  it('ignores a secondary sort equal to the primary or None', () => {
    expect(
      resolveSort({ field: Field.Name, secondary: Field.Name }, DIRECTIONS).secondary,
    ).toBeNull();
    expect(
      resolveSort({ field: Field.Name, secondary: Field.None }, DIRECTIONS).secondary,
    ).toBeNull();
    const resolved = resolveSort(
      {
        field: Field.CountOfCountries,
        secondary: Field.Name,
        secondaryBehavior: SortBehavior.Reverse,
      },
      DIRECTIONS,
    );
    expect(resolved.secondary).toBe(Field.Name);
    expect(resolved.secondaryDirection).toBe(-1);
  });

  it('defaults to Field.None and rejects fields that were not compiled', () => {
    expect(resolveSort(undefined, DIRECTIONS).primary).toBe(Field.None);
    expect(() => resolveSort({ field: Field.Area }, DIRECTIONS)).toThrow(/not compiled/);
  });

  it('gives different cache keys to different specs', () => {
    const a = resolveSort({ field: Field.Name }, DIRECTIONS).key;
    const b = resolveSort({ field: Field.Name, behavior: SortBehavior.Reverse }, DIRECTIONS).key;
    const c = resolveSort({ field: Field.Name, secondary: Field.Population }, DIRECTIONS).key;
    expect(new Set([a, b, c]).size).toBe(3);
  });
});

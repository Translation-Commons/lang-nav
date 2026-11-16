import { describe, expect, it } from 'vitest';

import Bitset from '../bitset/Bitset';

describe('Bitset', () => {
  it('adds, removes, and reads bits across word boundaries', () => {
    const bits = Bitset.fromRows(70, [0, 31, 32, 63, 64, 69]);
    expect(bits.toArray()).toEqual([0, 31, 32, 63, 64, 69]);
    expect(bits.count()).toBe(6);
    bits.remove(32);
    expect(bits.has(32)).toBe(false);
    expect(bits.has(31)).toBe(true);
    expect(bits.count()).toBe(5);
  });

  it('rejects bits outside its size', () => {
    expect(() => new Bitset(10).add(10)).toThrow(RangeError);
    expect(() => new Bitset(10).add(-1)).toThrow(RangeError);
  });

  it.each([0, 1, 31, 32, 33, 64, 100])('range(%i) sets exactly the first bits', (end) => {
    const bits = Bitset.range(100, end);
    expect(bits.count()).toBe(end);
    expect(bits.toArray()).toEqual(Array.from({ length: end }, (_, i) => i));
  });

  it('intersects, unions, and subtracts in place', () => {
    const a = () => Bitset.fromRows(40, [1, 2, 3, 35]);
    const b = Bitset.fromRows(40, [2, 3, 4, 39]);
    expect(a().and(b).toArray()).toEqual([2, 3]);
    expect(a().or(b).toArray()).toEqual([1, 2, 3, 4, 35, 39]);
    expect(a().andNot(b).toArray()).toEqual([1, 35]);
  });

  it('refuses to combine bitsets of different sizes', () => {
    expect(() => new Bitset(10).and(new Bitset(11))).toThrow(RangeError);
  });

  it('clones without sharing storage', () => {
    const original = Bitset.fromRows(8, [1]);
    const copy = original.clone();
    copy.add(2);
    expect(original.toArray()).toEqual([1]);
    expect(copy.toArray()).toEqual([1, 2]);
  });

  it('reports emptiness and handles the high bit of a word', () => {
    const bits = new Bitset(64);
    expect(bits.isEmpty()).toBe(true);
    bits.add(31);
    bits.add(63);
    expect(bits.isEmpty()).toBe(false);
    expect(bits.toArray()).toEqual([31, 63]);
    expect(bits.count()).toBe(2);
  });
});

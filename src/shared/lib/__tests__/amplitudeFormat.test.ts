import { describe, expect, it } from 'vitest';

import {
  areFilterValuesEqual,
  deriveFilterAction,
  FILTER_PARAM_KEYS,
  resolveEnumValue,
} from '../amplitudeFormat';

describe('deriveFilterAction', () => {
  it('returns "set" when going from empty to non-empty', () => {
    expect(deriveFilterAction('', 'ES')).toBe('set');
    expect(deriveFilterAction(undefined, 'ES')).toBe('set');
    expect(deriveFilterAction([], [1])).toBe('set');
  });

  it('returns "cleared" when going from non-empty to empty', () => {
    expect(deriveFilterAction('ES', '')).toBe('cleared');
    expect(deriveFilterAction([1], [])).toBe('cleared');
  });

  it('returns "added" for a single new array entry', () => {
    expect(deriveFilterAction([1], [1, 2])).toBe('added');
  });

  it('returns "removed" for a single missing array entry', () => {
    expect(deriveFilterAction([1, 2], [1])).toBe('removed');
  });

  it('returns "changed" for a free-form string swap or multi-element edit', () => {
    expect(deriveFilterAction('ES', 'FR')).toBe('changed');
    expect(deriveFilterAction([1, 2], [3, 4])).toBe('changed');
  });
});

describe('areFilterValuesEqual', () => {
  it('treats arrays with the same members as equal regardless of order', () => {
    expect(areFilterValuesEqual([1, 2], [2, 1])).toBe(true);
    expect(areFilterValuesEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('returns true for identical scalars and false for different ones', () => {
    expect(areFilterValuesEqual('ES', 'ES')).toBe(true);
    expect(areFilterValuesEqual('ES', 'FR')).toBe(false);
    expect(areFilterValuesEqual(undefined, undefined)).toBe(true);
  });
});

describe('resolveEnumValue', () => {
  it('renames the sortBehavior numeric values', () => {
    expect(resolveEnumValue('sortBehavior', 1)).toBe('asc');
    expect(resolveEnumValue('sortBehavior', -1)).toBe('desc');
  });

  it('leaves unknown keys untouched', () => {
    expect(resolveEnumValue('unknownKey', 5)).toBe(5);
    expect(resolveEnumValue('unknownKey', 'foo')).toBe('foo');
  });
});

describe('FILTER_PARAM_KEYS', () => {
  it('does not include searchString (which has its own event)', () => {
    expect(FILTER_PARAM_KEYS).not.toContain('searchString');
  });

  it('does not include view/sort/objectType (which have their own events)', () => {
    expect(FILTER_PARAM_KEYS).not.toContain('view');
    expect(FILTER_PARAM_KEYS).not.toContain('sortBy');
    expect(FILTER_PARAM_KEYS).not.toContain('objectType');
  });
});

import { describe, expect, it } from 'vitest';

import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import {
  areFilterValuesEqual,
  buildSortKeys,
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

  it('decodes numeric enum filter values to their names', () => {
    // modalityFilter -> LanguageModality (includes negative-valued members)
    expect(resolveEnumValue('modalityFilter', [2])).toEqual(['Spoken']);
    expect(resolveEnumValue('modalityFilter', [-2])).toEqual(['Written']);
    // isoStatus -> LanguageISOStatus
    expect(resolveEnumValue('isoStatus', [9])).toEqual(['Living']);
    // vitalityEthCoarse -> VitalityEthnologueCoarse
    expect(resolveEnumValue('vitalityEthCoarse', [6])).toEqual(['Stable']);
  });
});

describe('buildSortKeys', () => {
  it("builds directional keys reflecting each field's natural direction", () => {
    // Population sorts high-to-low by default (desc); Name sorts A-Z (asc).
    expect(buildSortKeys(Field.Population, Field.Name, SortBehavior.Normal)).toEqual([
      'population_desc',
      'name_asc',
    ]);
  });

  it('flips every direction when the sort behavior is reversed', () => {
    expect(buildSortKeys(Field.Population, Field.Name, SortBehavior.Reverse)).toEqual([
      'population_asc',
      'name_desc',
    ]);
  });

  it('omits None and a secondary that duplicates the primary', () => {
    expect(buildSortKeys(Field.Name, Field.None, SortBehavior.Normal)).toEqual(['name_asc']);
    expect(buildSortKeys(Field.Name, Field.Name, SortBehavior.Normal)).toEqual(['name_asc']);
  });

  it('slugifies multi-word field names', () => {
    expect(buildSortKeys(Field.WritingSystem, Field.None, SortBehavior.Normal)).toEqual([
      'writing_system_asc',
    ]);
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

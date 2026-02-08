import { describe, expect, it, vi } from 'vitest';

import { PageParamsContextState } from '@features/params/PageParamsContext';
import { ObjectType, PageParamsOptional, View } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import Field from '@features/transforms/fields/Field';

const mockUpdatePageParams = vi.fn();

export const createMockUsePageParams = (
  overrides: PageParamsOptional = {},
): PageParamsContextState => {
  return {
    ...getDefaultParams(),
    updatePageParams: mockUpdatePageParams,
    ...overrides,
  };
};

describe('createMockUsePageParams', () => {
  it('creates a mock PageParamsContextState with default values', () => {
    const mockParams = createMockUsePageParams();

    expect(mockParams.sortBy).toBe(Field.Population);
    expect(mockParams.objectType).toBe(ObjectType.Language);
    expect(mockParams.view).toBe(View.CardList);
  });

  it('overrides default values when provided', () => {
    const overrides: PageParamsOptional = {
      sortBy: Field.Name,
      objectType: ObjectType.Locale,
      limit: 25,
    };
    const mockParams = createMockUsePageParams(overrides);

    expect(mockParams.sortBy).toBe(Field.Name);
    expect(mockParams.objectType).toBe(ObjectType.Locale);
    expect(mockParams.limit).toBe(25);
  });
});

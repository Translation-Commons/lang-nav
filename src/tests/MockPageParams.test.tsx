import { describe, expect, it, vi } from 'vitest';

import { PageParamsContextState } from '@features/page-params/PageParamsContext';
import { ObjectType, PageParamsOptional, View } from '@features/page-params/PageParamTypes';
import { getDefaultParams } from '@features/page-params/Profiles';
import { SortBy } from '@features/sorting/SortTypes';

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

    expect(mockParams.sortBy).toBe(SortBy.Population);
    expect(mockParams.objectType).toBe(ObjectType.Language);
    expect(mockParams.view).toBe(View.CardList);
  });

  it('overrides default values when provided', () => {
    const overrides: PageParamsOptional = {
      sortBy: SortBy.Name,
      objectType: ObjectType.Locale,
      limit: 25,
    };
    const mockParams = createMockUsePageParams(overrides);

    expect(mockParams.sortBy).toBe(SortBy.Name);
    expect(mockParams.objectType).toBe(ObjectType.Locale);
    expect(mockParams.limit).toBe(25);
  });
});

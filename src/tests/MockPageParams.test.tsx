import { describe, expect, it, vi } from 'vitest';

import { PageParamsContextState } from '@features/params/PageParamsContext';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import Field from '@features/transforms/fields/Field';

const mockUpdatePageParams = vi.fn();

export const createMockUsePageParams = (
  overrides: Partial<PageParams> = {},
): PageParamsContextState => {
  return {
    ...getDefaultParams(),
    updatePageParams: mockUpdatePageParams,
    brightness: { preference: 'light', setPreference: () => {}, pageBrightness: 'light' },
    ...overrides,
  };
};

describe('createMockUsePageParams', () => {
  it('creates a mock PageParamsContextState with default values', () => {
    const mockParams = createMockUsePageParams();

    expect(mockParams.sortBy).toBe(Field.Population);
    expect(mockParams.entType).toBe(EntityType.Language);
    expect(mockParams.view).toBe(View.CardList);
  });

  it('overrides default values when provided', () => {
    const overrides: Partial<PageParams> = {
      sortBy: Field.Name,
      entType: EntityType.Locale,
      limit: 25,
    };
    const mockParams = createMockUsePageParams(overrides);

    expect(mockParams.sortBy).toBe(Field.Name);
    expect(mockParams.entType).toBe(EntityType.Locale);
    expect(mockParams.limit).toBe(25);
  });
});

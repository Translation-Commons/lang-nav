import { describe, expect, it, vi } from 'vitest';

import { PageParamsContextState } from '@features/page-params/PageParamsContext';
import {
  LocaleSeparator,
  ObjectType,
  PageParamsOptional,
  SearchableField,
  View,
} from '@features/page-params/PageParamTypes';
import { ProfileType } from '@features/page-params/Profiles';
import { SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/types/DataTypes';

const mockUpdatePageParams = vi.fn();

export const createMockUsePageParams = (
  overrides: PageParamsOptional = {},
): PageParamsContextState => ({
  sortBy: SortBy.Population,
  updatePageParams: mockUpdatePageParams,
  sortBehavior: SortBehavior.Normal,
  searchString: '', // Add this to prevent the toLowerCase error
  searchBy: SearchableField.EngName,
  objectType: ObjectType.Language,
  view: View.Table,
  profile: ProfileType.LanguageEthusiast,
  page: 1,
  limit: 10,
  languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
  territoryScopes: [TerritoryScope.Country, TerritoryScope.Dependency],
  languageSource: LanguageSource.All,
  localeSeparator: LocaleSeparator.Underscore,
  territoryFilter: '',
  vitalityISO: [],
  vitalityEth2013: [],
  vitalityEth2025: [],
  ...overrides,
});

describe('createMockUsePageParams', () => {
  it('creates a mock PageParamsContextState with default values', () => {
    const mockParams = createMockUsePageParams();

    expect(mockParams.sortBy).toBe(SortBy.Population);
    expect(mockParams.objectType).toBe(ObjectType.Language);
    expect(mockParams.view).toBe(View.Table);
    expect(mockParams.updatePageParams).toBe(mockUpdatePageParams);
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

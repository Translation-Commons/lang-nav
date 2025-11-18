import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// import { useDataContext } from '@features/data-loading/context/useDataContext';
import { PageParamsOptional } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { VitalityEthnologueFine } from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import useFilteredObjects from '../useFilteredObjects';

import { getMockLanguages } from './mockLanguagesForFilterTest.test';

// Mock hooks
vi.mock('@features/page-params/usePageParams', () => ({ default: vi.fn() }));

vi.mock('@features/data-loading/context/useDataContext', () => ({
  // Languages: [ine, eng, spa, fra, deu, ita, zho]
  useDataContext: vi.fn(() => ({ languagesInSelectedSource: getMockLanguages() })),
}));

// Helper to get hook result
function getHookResult(
  params: {
    useScope?: boolean;
    useSubstring?: boolean;
    useTerritory?: boolean;
    useVitality?: boolean;
  } = {},
) {
  const res = renderHook(() => useFilteredObjects(params));
  return res.result.current;
}

describe('useFilteredObjects', () => {
  const setupMockParams = (overrides: PageParamsOptional = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockParams();
  });

  it('returns default items when no filters are active', () => {
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual([
      // 'ine', // Indo-European family not included since its filtered out as family by default
      'eng',
      'spa',
      'fra',
      'deu',
      'ita',
      'rus',
      'nav',
      'zho',
    ]);
  });

  it('filters by searchString', () => {
    setupMockParams({
      languageScopes: [], // allow all languoids including Indo-European family
      searchString: 'i', // I matches ine, ita
    });
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual(['ine', 'ita']);
  });

  it('filters by Ethnologue 2013 vitality value', () => {
    setupMockParams({ vitalityEth2013: [VitalityEthnologueFine.National] });
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual(['eng', 'spa']);
  });

  it('filters by territory', () => {
    setupMockParams({ territoryFilter: 'US' });
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual(['eng', 'spa', 'fra', 'rus', 'nav']);
  });

  it('allows composite filters (territory + vitality)', () => {
    setupMockParams({ territoryFilter: 'US', vitalityEth2013: [VitalityEthnologueFine.National] });
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual(['eng', 'spa']);
  });

  it('can change the language scope filter', () => {
    setupMockParams({ languageScopes: [LanguageScope.Macrolanguage] });
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual(['zho']);
  });

  it("if we don't want to filter by scope, it will allow the language family (ine) even though the page param wouldn't normally allow it", () => {
    const { filteredObjects } = getHookResult({ useScope: false });
    expect(filteredObjects.map((obj) => obj.ID)).toEqual([
      'ine', // usually filtered out as family
      'eng',
      'spa',
      'fra',
      'deu',
      'ita',
      'rus',
      'nav',
      'zho',
    ]);
  });

  it('treats empty languageScopes as "any languoid" allowing languoid items through', () => {
    setupMockParams({ languageScopes: [] });
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual([
      'ine',
      'eng',
      'spa',
      'fra',
      'deu',
      'ita',
      'rus',
      'nav',
      'zho',
    ]);
  });

  it('returns sorted items', () => {
    setupMockParams({ sortBy: SortBy.Name, sortBehavior: SortBehavior.Reverse });
    const { filteredObjects } = getHookResult({});
    expect(filteredObjects.map((obj) => obj.ID)).toEqual([
      'spa', // Spanish
      'rus', // Russian
      'nav', // Navajo
      'ita', // Italian
      'deu', // German
      // 'ine', // Indo-European not included since its filtered out as family
      'fra', // French
      'eng', // English
      'zho', // Chinese
    ]);
  });
});

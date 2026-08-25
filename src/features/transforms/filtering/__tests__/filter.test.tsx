import { renderHook } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { EntityType, PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import { useFilterByVitality } from '../filter';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(),
}));

// Helper to get hook result
function getFilterByVitalityHook() {
  const res = renderHook(() => useFilterByVitality());
  return res.result.current;
}

describe('useFilterByVitality', () => {
  const mockLanguage = {
    ...getBaseLanguageData('test-lang', 'Test Language'),
    vitality: {
      iso: LanguageISOStatus.Living,
    },
  };

  const mockNonLanguage: TerritoryData = {
    type: EntityType.Territory,
    ID: 'TEST',
    codeDisplay: 'TEST',
    nameDisplay: 'Test Territory',
    names: ['Test Territory'],
    scope: TerritoryScope.Country,
    pop: { overall: 1000 },
  };

  function mockParams(params: Partial<PageParams>) {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams(params));
  }

  it('returns true for non-language entities', () => {
    mockParams({ isoStatus: [] });
    const filter = getFilterByVitalityHook();
    expect(filter(mockNonLanguage)).toBe(true);
  });

  it('returns true when no vitality filters are active', () => {
    mockParams({ isoStatus: [] });
    const filter = getFilterByVitalityHook();
    expect(filter(mockLanguage)).toBe(true);
  });

  it('filters by ISO vitality', () => {
    mockParams({ isoStatus: [LanguageISOStatus.Living] });
    const filterMatch = getFilterByVitalityHook();
    expect(filterMatch(mockLanguage)).toBe(true);

    mockParams({ isoStatus: [LanguageISOStatus.Extinct] });
    const filterNoMatch = getFilterByVitalityHook();
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('handles missing vitality data', () => {
    const mockIncompleteLanguage = {
      ...getBaseLanguageData('test-lang-incomplete', 'Test Language Incomplete'),
      vitality: {}, // no derived vitality data
    };
    mockParams({ isoStatus: [LanguageISOStatus.Living] });

    const filter = getFilterByVitalityHook();
    expect(filter(mockIncompleteLanguage)).toBe(false);
  });

  it('handles multiple values for same vitality type', () => {
    mockParams({ isoStatus: [LanguageISOStatus.Living, LanguageISOStatus.Constructed] });
    const filterMatch = getFilterByVitalityHook();
    expect(filterMatch(mockLanguage)).toBe(true);

    mockParams({ isoStatus: [LanguageISOStatus.Extinct, LanguageISOStatus.Constructed] });
    const filterNoMatch = getFilterByVitalityHook();
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });
});

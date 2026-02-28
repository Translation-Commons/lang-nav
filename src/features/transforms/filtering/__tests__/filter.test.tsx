import { describe, expect, it, Mock, vi } from 'vitest';

import { ObjectType, PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import { getFilterByVitality } from '../filter';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(),
}));

describe('getFilterByVitality', () => {
  const mockLanguage = {
    ...getBaseLanguageData('test-lang', 'Test Language'),
    vitality: {
      iso: LanguageISOStatus.Living,
      ethFine: VitalityEthnologueFine.National,
      ethCoarse: VitalityEthnologueCoarse.Institutional,
    },
  };

  const mockNonLanguage: TerritoryData = {
    type: ObjectType.Territory,
    ID: 'TEST',
    codeDisplay: 'TEST',
    nameDisplay: 'Test Territory',
    names: ['Test Territory'],
    scope: TerritoryScope.Country,
    population: 1000,
    populationFromUN: 1000,
  };

  function mockParams(params: PageParamsOptional) {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams(params));
  }

  it('returns true for non-language objects', () => {
    mockParams({ isoStatus: [] });
    const filter = getFilterByVitality();
    expect(filter(mockNonLanguage)).toBe(true);
  });

  it('returns true when no vitality filters are active', () => {
    mockParams({ isoStatus: [] });
    const filter = getFilterByVitality();
    expect(filter(mockLanguage)).toBe(true);
  });

  it('filters by ISO vitality', () => {
    mockParams({ isoStatus: [LanguageISOStatus.Living] });
    const filterMatch = getFilterByVitality();
    expect(filterMatch(mockLanguage)).toBe(true);

    mockParams({ isoStatus: [LanguageISOStatus.Extinct] });
    const filterNoMatch = getFilterByVitality();
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('handles missing vitality data', () => {
    const mockIncompleteLanguage = {
      ...getBaseLanguageData('test-lang-incomplete', 'Test Language Incomplete'),
      ISO: {}, // empty ISO vitality data
    };
    mockParams({ isoStatus: [LanguageISOStatus.Living] });

    const filter = getFilterByVitality();
    expect(filter(mockIncompleteLanguage)).toBe(false);
  });

  it('handles multiple values for same vitality type', () => {
    mockParams({ isoStatus: [LanguageISOStatus.Living, LanguageISOStatus.Constructed] });
    const filterMatch = getFilterByVitality();
    expect(filterMatch(mockLanguage)).toBe(true);

    mockParams({ isoStatus: [LanguageISOStatus.Extinct, LanguageISOStatus.Constructed] });
    const filterNoMatch = getFilterByVitality();
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import {
  VitalityISO,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

import { buildVitalityFilterFunction } from '../filter';

describe('buildVitalityFilterFunction', () => {
  const mockLanguage = {
    ...getBaseLanguageData('test-lang', 'Test Language'),
    vitalityISO: VitalityISO.Living,
    vitalityEth2013: VitalityEthnologueFine.National,
    vitalityEth2025: VitalityEthnologueCoarse.Institutional,
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

  it('returns true for non-language objects', () => {
    const filter = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(filter(mockNonLanguage)).toBe(true);
  });

  it('returns true when no vitality filters are active', () => {
    const filter = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(filter(mockLanguage)).toBe(true);
  });

  it('filters by ISO vitality', () => {
    const filterMatch = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Living],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(filterMatch(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Extinct],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('filters by Ethnologue 2013', () => {
    const filterMatch = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [VitalityEthnologueFine.National],
      vitalityEth2025: [],
    });
    expect(filterMatch(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [VitalityEthnologueFine.Threatened],
      vitalityEth2025: [],
    });
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('filters by Ethnologue 2025', () => {
    const filterMatch = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [],
      vitalityEth2025: [VitalityEthnologueCoarse.Institutional],
    });
    expect(filterMatch(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [],
      vitalityEth2025: [VitalityEthnologueCoarse.Endangered],
    });
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('handles multiple vitality filters', () => {
    const filterAllMatch = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Living],
      vitalityEth2013: [VitalityEthnologueFine.National],
      vitalityEth2025: [VitalityEthnologueCoarse.Institutional],
    });
    expect(filterAllMatch(mockLanguage)).toBe(true);

    const filterPartialMatch = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Living],
      vitalityEth2013: [VitalityEthnologueFine.Threatened],
      vitalityEth2025: [VitalityEthnologueCoarse.Institutional],
    });
    expect(filterPartialMatch(mockLanguage)).toBe(false);
  });

  it('handles missing vitality data', () => {
    const mockIncompleteLanguage = {
      ...getBaseLanguageData('test-lang-incomplete', 'Test Language Incomplete'),
      vitalityISO: VitalityISO.Living,
      // Missing Ethnologue data
    };

    const filter = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [VitalityEthnologueFine.National],
      vitalityEth2025: [],
    });
    expect(filter(mockIncompleteLanguage)).toBe(false);
  });

  it('handles multiple values for same vitality type', () => {
    const filter = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Living, VitalityISO.Constructed],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(filter(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Extinct, VitalityISO.Constructed],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('handles complex combinations of vitality filters', () => {
    // Test with multiple values in each category
    const complexFilter = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Living, VitalityISO.Constructed],
      vitalityEth2013: [VitalityEthnologueFine.National, VitalityEthnologueFine.Regional],
      vitalityEth2025: [VitalityEthnologueCoarse.Institutional, VitalityEthnologueCoarse.Stable],
    });
    expect(complexFilter(mockLanguage)).toBe(true);

    // Test with non-matching combinations
    const nonMatchingFilter = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Living],
      vitalityEth2013: [VitalityEthnologueFine.Regional], // Doesn't match National
      vitalityEth2025: [VitalityEthnologueCoarse.Institutional],
    });
    expect(nonMatchingFilter(mockLanguage)).toBe(false);
  });

  it('handles undefined vitality values correctly', () => {
    const mockUndefinedLanguage = {
      ...getBaseLanguageData('test-lang-undefined', 'Test Language Undefined'),
      // No vitality values set
    };

    const filter = buildVitalityFilterFunction({
      vitalityISO: [VitalityISO.Living],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(filter(mockUndefinedLanguage)).toBe(false);

    // Should pass when no filters are active
    const noFilterActive = buildVitalityFilterFunction({
      vitalityISO: [],
      vitalityEth2013: [],
      vitalityEth2025: [],
    });
    expect(noFilterActive(mockUndefinedLanguage)).toBe(true);
  });
});

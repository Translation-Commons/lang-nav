import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';

import { buildVitalityFilterFunction } from '../filter';

describe('buildVitalityFilterFunction', () => {
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

  it('returns true for non-language objects', () => {
    const filter = buildVitalityFilterFunction([], [], []);
    expect(filter(mockNonLanguage)).toBe(true);
  });

  it('returns true when no vitality filters are active', () => {
    const filter = buildVitalityFilterFunction([], [], []);
    expect(filter(mockLanguage)).toBe(true);
  });

  it('filters by ISO vitality', () => {
    const filterMatch = buildVitalityFilterFunction([LanguageISOStatus.Living], [], []);
    expect(filterMatch(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction([LanguageISOStatus.Extinct], [], []);
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('filters by Ethnologue Fine Vitality', () => {
    const filterMatch = buildVitalityFilterFunction([], [VitalityEthnologueFine.National], []);
    expect(filterMatch(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction([], [VitalityEthnologueFine.Threatened], []);
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('filters by Ethnologue Coarse Vitality', () => {
    const filterMatch = buildVitalityFilterFunction(
      [],
      [],
      [VitalityEthnologueCoarse.Institutional],
    );
    expect(filterMatch(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction(
      [],
      [],
      [VitalityEthnologueCoarse.Endangered],
    );
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('handles multiple vitality filters', () => {
    const filterAllMatch = buildVitalityFilterFunction(
      [LanguageISOStatus.Living],
      [VitalityEthnologueFine.National],
      [VitalityEthnologueCoarse.Institutional],
    );
    expect(filterAllMatch(mockLanguage)).toBe(true);

    const filterPartialMatch = buildVitalityFilterFunction(
      [LanguageISOStatus.Living],
      [VitalityEthnologueFine.Threatened],
      [VitalityEthnologueCoarse.Institutional],
    );
    expect(filterPartialMatch(mockLanguage)).toBe(false);
  });

  it('handles missing vitality data', () => {
    const mockIncompleteLanguage = {
      ...getBaseLanguageData('test-lang-incomplete', 'Test Language Incomplete'),
      ISO: { status: LanguageISOStatus.Living },
      // Missing Ethnologue data
    };

    const filter = buildVitalityFilterFunction([], [VitalityEthnologueFine.National], []);
    expect(filter(mockIncompleteLanguage)).toBe(false);
  });

  it('handles multiple values for same vitality type', () => {
    const filter = buildVitalityFilterFunction(
      [LanguageISOStatus.Living, LanguageISOStatus.Constructed],
      [],
      [],
    );
    expect(filter(mockLanguage)).toBe(true);

    const filterNoMatch = buildVitalityFilterFunction(
      [LanguageISOStatus.Extinct, LanguageISOStatus.Constructed],
      [],
      [],
    );
    expect(filterNoMatch(mockLanguage)).toBe(false);
  });

  it('handles complex combinations of vitality filters', () => {
    // Test with multiple values in each category
    const complexFilter = buildVitalityFilterFunction(
      [LanguageISOStatus.Living, LanguageISOStatus.Constructed],
      [VitalityEthnologueFine.National, VitalityEthnologueFine.Regional],
      [VitalityEthnologueCoarse.Institutional, VitalityEthnologueCoarse.Stable],
    );
    expect(complexFilter(mockLanguage)).toBe(true);

    // Test with non-matching combinations
    const nonMatchingFilter = buildVitalityFilterFunction(
      [LanguageISOStatus.Living],
      [VitalityEthnologueFine.Regional], // Doesn't match National
      [VitalityEthnologueCoarse.Institutional],
    );
    expect(nonMatchingFilter(mockLanguage)).toBe(false);
  });

  it('handles undefined vitality values correctly', () => {
    const mockUndefinedLanguage = {
      ...getBaseLanguageData('test-lang-undefined', 'Test Language Undefined'),
      // No vitality values set
    };

    const filter = buildVitalityFilterFunction([LanguageISOStatus.Living], [], []);
    expect(filter(mockUndefinedLanguage)).toBe(false);

    // Should pass when no filters are active
    const noFilterActive = buildVitalityFilterFunction([], [], []);
    expect(noFilterActive(mockUndefinedLanguage)).toBe(true);
  });
});

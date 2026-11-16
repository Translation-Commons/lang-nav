import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getBaseLanguageData, LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import useTerritoryLanguageStats from '../useTerritoryLanguageStats';

function makeLanguage(
  overrides: Partial<LanguageData> & { ID: string; nameDisplay: string },
): LanguageData {
  return { ...getBaseLanguageData(overrides.ID, overrides.nameDisplay), ...overrides };
}

function makeLocale(ID: string, language: LanguageData): LocaleData {
  return {
    type: EntityType.Locale,
    ID,
    codeDisplay: ID,
    localeSource: LocaleSource.StableDatabase,
    nameDisplay: language.nameDisplay,
    names: [language.nameDisplay],
    languageCode: language.ID,
    language,
    pop: { speaking: {}, writing: {} },
  };
}

const indoEuropean = makeLanguage({
  ID: 'ine',
  nameDisplay: 'Indo-European',
  scope: LanguageScope.Family,
});
const sinoTibetan = makeLanguage({
  ID: 'sit',
  nameDisplay: 'Sino-Tibetan',
  scope: LanguageScope.Family,
});
const english = makeLanguage({
  ID: 'eng',
  nameDisplay: 'English',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
  parentLanguage: indoEuropean,
  pop: { overall: 100, speaking: {}, writing: {} },
});
const spanish = makeLanguage({
  ID: 'spa',
  nameDisplay: 'Spanish',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
  parentLanguage: indoEuropean,
  pop: { overall: 50, speaking: {}, writing: {} },
});
const mandarin = makeLanguage({
  ID: 'cmn',
  nameDisplay: 'Mandarin',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
  parentLanguage: sinoTibetan,
  pop: { overall: 200, speaking: {}, writing: {} },
});

const latin = makeLanguage({
  ID: 'lat',
  nameDisplay: 'Latin',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Extinct },
  parentLanguage: indoEuropean,
  pop: { overall: 1000, speaking: {}, writing: {} },
});

const territory: TerritoryData = {
  type: EntityType.Territory,
  ID: 'US',
  codeDisplay: 'US',
  nameDisplay: 'United States',
  names: ['United States'],
  scope: TerritoryScope.Country,
  pop: { overall: 0 },
  locales: [
    makeLocale('eng_US', english),
    makeLocale('spa_US', spanish),
    makeLocale('cmn_US', mandarin),
    makeLocale('lat_US', latin),
  ],
};

describe('useTerritoryLanguageStats', () => {
  it('counts the distinct living languages present in the territory', () => {
    const { result } = renderHook(() => useTerritoryLanguageStats(territory));
    expect(result.current.languageCount).toBe(3);
  });

  it('ranks families by number of languages present, most first', () => {
    const { result } = renderHook(() => useTerritoryLanguageStats(territory));
    expect(result.current.primaryFamilies).toEqual(['Indo-European', 'Sino-Tibetan']);
  });

  it('finds the highest-population language in the territory', () => {
    const { result } = renderHook(() => useTerritoryLanguageStats(territory));
    expect(result.current.topLanguage?.ID).toBe('cmn');
  });

  it('returns zeroed stats when there is no territory', () => {
    const { result } = renderHook(() => useTerritoryLanguageStats(undefined));
    expect(result.current).toEqual({
      languageCount: 0,
      primaryFamilies: [],
      topLanguage: undefined,
    });
  });
});

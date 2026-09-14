import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getBaseLanguageData, LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import useGlobalLanguageStats from '../useGlobalLanguageStats';

function makeLanguage(overrides: Partial<LanguageData> & { ID: string; nameDisplay: string }): LanguageData {
  return {
    ...getBaseLanguageData(overrides.ID, overrides.nameDisplay),
    ...overrides,
  };
}

const indoEuropean = makeLanguage({
  ID: 'ine',
  nameDisplay: 'Indo-European',
  scope: LanguageScope.Family,
  ISO: { status: LanguageISOStatus.Living },
});
const sinoTibetan = makeLanguage({
  ID: 'sit',
  nameDisplay: 'Sino-Tibetan',
  scope: LanguageScope.Family,
  ISO: { status: LanguageISOStatus.Living },
});
const english = makeLanguage({
  ID: 'eng',
  nameDisplay: 'English',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
  pop: { overall: 60, speaking: {}, writing: {} },
  parentLanguage: indoEuropean,
  primaryWritingSystem: { ID: 'Latn' } as WritingSystemData,
});
const spanish = makeLanguage({
  ID: 'spa',
  nameDisplay: 'Spanish',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
  pop: { overall: 30, speaking: {}, writing: {} },
  parentLanguage: indoEuropean,
});
const mandarin = makeLanguage({
  ID: 'cmn',
  nameDisplay: 'Mandarin',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Living },
  pop: { overall: 10, speaking: {}, writing: {} },
  parentLanguage: sinoTibetan,
});
const extinctLang = makeLanguage({
  ID: 'ext',
  nameDisplay: 'Extinct Tongue',
  scope: LanguageScope.Language,
  ISO: { status: LanguageISOStatus.Extinct },
  pop: { overall: 5, speaking: {}, writing: {} },
});

vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: vi.fn(() => ({
    languagesInSelectedSource: [indoEuropean, sinoTibetan, english, spanish, mandarin, extinctLang],
    writingSystems: [{ ID: 'Latn' }, { ID: 'Hans' }] as WritingSystemData[],
  })),
}));

describe('useGlobalLanguageStats', () => {
  it('counts only living Language/Macrolanguage entries', () => {
    const { result } = renderHook(() => useGlobalLanguageStats());
    expect(result.current.totalLivingLanguages).toBe(3); // english, spanish, mandarin
  });

  it('counts Family-scope entries separately', () => {
    const { result } = renderHook(() => useGlobalLanguageStats());
    expect(result.current.familyCount).toBe(2); // indoEuropean, sinoTibetan
  });

  it('finds the language with the most speakers', () => {
    const { result } = renderHook(() => useGlobalLanguageStats());
    expect(result.current.topLanguageByPopulation?.ID).toBe('eng');
  });

  it('computes how many languages reach half of the total population', () => {
    // total living population = 60 + 30 + 10 = 100, half = 50
    // sorted desc: [60, 30, 10] -> after eng (60) running total is already >= 50
    const { result } = renderHook(() => useGlobalLanguageStats());
    expect(result.current.languagesForHalfOfHumanity).toBe(1);
  });

  it('passes through the raw writing system count', () => {
    const { result } = renderHook(() => useGlobalLanguageStats());
    expect(result.current.writingSystemCount).toBe(2);
  });

  it('counts living languages with a documented writing system', () => {
    const { result } = renderHook(() => useGlobalLanguageStats());
    expect(result.current.languagesWithWritingSystem).toBe(1); // only english
  });

  it('finds the largest family by number of living languages', () => {
    const { result } = renderHook(() => useGlobalLanguageStats());
    expect(result.current.largestFamily).toEqual({ name: 'Indo-European', languageCount: 2 });
  });
});

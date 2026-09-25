import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import useIntroSearchSuggestions from '../useIntroSearchSuggestions';

const territory = (ID: string, name: string, overall: number, scope = TerritoryScope.Country) => ({
  type: EntityType.Territory as const,
  ID,
  codeDisplay: ID,
  nameDisplay: name,
  names: [name],
  scope,
  pop: { overall },
});

const language = (code: string, name: string, overall: number, scope = LanguageScope.Language) => ({
  ...getBaseLanguageData(code, name),
  scope,
  pop: { speaking: {}, writing: {}, overall },
});

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(() => createMockUsePageParams()),
}));
vi.mock('@features/data/context/useEntities', () => ({
  default: vi.fn((entType: EntityType) =>
    entType === EntityType.Language
      ? [
          language('ind', 'Indonesian', 200),
          language('eng', 'English', 1500),
          language('aze', 'Turkic', 9000, LanguageScope.Family),
        ]
      : [
          territory('IN', 'India', 1400),
          territory('ID', 'Indonesia', 270),
          territory('035', 'Indochina', 100, TerritoryScope.Region),
        ],
  ),
}));

describe('useIntroSearchSuggestions', () => {
  it('returns matching languages and countries as separate groups, skipping regions', async () => {
    const { result } = renderHook(() => useIntroSearchSuggestions());

    const suggestions = await result.current('ind');

    expect(suggestions.map((s) => [s.group, s.entID])).toEqual([
      ['Languages', 'ind'],
      ['Countries', 'IN'],
      ['Countries', 'ID'],
    ]);
  });

  it('returns top results by population for an empty query, skipping language families', async () => {
    const { result } = renderHook(() => useIntroSearchSuggestions());

    const suggestions = await result.current('');

    expect(suggestions.map((s) => [s.group, s.entID])).toEqual([
      ['Languages', 'eng'],
      ['Languages', 'ind'],
      ['Countries', 'IN'],
      ['Countries', 'ID'],
    ]);
  });
});

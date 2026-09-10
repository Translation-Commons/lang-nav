import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import useIntroSearchSuggestions from '../useIntroSearchSuggestions';

const territory = (ID: string, name: string, scope = TerritoryScope.Country) => ({
  type: EntityType.Territory as const,
  ID,
  codeDisplay: ID,
  nameDisplay: name,
  names: [name],
  scope,
  pop: { overall: 0 },
});

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(() => createMockUsePageParams()),
}));
vi.mock('@features/data/context/useEntities', () => ({
  default: vi.fn((entType: EntityType) =>
    entType === EntityType.Language
      ? [getBaseLanguageData('eng', 'English'), getBaseLanguageData('ind', 'Indonesian')]
      : [
          territory('IN', 'India'),
          territory('ID', 'Indonesia'),
          territory('035', 'Indochina', TerritoryScope.Region),
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

  it('returns nothing for an empty query', async () => {
    const { result } = renderHook(() => useIntroSearchSuggestions());

    expect(await result.current('')).toEqual([]);
  });
});

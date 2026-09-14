import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import useIntroLandscapeTerritorySuggestions from '../useIntroLandscapeTerritorySuggestions';

const territory = (ID: string, name: string, overall: number, scope = TerritoryScope.Country) => ({
  type: EntityType.Territory as const,
  ID,
  codeDisplay: ID,
  nameDisplay: name,
  names: [name],
  scope,
  pop: { overall },
});

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(() => createMockUsePageParams()),
}));
vi.mock('@features/data/context/useEntities', () => ({
  default: vi.fn(() => [
    territory('IN', 'India', 1400),
    territory('ID', 'Indonesia', 270),
    territory('035', 'Indochina', 100, TerritoryScope.Region),
  ]),
}));

describe('useIntroLandscapeTerritorySuggestions', () => {
  it('returns matching countries, skipping region groupings', async () => {
    const { result } = renderHook(() => useIntroLandscapeTerritorySuggestions());

    const suggestions = await result.current('ind');

    expect(suggestions.map((s) => s.entID)).toEqual(['IN', 'ID']);
  });

  it('returns top countries by population for an empty query', async () => {
    const { result } = renderHook(() => useIntroLandscapeTerritorySuggestions());

    const suggestions = await result.current('');

    expect(suggestions.map((s) => s.entID)).toEqual(['IN', 'ID']);
  });
});

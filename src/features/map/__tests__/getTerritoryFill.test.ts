import { describe, expect, it, vi } from 'vitest';

import getTerritoryFill from '../territories/getTerritoryFill';

import { makeLocale, makeTerritory } from './mapTestEntities';

// jsdom has no canvas to resolve colours with, so pass them through.
vi.mock('../style/resolveCssColor', () => ({ resolveCssColor: (color: string) => color }));

const colors = { primary: 'rgb(0, 0, 255)', secondary: 'rgb(200, 200, 200)', noData: 'grey' };

describe('getTerritoryFill', () => {
  it('greys out every country when none are in the results', () => {
    const fill = getTerritoryFill({
      territoryIds: ['FR', 'DE'],
      entitiesByTerritory: {},
      getColor: null,
      colors,
    });
    expect(fill).toEqual({ color: 'grey', opacity: 0.8 });
  });

  it('paints countries in the results with the primary colour when not colouring', () => {
    const fill = getTerritoryFill({
      territoryIds: ['FR', 'DE'],
      entitiesByTerritory: { FR: [makeTerritory('FR')] },
      getColor: null,
      colors,
    });
    expect(fill.color).toEqual(['match', ['get', 'iso'], 'FR', 'rgb(0, 0, 255)', 'grey']);
    expect(fill.opacity).toEqual(['match', ['get', 'iso'], ['FR'], 1, 0.8]);
  });

  it("uses the colour of the country's entity, or the fallback when it has none", () => {
    const france = makeTerritory('FR');
    const fill = getTerritoryFill({
      territoryIds: ['FR', 'DE'],
      entitiesByTerritory: { FR: [makeLocale('fra_FR', france)], DE: [makeTerritory('DE')] },
      getColor: (ent) => (ent.ID === 'fra_FR' ? 'rgb(255, 0, 0)' : undefined),
      colors,
    });
    expect(fill.color).toEqual([
      'match',
      ['get', 'iso'],
      'FR',
      'rgb(255, 0, 0)',
      'DE',
      'rgb(200, 200, 200)',
      'grey',
    ]);
  });
});

import { describe, expect, it } from 'vitest';

import getEntityBounds from '../view/getEntityBounds';

import { makeTerritory } from './mapTestEntities';

describe('getEntityBounds', () => {
  it('is null when nothing can be placed', () => {
    expect(getEntityBounds([])).toBeNull();
    expect(getEntityBounds([makeTerritory('XX')])).toBeNull();
  });

  it('spans every placed entity', () => {
    const bounds = getEntityBounds([
      makeTerritory('A', { latitude: 10, longitude: -20 }),
      makeTerritory('B', { latitude: -5, longitude: 30 }),
      makeTerritory('C'),
    ]);
    expect(bounds).toEqual([
      [-20, -5],
      [30, 10],
    ]);
  });

  it('adds room around large countries so they are not cut off', () => {
    const bounds = getEntityBounds([
      makeTerritory('BR', { latitude: -10, longitude: -55, landArea: 8_500_000 }),
    ]);
    const margin = 8_500_000 ** 0.5 / 100;
    expect(bounds).toEqual([
      [-55 - margin, -10 - margin],
      [-55 + margin, -10 + margin],
    ]);
  });

  it('stays within the latitudes the map can show', () => {
    const bounds = getEntityBounds([
      makeTerritory('AQ', { latitude: -80, longitude: 0.5, landArea: 14_000_000 }),
    ]);
    expect(bounds?.[0][1]).toBe(-85);
  });
});

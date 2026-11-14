import { describe, expect, it } from 'vitest';

import getEntityPosition from '../getEntityPosition';

import { makeLocale, makeTerritory } from './mapTestEntities';

describe('getEntityPosition', () => {
  it('returns longitude then latitude', () => {
    expect(getEntityPosition(makeTerritory('FR', { latitude: 46, longitude: 2 }))).toEqual([2, 46]);
  });

  it('places a locale on its territory', () => {
    const france = makeTerritory('FR', { latitude: 46, longitude: 2 });
    expect(getEntityPosition(makeLocale('fra_FR', france))).toEqual([2, 46]);
    expect(getEntityPosition(makeLocale('fra'))).toBeNull();
  });

  it('leaves out entities without coordinates, including 0,0', () => {
    expect(getEntityPosition(makeTerritory('XX'))).toBeNull();
    expect(getEntityPosition(makeTerritory('XX', { latitude: 0, longitude: 0 }))).toBeNull();
  });

  it('moves places just west of the date line to its east side', () => {
    expect(getEntityPosition(makeTerritory('AS', { latitude: -14, longitude: -170 }))).toEqual([
      190, -14,
    ]);
    expect(getEntityPosition(makeTerritory('US', { latitude: 39, longitude: -98 }))).toEqual([
      -98, 39,
    ]);
  });
});

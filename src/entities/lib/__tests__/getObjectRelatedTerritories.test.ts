/**
 * Testing getters from simulated data -- this is not accurate to real data but intentionally a hypothetical subset
 * to test various edge cases.
 */

import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';

import {
  getChildTerritoriesInObject,
  getContainingTerritories,
  getCountriesInObject,
} from '../getObjectRelatedTerritories';

const mockedObjects = getFullyInstantiatedMockedObjects();

describe('getContainingTerritories', () => {
  it('returns population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getContainingTerritories(obj)
          .map((obj) => obj.nameDisplay)
          .join(', '),
      ]),
    );
    expect(results).toEqual({
      '001': 'Arda',
      '123': 'Middle Earth, Arda',
      AM: 'Aman, Arda',
      BE: 'Beleriand, Arda, Middle Earth',
      ER: 'Eriador, Arda, Middle Earth',
      HA: 'Harad, Arda, Middle Earth',
      Teng: '',
      be0590: 'Beleriand',
      dori0123: 'Eriador, Middle Earth, Arda',
      dori0123_001: 'Arda',
      dori0123_123: 'Middle Earth',
      dori0123_ER: 'Eriador',
      sjn: 'Beleriand, Eriador, Middle Earth, Arda',
      sjn_001: 'Arda',
      sjn_123: 'Middle Earth',
      sjn_Teng_001: 'Arda',
      sjn_Teng_123: 'Middle Earth',
      sjn_Teng_BE: 'Beleriand',
      sjn_ER: 'Eriador',
      sjn_BE: 'Beleriand',
      tolkorth: '',
    });
  });
});

describe('getChildTerritoriesInObject', () => {
  it('returns population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getChildTerritoriesInObject(obj)
          ?.map((obj) => obj.nameDisplay)
          .join(', ') ?? undefined,
      ]),
    );
    expect(results).toEqual({
      '001': 'Middle Earth, Aman',
      '123': 'Beleriand, Eriador, Harad',
      AM: '',
      BE: '',
      ER: '',
      HA: '',
      Teng: undefined,
      be0590: 'Beleriand',
      dori0123: undefined,
      dori0123_001: 'Arda',
      dori0123_123: 'Middle Earth',
      dori0123_ER: 'Eriador',
      sjn: undefined,
      sjn_001: 'Arda',
      sjn_123: 'Middle Earth',
      sjn_Teng_001: 'Arda',
      sjn_Teng_123: 'Middle Earth',
      sjn_Teng_BE: 'Beleriand',
      sjn_ER: 'Eriador',
      sjn_BE: 'Beleriand',
      tolkorth: '',
    });
  });
});

describe('getCountriesInObject', () => {
  it('returns population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getCountriesInObject(obj)
          ?.map((obj) => obj.nameDisplay)
          .join(', ') ?? 'undefined',
      ]),
    );
    expect(results).toEqual({
      '001': 'Beleriand, Eriador, Harad, Aman',
      '123': 'Beleriand, Eriador, Harad',
      AM: 'Aman',
      BE: 'Beleriand',
      ER: 'Eriador',
      HA: 'Harad',
      Teng: 'Beleriand, Eriador',
      be0590: 'Beleriand',
      dori0123: 'Eriador',
      dori0123_001: 'Eriador',
      dori0123_123: 'Eriador',
      dori0123_ER: 'Eriador',
      sjn: 'Beleriand, Eriador',
      sjn_001: 'Beleriand, Eriador',
      sjn_123: 'Beleriand, Eriador',
      sjn_Teng_001: 'Beleriand', // No direct sjn_Teng_ER even though it is implied
      sjn_Teng_123: 'Beleriand',
      sjn_Teng_BE: 'Beleriand',
      sjn_ER: 'Eriador',
      sjn_BE: 'Beleriand',
      tolkorth: '',
    });
  });
});

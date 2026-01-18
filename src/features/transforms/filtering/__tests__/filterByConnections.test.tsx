/**
 * Testing getters from simulated data -- this is not accurate to real data but intentionally a hypothetical subset
 * to test various edge cases.
 */

import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';

import {
  getLanguagesRelevantToObject,
  getWritingSystemsRelevantToObject,
} from '../filterByConnections';

const mockedObjects = getFullyInstantiatedMockedObjects();

describe('getWritingSystemsRelevantToObject', () => {
  it('returns population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getWritingSystemsRelevantToObject(obj)
          .map((obj) => obj.nameDisplay)
          .join(', '),
      ]),
    );
    expect(results).toEqual({
      '001': '', // not available yet
      '123': '', // not available yet
      AM: '',
      BE: 'Tengwar',
      ER: 'Tengwar',
      HA: '',
      Teng: 'Tengwar',
      be0590: '',
      dori0123: 'Tengwar',
      dori0123_001: 'Tengwar',
      dori0123_123: 'Tengwar',
      dori0123_ER: 'Tengwar',
      sjn: 'Tengwar',
      sjn_001: 'Tengwar',
      sjn_123: 'Tengwar',
      sjn_Teng_001: 'Tengwar',
      sjn_Teng_123: 'Tengwar',
      sjn_Teng_BE: 'Tengwar',
      sjn_ER: 'Tengwar',
      sjn_BE: 'Tengwar',
      tolkorth: '',
    });
  });
});

describe('getLanguagesRelevantToObject', () => {
  it('returns population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getLanguagesRelevantToObject(obj)
          .map((obj) => obj.nameDisplay)
          .join(', '),
      ]),
    );
    expect(results).toEqual({
      '001': 'Sindarin, Doriathrin',
      '123': 'Sindarin, Doriathrin',
      AM: '',
      BE: 'Sindarin',
      ER: 'Sindarin, Doriathrin',
      HA: '',
      Teng: 'Sindarin, Doriathrin',
      be0590: '',
      dori0123: 'Sindarin, Doriathrin', // language family too
      dori0123_001: 'Doriathrin',
      dori0123_123: 'Doriathrin',
      dori0123_ER: 'Doriathrin',
      sjn: 'Sindarin',
      sjn_001: 'Sindarin',
      sjn_123: 'Sindarin',
      sjn_Teng_001: 'Sindarin',
      sjn_Teng_123: 'Sindarin',
      sjn_Teng_BE: 'Sindarin',
      sjn_ER: 'Sindarin',
      sjn_BE: 'Sindarin',
      tolkorth: 'Sindarin',
    });
  });
});

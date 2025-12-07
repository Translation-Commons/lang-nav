import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';

import { LanguageSource } from '@entities/language/LanguageTypes';
import {
  getObjectPercentOfTerritoryPopulation,
  getObjectPopulation,
  getObjectPopulationAttested,
  getObjectPopulationOfDescendants,
  getObjectPopulationPercentInBiggestDescendantLanguage,
  getObjectPopulationRelativeToOverallLanguageSpeakers,
} from '@entities/lib/getObjectPopulation';
import { ObjectData } from '@entities/types/DataTypes';

const mockedObjects = getFullyInstantiatedMockedObjects();

describe('getObjectPopulation', () => {
  it('returns population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getObjectPopulation(obj as ObjectData)]),
    );
    expect(results).toEqual({
      '001': 50000, // recomputed 123+AM
      '123': 30000, // recomputed BE+HA+ER
      AM: 20000,
      BE: 12000,
      be0590: 12000,
      dori0123: 1800,
      dori0123_001: 1800,
      dori0123_123: 1800,
      dori0123_ER: 1800,
      ER: 2400,
      HA: 15600,
      sjn: 11220,
      sjn_001: 11220,
      sjn_123: 11220,
      sjn_BE: 9300, // Increased by the be0590 census
      sjn_ER: 1920,
      sjn_Teng_001: 9000,
      sjn_Teng_123: 9000,
      sjn_Teng_BE: 9000,
      Teng: 26500, // some from sjn_Teng_BE, but also from the primary script for sjn & dori0123
      tolkorth: 11220, // Estimated from sjn
    });
  });
});

describe('getObjectPopulationAttested', () => {
  it('returns attested population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getObjectPopulationAttested(obj as ObjectData),
      ]),
    );
    expect(results).toEqual({
      '001': 50000,
      '123': 30000,
      AM: 20000,
      BE: 12000,
      ER: 2400,
      HA: 15600,
      Teng: undefined, // not attested, derived from sjn_Teng_BE
      dori0123: 2500,
      be0590: 12000,
      sjn: 24000,
      sjn_BE: 9300, // Increased by the be0590 census
      sjn_ER: 1920, // no census but using the data from the locale database

      // Regional locales have data because they are summed up from the locales inside
      dori0123_001: 1800,
      dori0123_123: 1800,
      dori0123_ER: 1800,
      sjn_001: 11220,
      sjn_123: 11220,
      sjn_Teng_001: 9000,
      sjn_Teng_123: 9000,
      sjn_Teng_BE: 9000,

      // No data
      tolkorth: undefined,
    });
  });
});

describe('getObjectPopulationOfDescendants', () => {
  it('returns population of descendants for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getObjectPopulationOfDescendants(obj as ObjectData, LanguageSource.Combined),
      ]),
    );
    expect(results).toEqual({
      '001': undefined,
      '123': undefined,
      AM: undefined,
      BE: undefined,
      be0590: undefined,
      dori0123_001: undefined,
      dori0123_123: undefined,
      dori0123_ER: undefined,
      dori0123: 0.01, // 0.01 from being a leaf node
      ER: undefined,
      HA: undefined,
      sjn_001: undefined,
      sjn_123: undefined,
      sjn_BE: undefined,
      sjn_ER: undefined,
      sjn_Teng_001: undefined,
      sjn_Teng_123: undefined,
      sjn_Teng_BE: undefined,
      sjn: 2500.0200000000004, // From dori0123 + 0.02 for each leaf node (others because of JS precision)
      Teng: undefined, // all from sjn_Teng_BE
      tolkorth: undefined,
    });
  });
});

describe('getObjectPercentOfTerritoryPopulation', () => {
  it('returns percent of territory population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getObjectPercentOfTerritoryPopulation(obj as ObjectData)?.toFixed(1),
      ]),
    );
    expect(results).toEqual({
      '001': undefined, // world is not contained in a larger territory
      '123': '60.0', // 30000/50000 of the world
      AM: '40.0', // 20000/50000 of the world
      BE: '40.0', // BE in 123
      be0590: '100.0', // be0590 covers all of BE,
      dori0123_001: '3.6', // dori0123_001 is 3.6% of the world
      dori0123_123: '6.0', // dori0123_123 is 6% of middle earth
      dori0123_ER: '75.0', // dori0123_ER is 75% of ER
      dori0123: undefined,
      ER: '8.0', // ER in 123
      HA: '52.0', // HA in 123
      sjn_001: '22.4',
      sjn_123: '37.4',
      sjn_BE: '77.5',
      sjn_ER: '80.0',
      sjn_Teng_001: '18.0',
      sjn_Teng_123: '30.0',
      sjn_Teng_BE: '75.0',
      sjn: undefined,
      Teng: undefined,
      tolkorth: undefined,
    });
  });
});

describe('getObjectPopulationPercentInBiggestDescendantLanguage', () => {
  it('returns population percent in biggest descendant language for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getObjectPopulationPercentInBiggestDescendantLanguage(obj as ObjectData)?.toFixed(1),
      ]),
    );
    expect(results).toEqual({
      '001': '22.4', // size of middle earth compared to world
      '123': '37.4', // Beleriand is the biggest region in middle earth with this limited data
      AM: undefined,
      BE: '77.5', // sjn_BE is 77.5% of BE -- increased because of the be0590 census
      be0590: undefined,
      dori0123_001: undefined,
      dori0123_123: undefined,
      dori0123_ER: undefined,
      dori0123: undefined,
      ER: '80.0', // sjn_ER is 80% of ER
      HA: undefined,
      sjn_001: undefined,
      sjn_123: undefined,
      sjn_BE: undefined,
      sjn_ER: undefined,
      sjn_Teng_001: undefined,
      sjn_Teng_123: undefined,
      sjn_Teng_BE: undefined,
      sjn: undefined,
      Teng: undefined,
      tolkorth: undefined,
    });
  });
});

describe('getObjectPopulationRelativeToOverallLanguageSpeakers', () => {
  it('returns population relative to overall language speakers for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getObjectPopulationRelativeToOverallLanguageSpeakers(obj as ObjectData)?.toFixed(1),
      ]),
    );
    expect(results).toEqual({
      '001': undefined,
      '123': undefined,
      AM: undefined,
      BE: undefined,
      be0590: undefined,
      dori0123: '16.0',
      dori0123_001: '100.0',
      dori0123_123: '100.0',
      dori0123_ER: '100.0',
      ER: undefined,
      HA: undefined,
      sjn_001: '100.0',
      sjn_123: '100.0',
      sjn_BE: '82.9',
      sjn_ER: '17.1',
      sjn_Teng_001: '80.2',
      sjn_Teng_123: '80.2',
      sjn_Teng_BE: '80.2',
      sjn: undefined,
      Teng: undefined,
      tolkorth: undefined,
    });
  });
});

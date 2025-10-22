import { describe, it, expect } from 'vitest';

import { LanguageSource } from '@entities/language/LanguageTypes';
import {
  getObjectPercentOfTerritoryPopulation,
  getObjectPopulation,
  getObjectPopulationAttested,
  getObjectPopulationOfDescendents,
  getObjectPopulationPercentInBiggestDescendentLanguage,
  getObjectPopulationRelativeToOverallLanguageSpeakers,
} from '@entities/lib/getObjectPopulation';
import { ObjectData } from '@entities/types/DataTypes';

import { getMockedObjects } from '@tests/MockObjects';

const mockedObjects = getMockedObjects();

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
      ER: 2400,
      HA: 15600,
      Teng: 9000, // all from sjn_Teng_BE
      dori0123: 2500,
      dori0123_001: 1800,
      dori0123_123: 1800,
      dori0123_ER: 1800,
      be0590: 12000,
      sjn: 24000,
      sjn_001: 10920,
      sjn_123: 10920,
      sjn_Teng_001: 9000,
      sjn_Teng_123: 9000,
      sjn_Teng_BE: 9000,
      sjn_ER: 1920,
      sjn_BE: 9000,
      tolkorth: 24000, // Estimated from sjn
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
      sjn_BE: 9000,
      sjn_ER: 1920, // no census but using the data from the locale database

      // Regional locales have data because they are summed up from the locales inside
      dori0123_001: 1800,
      dori0123_123: 1800,
      dori0123_ER: 1800,
      sjn_001: 10920,
      sjn_123: 10920,
      sjn_Teng_001: 9000,
      sjn_Teng_123: 9000,
      sjn_Teng_BE: 9000,

      // No data
      tolkorth: undefined,
    });
  });
});

describe('getObjectPopulationOfDescendents', () => {
  it('returns population of descendents for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getObjectPopulationOfDescendents(obj as ObjectData, LanguageSource.All),
      ]),
    );
    expect(results).toEqual({
      '001': undefined,
      '123': undefined,
      Teng: undefined, // all from sjn_Teng_BE
      ER: undefined,
      HA: undefined,
      BE: undefined,
      dori0123: 1, // 1 from being a leaf node
      dori0123_001: undefined,
      dori0123_123: undefined,
      dori0123_ER: undefined,
      be0590: undefined,
      sjn: 2502, // From dori0123 + 2 for each node
      sjn_001: undefined,
      sjn_123: undefined,
      sjn_Teng_001: undefined,
      sjn_Teng_123: undefined,
      sjn_Teng_BE: undefined,
      sjn_ER: undefined,
      sjn_BE: undefined,
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
      Teng: undefined,
      ER: '8.0', // ER in 123
      HA: '52.0', // HA in 123
      BE: '40.0', // BE in 123
      dori0123: undefined,
      dori0123_001: '3.6', // dori0123_001 is 3.6% of the world
      dori0123_123: '6.0', // dori0123_123 is 6% of middle earth
      dori0123_ER: '75.0', // dori0123_ER is 75% of ER
      be0590: undefined,
      sjn: undefined,
      sjn_001: '21.8',
      sjn_123: '36.4',
      sjn_Teng_001: '18.0',
      sjn_Teng_123: '30.0',
      sjn_Teng_BE: '75.0',
      sjn_ER: '80.0',
      sjn_BE: '75.0',
      tolkorth: undefined,
    });
  });
});

describe('getObjectPopulationPercentInBiggestDescendentLanguage', () => {
  it('returns population percent in biggest descendent language for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [
        obj.ID,
        getObjectPopulationPercentInBiggestDescendentLanguage(obj as ObjectData)?.toFixed(1),
      ]),
    );
    expect(results).toEqual({
      '001': '21.8', // size of middle earth compared to world
      '123': '36.4', // Beleriand is the biggest region in middle earth with this limited data
      AM: undefined,
      Teng: undefined,
      ER: '80.0', // sjn_ER is 80% of ER
      BE: '75.0', // sjn_BE is 75% of BE
      dori0123: undefined,
      dori0123_001: undefined,
      dori0123_123: undefined,
      dori0123_ER: undefined,
      be0590: undefined,
      sjn: undefined,
      sjn_001: undefined,
      sjn_123: undefined,
      sjn_Teng_001: undefined,
      sjn_Teng_123: undefined,
      sjn_Teng_BE: undefined,
      sjn_ER: undefined,
      sjn_BE: undefined,
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
      Teng: undefined,
      ER: undefined,
      BE: undefined,
      dori0123: '10.4',
      dori0123_001: '72.0',
      dori0123_123: '72.0',
      dori0123_ER: '72.0',
      be0590: undefined,
      sjn: undefined,
      sjn_001: '45.5',
      sjn_123: '45.5',
      sjn_Teng_001: '37.5',
      sjn_Teng_123: '37.5',
      sjn_Teng_BE: '37.5',
      sjn_ER: '8.0',
      sjn_BE: '37.5',
      tolkorth: undefined,
    });
  });
});

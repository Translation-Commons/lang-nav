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
      '001': 30000, // recomputed, reduced to the 3 countries we have data for BE, HA, ER
      '123': 30000, // recomputed, reduced to the 3 countries we have data for BE, HA, ER
      Teng: 9000, // all from sjn_Teng_BE
      ER: 2400,
      HA: 15600,
      BE: 12000,
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
      '001': 1000000,
      '123': 30000,
      Teng: undefined, // not attested, derived from sjn_Teng_BE
      ER: 2400,
      HA: 15600,
      BE: 12000,
      dori0123: 2500,
      dori0123_001: undefined, // regional locale, no census
      dori0123_123: undefined, // regional locale, no census
      dori0123_ER: undefined, // no dori0123dova census
      be0590: 12000,
      sjn: 24000,
      sjn_001: undefined, // regional locale, no census
      sjn_123: undefined, // regional locale, no census
      sjn_Teng_001: undefined, // regional locale, no census
      sjn_Teng_123: undefined, // regional locale, no census
      sjn_Teng_BE: undefined, // not provided by the census
      sjn_ER: undefined, // no census
      sjn_BE: 9000,
      tolkorth: undefined, // missing language data
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
      '123': '100.0', // middle earth is the only region in this limited data
      Teng: undefined,
      ER: '8.0', // ER in 123
      HA: '52.0', // HA in 123
      BE: '40.0', // BE in 123
      dori0123: undefined,
      dori0123_001: '0.2', // dori0123_001 is 0.2% of the world
      dori0123_123: '6.0', // dori0123_123 is 6% of middle earth
      dori0123_ER: '75.0', // dori0123_ER is 75% of ER
      be0590: undefined,
      sjn: undefined,
      sjn_001: '1.1',
      sjn_123: '36.4',
      sjn_Teng_001: '0.9',
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
      '001': '1.1', // middle earth is 1.1% the population of the world in this estimate
      '123': '36.4', // Beleriand is the biggest region in middle earth with this limited data
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

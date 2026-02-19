/**
 * Testing getters from simulated data -- this is not accurate to real data but intentionally a hypothetical subset
 * to test various edge cases.
 */

import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';

import {
  getCountOfCensuses,
  getCountOfLanguages,
  getCountOfWritingSystems,
  getDepth,
  getObjectDate,
  getObjectLiteracy,
  getObjectMostImportantLanguageName,
} from '@entities/lib/getObjectMiscFields';

const mockedObjects = getFullyInstantiatedMockedObjects();

describe('getObjectLiteracy', () => {
  it('returns literacy for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getObjectLiteracy(obj)?.toFixed(1)]),
    );
    expect(results).toEqual({
      '001': '96.2', // averaged from Aman & Middle Earth by computeContainedTerritoryStats
      '123': '95.1', // averaged from territories by computeContainedTerritoryStats
      AM: '98.0',
      BE: '90.0',
      ER: '95.0',
      HA: '99.0',
      Teng: undefined,
      be0590: undefined,
      dori0123: '95.0',
      dori0123_001: '95.0', // Computed from constituent locales
      dori0123_123: '95.0',
      dori0123_ER: '95.0', // Locales use the country's literacy rate
      sjn: '90.9', // averaged from locales
      sjn_001: '91.0',
      sjn_123: '91.0',
      sjn_Teng_001: '90.0',
      sjn_Teng_123: '90.0',
      sjn_Teng_BE: '90.0',
      sjn_ER: '95.0',
      sjn_BE: '90.0',
      tolkorth: undefined,
    });
  });
});

describe('getObjectMostImportantLanguageName', () => {
  it('returns most important language name for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getObjectMostImportantLanguageName(obj)]),
    );
    expect(results).toEqual({
      '001': 'Sindarin',
      '123': 'Sindarin',
      AM: undefined,
      BE: 'Sindarin',
      ER: 'Sindarin',
      HA: undefined,
      Teng: 'Sindarin',
      be0590: undefined,
      dori0123: 'Doriathrin',
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

describe('getObjectDate', () => {
  it('returns date for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getObjectDate(obj)?.toISOString()]),
    );
    expect(results).toEqual({
      '001': undefined,
      '123': undefined,
      AM: undefined,
      BE: undefined,
      ER: undefined,
      HA: undefined,
      Teng: undefined,
      be0590: '2000-01-02T00:00:00.000Z',
      dori0123: undefined,
      dori0123_001: undefined,
      dori0123_123: undefined,
      dori0123_ER: undefined,
      sjn: undefined,
      sjn_001: undefined,
      sjn_123: undefined,
      sjn_Teng_001: undefined,
      sjn_Teng_123: undefined,
      sjn_Teng_BE: undefined,
      sjn_ER: undefined,
      sjn_BE: undefined,
      tolkorth: '2020-01-01T00:00:00.000Z',
    });
  });
});

describe('getCountOfLanguages', () => {
  it('returns count of languages for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getCountOfLanguages(obj)]),
    );
    expect(results).toEqual({
      '001': 2, // sjn, dori0123
      '123': 2, // sjn, dori0123
      AM: undefined,
      BE: 1, // sjn
      ER: 2, // sjn, dori0123
      HA: undefined,
      Teng: 2, // sjn, dori0123
      be0590: 1, // sjn
      dori0123: 0,
      dori0123_001: 1, // dori0123_123
      dori0123_123: 1, // dori0123_ER
      dori0123_ER: 0,
      sjn: 1, // dori0123
      sjn_001: 3, // sjn_123, sjn_Teng_001, dori0123_001
      sjn_123: 4, // sjn_ER, sjn_BE, sjn_Teng_123, dori0123_123
      sjn_Teng_001: 1, // sjn_Teng_123
      sjn_Teng_123: 1, // sjn_Teng_BE
      sjn_Teng_BE: 0,
      sjn_BE: 1, // sjn_Teng_BE is more specific
      sjn_ER: 1, // dori0123_ER
      tolkorth: 2, // eng, spa
    });
  });
});

describe('getCountOfWritingSystems', () => {
  it('returns count of writing systems for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getCountOfWritingSystems(obj)]),
    );
    expect(results).toEqual({
      '001': 1, // Teng is used by sjn_Teng_001
      '123': 1, // Teng
      AM: 0, // No locales, so no writing system records
      BE: 1, // Teng is used by sjn_Teng_BE
      ER: 1, // Teng is used by sjn_ER (implied from language primaryWritingSystem)
      HA: 0,
      Teng: 1, // it is a writing system
      be0590: undefined, // not defined for censuses
      dori0123: 1, // primary writing system is Teng
      dori0123_001: 1, // falling back to the language's primary writing system Tengwar
      dori0123_123: 1, // falling back
      dori0123_ER: 1, // falling back
      sjn: 1, // primary writing system is Teng
      sjn_001: 1, // falling back
      sjn_123: 1, // falling back
      sjn_Teng_001: 1, // explicit writing system: Teng
      sjn_Teng_123: 1,
      sjn_Teng_BE: 1,
      sjn_BE: 1, // falling back
      sjn_ER: 1, // falling back
      tolkorth: 0, // No writing systems specified
    });
  });
});

describe('getCountOfCensuses', () => {
  it('returns count of censuses for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getCountOfCensuses(obj)]),
    );
    expect(results).toEqual({
      '001': 0, // no censuses for this territory
      '123': 0, // no censuses for this territory
      AM: 0, // no censuses for this territory
      BE: 1, // territory for be0590
      ER: 0,
      HA: 0,
      Teng: undefined,
      be0590: 1, // be0590 is a census
      dori0123: undefined, // not defined for languages
      dori0123_001: 0, // not in any censuses
      dori0123_123: 0,
      dori0123_ER: 0,
      sjn: undefined, // not defined for languages
      sjn_001: 0, // not in any censuses
      sjn_123: 0,
      sjn_Teng_001: 0,
      sjn_Teng_123: 0,
      sjn_Teng_BE: 0,
      sjn_BE: 1, // in be0590
      sjn_ER: 0, // not in any censuses
      tolkorth: undefined,
    });
  });
});

describe('getDepth', () => {
  it('returns depth for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getDepth(obj)]),
    );
    expect(results).toEqual({
      '001': 0, // top-level territory
      '123': 1, // child of 001
      AM: 1, // child of 001
      BE: 2, // child of 123
      ER: 2, // child of 123
      HA: 2, // child of 123
      Teng: 0, // top-level writing system
      be0590: undefined,
      dori0123: 1, // child of sjn
      dori0123_001: 1, // locale with territory
      dori0123_123: 1,
      dori0123_ER: 1,
      sjn: 0, // top-level language
      sjn_001: 1, // locale with territory
      sjn_123: 1,
      sjn_Teng_001: 2, // locale with territory and explicit writing system
      sjn_Teng_123: 2,
      sjn_Teng_BE: 2,
      sjn_ER: 1, // locale with territory
      sjn_BE: 1,
      tolkorth: undefined,
    });
  });
});

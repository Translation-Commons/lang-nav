/**
 * Testing getters from simulated data -- this is not accurate to real data but intentionally a hypothetical subset
 * to test various edge cases.
 */

import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';

import {
  getCountOfLanguages,
  getCountOfTerritories,
  getObjectDate,
  getObjectLiteracy,
  getObjectMostImportantLanguageName,
} from '@entities/lib/getObjectMiscFields';

const mockedObjects = getFullyInstantiatedMockedObjects();

describe('getObjectLiteracy', () => {
  it('returns population for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getObjectLiteracy(obj)?.toFixed(1)]),
    );
    expect(results).toEqual({
      '001': '96.2', // averaged from Aman & Middle Earth by computeContainedTerritoryStats
      '123': '95.1', // averaged from territories by computeContainedTerritoryStats
      AM: '98.0',
      Teng: undefined,
      ER: '95.0',
      HA: '99.0',
      BE: '90.0',
      dori0123: '95.0',
      dori0123_001: '95.0', // Computed from constituent locales
      dori0123_123: '95.0',
      dori0123_ER: '95.0', // Locales use the country's literacy rate
      be0590: undefined,
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
      Teng: 'Sindarin',
      AM: undefined,
      ER: 'Sindarin',
      BE: 'Sindarin',
      HA: undefined,
      dori0123: 'Doriathrin',
      dori0123_001: 'Doriathrin',
      dori0123_123: 'Doriathrin',
      dori0123_ER: 'Doriathrin',
      be0590: undefined,
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
      Teng: undefined,
      ER: undefined,
      BE: undefined,
      dori0123: undefined,
      dori0123_001: undefined,
      dori0123_123: undefined,
      dori0123_ER: undefined,
      be0590: '2000-01-02T00:00:00.000Z',
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
      Teng: 2, // sjn, dori0123
      AM: undefined,
      ER: 2, // sjn, dori0123
      HA: undefined,
      BE: 1, // sjn
      dori0123: 0,
      dori0123_001: 1, // dori0123_123
      dori0123_123: 1, // dori0123_ER
      dori0123_ER: 0,
      be0590: 1, // sjn
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

describe('getCountOfTerritories', () => {
  it('returns count of territories for objects', () => {
    const results = Object.fromEntries(
      Object.values(mockedObjects).map((obj) => [obj.ID, getCountOfTerritories(obj)]),
    );
    expect(results).toEqual({
      '001': 2, // 123, AM
      '123': 3, // ER, BE, HA
      Teng: undefined,
      AM: 0, // no territories contained
      ER: 0,
      HA: 0,
      BE: 0,
      dori0123: 1, // ER
      dori0123_001: undefined, // not defined for locales
      dori0123_123: undefined,
      dori0123_ER: undefined,
      be0590: undefined,
      sjn: 2, // ER, BE
      sjn_001: undefined, // not defined for locales
      sjn_123: undefined,
      sjn_Teng_001: undefined,
      sjn_Teng_123: undefined,
      sjn_Teng_BE: undefined,
    });
  });
});

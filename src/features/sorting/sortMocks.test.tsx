import { describe, expect, it } from 'vitest';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { getMockedObjects } from '@tests/MockObjects';

import { getSortFunctionParameterized } from './sort';
import { SortBehavior, SortBy } from './SortTypes';

const mockedObjects = getMockedObjects();

describe('getSortByParameterized', () => {
  it('sortBy: Code', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(SortBy.Code, LanguageSource.All, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '001',
      '123',
      'BE',
      'ER',
      'HA',
      'Teng',
      'be0590',
      'dori0123',
      'dori0123_001',
      'dori0123_123',
      'dori0123_ER',
      'sjn',
      'sjn_001',
      'sjn_123',
      'sjn_BE',
      'sjn_ER',
      'sjn_Teng_001',
      'sjn_Teng_123',
      'sjn_Teng_BE',
      'tolkorth',
    ]);
  });

  it('sortBy: Name', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(SortBy.Name, LanguageSource.All, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '001', // Arda
      'BE', // Beleriand
      'be0590', // Beleriand Census 590
      'dori0123', // Doriathrin
      'dori0123_001', // Doriathrin (Arda)
      'dori0123_ER', // Doriathrin (Eriador)
      'dori0123_123', // Doriathrin (Middle Earth)
      'ER', // Eriador
      'HA', // Harad
      '123', // Middle Earth
      'sjn', // Sindarin
      'sjn_001', // Sindarin (Arda)
      'sjn_Teng_001', // Sindarin (Arda, Tengwar)
      'sjn_BE', // Sindarin (Beleriand)
      'sjn_Teng_BE', // Sindarin (Beleriand, Tengwar)
      'sjn_ER', // Sindarin (Eriador)
      'sjn_123', // Sindarin (Middle Earth)
      'sjn_Teng_123', // Sindarin (Middle Earth, Tengwar)
      'Teng', // Tengwar
      'tolkorth', // Tolkienian Transcribed Orthography
    ]);
  });

  it('sortBy: Endonym', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.Endonym,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '001', // arda
      'BE', // beˈlerjand
      'dori0123', // dorjaθɪn
      '123', // endor instead of Middle Earth
      'ER', // erjador
      'HA', // ha-rad
      'sjn', // sɪndarɪn
      'Teng', // tîw
      // All below have no provided endonym, stable to input order
      'be0590',
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER',
      'sjn_Teng_BE',
      'tolkorth',
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
    ]);
  });

  it('sortBy: Endonym. Also, reversed', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.Endonym,
      LanguageSource.All,
      SortBehavior.Reverse,
    );
    // Not exactly the reverse of the above test because
    //   1) undefined values stay at the end
    //   2) sort is stable to the input order
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'Teng', // tîw
      'sjn', // sɪndarɪn
      'HA', // ha-rad
      'ER', // erjador
      '123', // endor instead of Middle Earth
      'dori0123', // dorjaθɪn
      'BE', // beˈlerjand
      '001', // arda
      // All below have no provided endonym, stable to input order
      'be0590',
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER',
      'sjn_Teng_BE',
      'tolkorth',
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
    ]);
  });

  it('sortBy: Population', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.Population,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '123',
      '001',
      'sjn',
      'tolkorth',
      'HA',
      'BE',
      'be0590',
      'sjn_123',
      'sjn_001',
      'sjn_BE',
      'Teng',
      'sjn_Teng_BE',
      'sjn_Teng_123',
      'sjn_Teng_001',
      'dori0123',
      'ER',
      'sjn_ER',
      'dori0123_ER',
      'dori0123_123',
      'dori0123_001',
    ]);
  });

  it('sortBy: Population. Also, reversed', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.Population,
      LanguageSource.All,
      SortBehavior.Reverse,
    );
    // Not exactly the reverse of the above test because
    //   2) sort is stable to the input order
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'dori0123_ER',
      'dori0123_123',
      'dori0123_001',
      'sjn_ER',
      'ER',
      'dori0123',
      'sjn_BE',
      'Teng',
      'sjn_Teng_BE',
      'sjn_Teng_123',
      'sjn_Teng_001',
      'sjn_123',
      'sjn_001',
      'BE',
      'be0590',
      'HA',
      'sjn',
      'tolkorth',
      '123',
      '001',
    ]);
  });

  it('sortBy: PopulationAttested', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.PopulationOfDescendents,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'sjn',
      'dori0123',
      // All undefined after this, stable to input order
      'BE',
      'ER',
      'HA',
      '123',
      '001',
      'be0590',
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER',
      'Teng',
      'sjn_Teng_BE',
      'tolkorth',
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
    ]);
  });

  it('sortBy: PercentOfTerritoryPopulation', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.PercentOfTerritoryPopulation,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '123', // 100.0, middle earth is the only region in this limited data
      'sjn_ER', // 80.0,
      'sjn_BE', // 75.0,
      'dori0123_ER', // 75.0, // dori0123_ER is 75% of ER
      'sjn_Teng_BE', // 75.0,
      'HA', // 52.0 of middle earth
      'BE', // 40.0 of middle earth
      'sjn_123', // 36.4 of middle earth
      'sjn_Teng_123', // 30.0 of middle earth
      'ER', // 8.0 of middle earth
      'dori0123_123', // 6.0 of middle earth
      'sjn_001', // 1.1 of world
      'sjn_Teng_001', // 0.9 of world
      'dori0123_001', // 0.2 of world
      'sjn', // undefined,
      'dori0123', // undefined,
      '001', // undefined, // world is not contained in a larger territory
      'be0590', // undefined,
      'Teng', // undefined,
      'tolkorth', // undefined,
    ]);
  });

  it('sortBy: PercentOfOverallLanguageSpeakers', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.PercentOfOverallLanguageSpeakers,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'dori0123_ER', // 72.0
      'dori0123_123',
      'dori0123_001',
      'sjn_123', // 45.5
      'sjn_001',
      'sjn_BE', // 37.5
      'sjn_Teng_BE',
      'sjn_Teng_123',
      'sjn_Teng_001',
      'dori0123', // 10.4
      'sjn_ER', // 8.0
      'sjn',
      // All below undefined, stable to input order
      'BE',
      'ER',
      'HA',
      '123',
      '001',
      'be0590',
      'Teng',
      'tolkorth',
    ]);
  });

  it('sortBy: PopulationPercentInBiggestDescendentLanguage', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.PopulationPercentInBiggestDescendentLanguage,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'ER',
      'BE',
      '123',
      '001',
      // All undefined after this, stable to input order
      'sjn',
      'dori0123',
      'HA',
      'be0590',
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER',
      'Teng',
      'sjn_Teng_BE',
      'tolkorth',
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
    ]);
  });

  it('sortBy: Language', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.Language,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'dori0123', // Doriathrin
      'dori0123_ER',
      'dori0123_123',
      'dori0123_001',
      'sjn', // Sindarin
      'BE',
      'ER',
      '123',
      '001',
      'sjn_BE',
      'sjn_ER',
      'sjn_Teng_BE',
      'sjn_123',
      'sjn_Teng_123',
      'sjn_001',
      'sjn_Teng_001',
      // All below have no associated language, stable to input order
      'HA',
      'be0590',
      'Teng',
      'tolkorth',
    ]);
  });

  it('sortBy: Date', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(SortBy.Date, LanguageSource.All, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'tolkorth', // 2020-01-01
      'be0590', // 2000-01-02
      // All below have no associated date, stable to input order
      'sjn',
      'dori0123',
      'BE',
      'ER',
      'HA',
      '123',
      '001',
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER',
      'Teng',
      'sjn_Teng_BE',
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
    ]);
  });

  it('sortBy: CountOfLanguages', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.CountOfLanguages,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'ER', // 2 languages: sjn, dori0123
      '123', // 2 languages: sjn, dori0123
      '001', // 2 languages: sjn, dori0123
      'tolkorth', // 2 languages: eng, spa
      'sjn_123', // 2 locales: sjn_ER, sjn_BE
      'sjn', // 1 dialect: dori0123
      'BE', // 1 locale: sjn_BE
      'be0590', // 1 language: sjn
      'Teng', // 1 language: sjn
      'sjn_Teng_123', // 1 locale: sjn_Teng_BE
      'dori0123_123', // 1 locale: dori0123_ER
      'sjn_001', // 1 locale: sjn_123
      'sjn_Teng_001', // 1 locale: sjn_Teng_123
      'dori0123_001', // 1 locale: dori0123_123
      'dori0123', // 0 dialects
      'HA', // undefined
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER',
      'sjn_Teng_BE',
    ]);
  });

  it('sortBy: CountOfTerritories', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.CountOfTerritories,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '123', // 3 territories: ER, BE, HA
      'sjn', // 2 territories: ER, BE
      'dori0123', // 1 territory: ER
      '001', // 1 territory: 123
      'BE', // 0 contained territories (eg. dependencies)
      'ER',
      'HA',
      // undefined
      'be0590', // undefined for censuses
      'sjn_BE', // undefined for locales
      'sjn_ER',
      'dori0123_ER',
      'Teng', // undefined for writing systems
      'sjn_Teng_BE',
      'tolkorth', // undefined for variant tags
      'sjn_123', // undefined for regional locales
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
    ]);
  });

  it('sortBy: Literacy', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      SortBy.Literacy,
      LanguageSource.All,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'HA', // 99.0
      '123', // 95.1, averaged from territories by computeContainedTerritoryStats
      '001', // 95.1
      'dori0123', // 95.0, only in Eriador
      'ER', // 95.0 literacy rate for Eriador
      'sjn_ER', // 95.0
      'dori0123_ER', // 75.0
      'dori0123_123',
      'dori0123_001',
      'sjn_123', // 90.9, averaged from locales
      'sjn_001',
      'sjn',
      'BE', // 90.0 literacy rate for Beleriand
      'sjn_BE',
      'sjn_Teng_BE',
      'sjn_Teng_123',
      'sjn_Teng_001',
      // All below undefined, stable to input order
      'be0590',
      'Teng',
      'tolkorth',
    ]);
  });
});

// '001': '95.1', // averaged from territories by computeContainedTerritoryStats
// '123': '95.1', // averaged from territories by computeContainedTerritoryStats
// Teng: undefined,
// ER: '95.0',
// HA: '99.0',
// BE: '90.0',
// dori0123: '95.0',
// dori0123_001: undefined,
// dori0123_123: undefined,
// dori0123_ER: undefined,
// be0590: undefined,
// sjn: '90.9', // averaged from locales

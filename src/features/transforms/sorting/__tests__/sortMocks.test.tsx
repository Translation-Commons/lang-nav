import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';
import Field from '@features/transforms/fields/Field';

import { ObjectData } from '@entities/types/DataTypes';

import { getSortFunctionParameterized } from '../sort';
import { SortBehavior } from '../SortTypes';

const mockedObjects = getFullyInstantiatedMockedObjects();

describe('getSortByParameterized', () => {
  it('sortBy: None', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.None, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      // Original input order
      '123',
      'sjn',
      'dori0123',
      'BE',
      'ER',
      'HA',
      'AM',
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

  it('sortBy: Code', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.Code, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '001',
      '123',
      'AM',
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
    const sort = getSortFunctionParameterized(Field.Name, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'AM', // Aman
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
    const sort = getSortFunctionParameterized(Field.Endonym, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'AM', // aman
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
    const sort = getSortFunctionParameterized(Field.Endonym, SortBehavior.Reverse);
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
      'AM', // aman
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
    const sort = getSortFunctionParameterized(Field.Population, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '001',
      '123',
      'Teng',
      'AM',
      'HA',
      'BE',
      'be0590',
      'sjn',
      'tolkorth', // Potential population same as sjn
      'sjn_123',
      'sjn_001',
      'sjn_BE',
      'sjn_Teng_BE',
      'sjn_Teng_123',
      'sjn_Teng_001',
      'ER',
      'sjn_ER',
      'dori0123',
      'dori0123_ER',
      'dori0123_123',
      'dori0123_001',
    ]);
  });

  it('sortBy: Population. Also, reversed', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.Population, SortBehavior.Reverse);
    // Not exactly the reverse of the above test because
    //   2) sort is stable to the input order
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'dori0123',
      'dori0123_ER',
      'dori0123_123',
      'dori0123_001',
      'sjn_ER',
      'ER',
      'sjn_Teng_BE', // lower than sjn_BE because not updated by census
      'sjn_Teng_123',
      'sjn_Teng_001',
      'sjn_BE', // increased because of the be0590 locale
      'sjn',
      'tolkorth',
      'sjn_123',
      'sjn_001',
      'BE',
      'be0590',
      'HA',
      'AM',
      'Teng',
      '123',
      '001',
    ]);
  });

  it('sortBy: PopulationDirectlySourced', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.PopulationDirectlySourced, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      // These entities were created with a rough population estimate, before it was computed by algorithms
      '001',
      '123',
      'sjn', // sjn was created with a high estimate
      'AM', // Most countries have a high value
      'HA',
      'BE',
      'be0590',
      'sjn_123', // sjn locales were created with lower estimates
      'sjn_001',
      'sjn_BE',
      'sjn_Teng_BE',
      'sjn_Teng_123',
      'sjn_Teng_001',
      'dori0123',
      'ER',
      'sjn_ER',
      'dori0123_ER',
      'dori0123_123',
      'dori0123_001',
      // All undefined after this, stable to input order
      'Teng',
      'tolkorth',
    ]);
  });

  it('sortBy: PopulationOfDescendants', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.PopulationOfDescendants, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'sjn', // 1800 from dori0123
      '123',
      'dori0123',
      // All undefined after this, stable to input order
      'BE',
      'ER',
      'HA',
      'AM',
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
      Field.PercentOfTerritoryPopulation,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'be0590', // 100.0% of Beleriand in the census
      'sjn_ER', // 80.0,
      'sjn_BE', // 75.0,
      'dori0123_ER', // 75.0, // dori0123_ER is 75% of ER
      'sjn_Teng_BE', // 75.0,
      '123', // 60% of world
      'HA', // 52.0 of middle earth
      'BE', // 40.0 of middle earth
      'AM', // 40 of world
      'sjn_123', // 36.4 of middle earth
      'sjn_Teng_123', // 30.0 of middle earth
      'sjn_001', // 21.8 of world
      'sjn_Teng_001', // 18 of world
      'ER', // 8.0 of middle earth
      'dori0123_123', // 6.0 of middle earth
      'dori0123_001', // 0.2 of world
      'sjn', // undefined,
      'dori0123', // undefined,
      '001', // undefined, // world is not contained in a larger territory
      'Teng', // undefined,
      'tolkorth', // undefined,
    ]);
  });

  it('sortBy: PercentOfOverallLanguageSpeakers', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      Field.PercentOfOverallLanguageSpeakers,
      SortBehavior.Normal,
    );
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'dori0123_ER', // 10.0
      'sjn_123',
      'dori0123_123',
      'sjn_001',
      'dori0123_001',
      'sjn_BE', // 82.9
      'sjn_Teng_BE', // 80.2
      'sjn_Teng_123',
      'sjn_Teng_001',
      'sjn_ER', // 17.1
      'dori0123', // 16.0
      // All below undefined, stable to input order
      '123',
      'sjn',
      'BE',
      'ER',
      'HA',
      'AM',
      '001',
      'be0590',
      'Teng',
      'tolkorth',
    ]);
  });

  it('sortBy: PopulationPercentInBiggestDescendantLanguage', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(
      Field.PopulationPercentInBiggestDescendantLanguage,
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
      'AM',
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
    const sort = getSortFunctionParameterized(Field.Language, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'dori0123', // Doriathrin
      'dori0123_ER',
      'dori0123_123',
      'dori0123_001',
      '123', // Sindarin
      'sjn',
      'BE',
      'ER',
      '001',
      'sjn_BE',
      'sjn_ER',
      'Teng',
      'sjn_Teng_BE',
      'tolkorth',
      'sjn_123',
      'sjn_Teng_123',
      'sjn_001',
      'sjn_Teng_001',
      // All below have no associated language, stable to input order
      'HA',
      'AM',
      'be0590',
    ]);
  });

  it('sortBy: Writing System', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.WritingSystem, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      // Tengwar
      '123',
      'sjn',
      'dori0123',
      'BE',
      'ER',
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
      // All below have no associated writing system, stable to input order
      'HA',
      'AM',
      'be0590',
      'tolkorth',
    ]);
  });

  it('sortBy: Territory', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.Territory, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'AM', // Aman
      '001', // Arda
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
      'sjn', // Beleriand
      'BE',
      'be0590',
      'sjn_BE',
      'Teng',
      'sjn_Teng_BE',
      'dori0123',
      'ER', // Eriador
      'sjn_ER',
      'dori0123_ER',
      'HA', // Harad
      '123', // Middle Earth
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      // All below have no associated territory, stable to input order
      'tolkorth',
    ]);
  });

  it('sortBy: Date', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.Date, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'tolkorth', // 2020-01-01
      'be0590', // 2000-01-02
      // All below have no associated date, stable to input order
      '123',
      'sjn',
      'dori0123',
      'BE',
      'ER',
      'HA',
      'AM',
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
    const sort = getSortFunctionParameterized(Field.CountOfLanguages, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'sjn_123', // 4 locales: sjn_ER, sjn_BE, sjn_Teng_123, dori0123_123
      'sjn_001', // 3 locales: sjn_123, sjn_Teng_001, dori0123_001
      '123', // 2 languages: sjn, dori0123
      'ER', // 2 languages: sjn, dori0123
      '001', // 2 languages: sjn, dori0123
      'Teng', // 2 languages: sjn, dori0123
      'tolkorth', // 2 languages: eng, spa
      'sjn', // 1 dialect: dori0123
      'BE', // 1 locale: sjn_BE
      'be0590', // 1 language: sjn
      'sjn_BE', // 1 locale: sjn_Teng_BE
      'sjn_ER', // 1 locale: dori0123_ER
      'sjn_Teng_123', // 1 locale: sjn_Teng_BE
      'dori0123_123', // 1 locale: dori0123_ER
      'sjn_Teng_001', // 1 locale: sjn_Teng_123,
      'dori0123_001', // 1 locale: dori0123_123
      'dori0123', // 0 dialects
      'dori0123_ER',
      'sjn_Teng_BE',
      'HA', // undefined
      'AM',
    ]);
  });

  it('sortBy: CountOfWritingSystems', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.CountOfWritingSystems, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      // 1 writing system: Tengwar
      '123',
      'sjn',
      'dori0123',
      'BE',
      'ER',
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
      // 0 directly linked writing systems
      'HA',
      'AM',
      'tolkorth',
      'be0590',
    ]);
  });

  it('sortBy: CountOfCountries', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.CountOfCountries, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '001', // 4 countries: AM, BE, ER, HA
      '123', // 3 countries: ER, BE, HA
      'sjn', // 2 countries: ER, BE
      'Teng',
      'sjn_123',
      'sjn_001', // could be up to 4 countries but the language is only declared in 2
      'dori0123', // 1 country: ER
      'BE', // 1 it is its own country
      'ER',
      'HA',
      'AM',
      'be0590', // 1 its for BE
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER', // 1 country: ER
      'sjn_Teng_BE',
      'sjn_Teng_123', // potentially more countries but only 1 declared from sjn_Teng_BE
      'dori0123_123',
      'sjn_Teng_001',
      'dori0123_001',
      // undefined
      'tolkorth',
    ]);
  });

  it('sortBy: CountOfChildTerritories', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.CountOfChildTerritories, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      '123', // 3 territories: ER, BE, HA
      '001', // 2 territories: 123, AM
      'be0590', // 1 territory: BE
      'sjn_BE', // locales with territory codes all have 1 territory
      'sjn_ER',
      'dori0123_ER',
      'sjn_Teng_BE',
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
      'BE', // 0 contained territories (eg. dependencies)
      'ER',
      'HA',
      'AM',
      'tolkorth', // 0 declared territories
      // undefined
      'sjn',
      'dori0123',
      'Teng',
    ]);
  });

  it('sortBy: CountOfCensuses', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.CountOfCensuses, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'BE', // 1, has be0590
      'be0590', // 1, it is a census
      'sjn_BE', // 1, featured in be0590
      '123', // 0 (could have censuses but there are none in the data)
      'ER',
      'HA',
      'AM',
      '001',
      'sjn_ER',
      'dori0123_ER',
      'sjn_Teng_BE',
      'sjn_123',
      'sjn_Teng_123',
      'dori0123_123',
      'sjn_001',
      'sjn_Teng_001',
      'dori0123_001',
      // undefined
      'sjn',
      'dori0123',
      'Teng',
      'tolkorth',
    ]);
  });

  it('sortBy: Literacy', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.Literacy, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      'HA', // 99.0
      'AM', // 98.0
      '001', // 96.2, averaged from Aman & Middle Earth by computeContainedTerritoryStats
      '123', // 95.1, averaged from territories by computeContainedTerritoryStats
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

  it('sortBy: Depth', () => {
    const objects = Object.values(mockedObjects) as ObjectData[];
    const sort = getSortFunctionParameterized(Field.Depth, SortBehavior.Normal);
    expect(objects.sort(sort).map((obj) => obj.ID)).toEqual([
      // Depth 0 (root nodes)
      'sjn',
      '001',
      'Teng',

      // Depth 1
      '123',
      'dori0123',
      'AM',
      'sjn_BE',
      'sjn_ER',
      'dori0123_ER',
      'sjn_123',
      'dori0123_123',
      'sjn_001',
      'dori0123_001',
      'BE',
      'ER',
      'HA',

      // Depth 2
      'sjn_Teng_BE',
      'sjn_Teng_123',
      'sjn_Teng_001',

      // Undefined depth, stable to input order
      'be0590',
      'tolkorth',
    ]);
  });
});

import { describe, expect, it } from 'vitest';

import {
  getDisconnectedMockedObjects,
  getFullyInstantiatedMockedObjects,
  getMockedDataContext,
} from '@features/__tests__/MockObjects';
import { updateObjectsBasedOnDataParams } from '@features/data/compute/updateObjectsBasedOnDataParams';
import { LocaleSeparator, ObjectType } from '@features/params/PageParamTypes';

import {
  getBaseLanguageData,
  LanguageData,
  LanguageSource,
} from '@entities/language/LanguageTypes';
import { ObjectDictionary } from '@entities/types/DataTypes';

import { getExtremeLanguagePaths } from '../LanguagePathsReport';

describe('LanguagePathsReport', () => {
  function generateObjects(): ObjectDictionary {
    // Get regular data and add a language family so there is more data to process
    // Each source will have a different family structure, some of which have cycles
    // Combined: elv -> sjn -> dori0123, elv -> qya (a typical branching tree)
    // ISO: elv -> qya && sjn -> dori0123 -> sjn (a cycle)
    // Glottolog: sjn -> dori0123, sjn -> qya (a tree branching differently, no lang family)
    // CLDR: elv -> sjn -> dori0123 -> elv (a bad cycle but will be missed since there is no root)
    const inputObjects = getDisconnectedMockedObjects();
    const elv: LanguageData = {
      ...getBaseLanguageData('elv', 'Elvish'), // fictional language family code
      nameEndonym: 'ɛlvɪʃ',
      names: ['Elvish', 'Elven Languages', 'ɛlvɪʃ'],
      populationRough: 50000,
      // Only a parent in CLDR to create a cycle there
      CLDR: { parentLanguageCode: 'dori0123' },
    };
    const qya: LanguageData = {
      ...getBaseLanguageData('qya', 'Quenya'), // fictional Elvish language
      nameEndonym: 'kwɛnjɑ',
      names: ['Quenya', 'High Elvish', 'kwɛnjɑ'],
      populationRough: 10000,
      Combined: { parentLanguageCode: 'elv' },
      ISO: { parentLanguageCode: 'elv' },
      Glottolog: { parentLanguageCode: 'sjn' },
      // No parent for CLDR, UNESCO or BCP
    };
    inputObjects['qya'] = qya;
    inputObjects['elv'] = elv;
    // Edit existing mocked languages to change language branching
    if (inputObjects['sjn'].type === ObjectType.Language) {
      inputObjects['sjn'].Combined.parentLanguageCode = 'elv';
      inputObjects['sjn'].ISO.parentLanguageCode = 'dori0123'; // making a loop in ISO
      inputObjects['sjn'].CLDR.parentLanguageCode = 'elv';
      // no parent for Glottolog, UNESCO or BCP
    }
    if (inputObjects['dori0123'].type === ObjectType.Language) {
      inputObjects['dori0123'].Combined.parentLanguageCode = 'sjn';
      inputObjects['dori0123'].ISO.parentLanguageCode = 'sjn';
      inputObjects['dori0123'].CLDR.parentLanguageCode = 'sjn';
      inputObjects['dori0123'].Glottolog.parentLanguageCode = 'sjn';
      // no parent for UNESCO or BCP
    }

    // Generate the data
    return getFullyInstantiatedMockedObjects(inputObjects);
  }

  it('getExtremeLanguagePaths', () => {
    const objects = generateObjects();
    const { allLanguoids, locales, getTerritory } = getMockedDataContext(objects);

    Object.values(LanguageSource).forEach((languageSource) => {
      // This shouldn't throw an error even in the presence of cycles
      updateObjectsBasedOnDataParams(
        allLanguoids,
        locales,
        getTerritory('001')!,
        languageSource,
        LocaleSeparator.Underscore,
      );
      const { orphans, longestPaths, cycles, multipleRoutes } =
        getExtremeLanguagePaths(allLanguoids);

      switch (languageSource) {
        case LanguageSource.Combined:
          // Combined: elv -> sjn -> dori0123, elv -> qya (a typical branching tree)
          expect(orphans).toEqual([]);
          expect(longestPaths).toEqual([['elv', 'sjn', 'dori0123']]);
          expect(cycles).toEqual([]); // there are no cycles
          expect(multipleRoutes).toEqual({});
          break;
        case LanguageSource.ISO:
          // ISO: elv -> qya && sjn -> dori0123 -> sjn (a cycle)
          expect(orphans).toEqual([]);
          expect(longestPaths).toEqual([['elv', 'qya']]);
          expect(cycles).toEqual([['sjn', 'dori0123', 'sjn']]); // cycle between sjn and dori0123
          expect(multipleRoutes).toEqual({});
          break;
        case LanguageSource.Glottolog:
          // Glottolog: sjn -> dori0123, sjn -> qya (a tree branching differently, no lang family)
          expect(orphans).toEqual(['elv']);
          expect(longestPaths).toEqual([['sjn', 'dori0123']]);
          expect(cycles).toEqual([]); // there are no cycles
          expect(multipleRoutes).toEqual({});
          break;
        case LanguageSource.CLDR:
          // CLDR: elv -> sjn -> dori0123 -> elv (a bad cycle but will be missed since there is no root)
          expect(orphans).toEqual(['qya']);
          expect(longestPaths).toEqual([]); // the only long path is a cycle
          expect(cycles).toEqual([['sjn', 'dori0123', 'elv', 'sjn']]);
          expect(multipleRoutes).toEqual({});
          break;
        case LanguageSource.UNESCO: // No connections from these sources, all languages are orphans
        case LanguageSource.BCP:
        case LanguageSource.Ethnologue:
          expect(orphans.join(' ')).toEqual('sjn dori0123 qya elv');
          expect(longestPaths).toEqual([]);
          expect(cycles).toEqual([]); // there are no cycles
          expect(multipleRoutes).toEqual({});
          break;
        default:
          throw new Error(`Unhandled LanguageSource: ${languageSource}`);
      }
    });
  });
});

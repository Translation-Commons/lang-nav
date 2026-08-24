import { describe, expect, it } from 'vitest';

import {
  getDisconnectedMockedEntities,
  getFullyInstantiatedMockedEntities,
  getMockedDataContext,
} from '@features/__tests__/MockEntities';
import { updateEntitiesBasedOnDataParams } from '@features/data/compute/updateEntitiesBasedOnDataParams';
import { EntityType, LocaleSeparator } from '@features/params/PageParamTypes';

import {
  getBaseLanguageData,
  LanguageData,
  LanguageSource,
} from '@entities/language/LanguageTypes';
import { EntityDictionary } from '@entities/types/DataTypes';

import { getExtremeLanguagePaths } from '../ReportLanguagePaths';

describe('ReportLanguagePaths', () => {
  function generateEntities(): EntityDictionary {
    // Get regular data and add a language family so there is more data to process
    // Each source will have a different family structure, some of which have cycles
    // Combined: elv -> sjn -> dori0123, elv -> qya (a typical branching tree)
    // ISO: elv -> qya && sjn -> dori0123 -> sjn (a cycle)
    // Glottolog: sjn -> dori0123, sjn -> qya (a tree branching differently, no lang family)
    // CLDR: elv -> sjn -> dori0123 -> elv (a bad cycle but will be missed since there is no root)
    const inputEnts = getDisconnectedMockedEntities();
    const elv: LanguageData = {
      ...getBaseLanguageData('elv', 'Elvish'), // fictional language family code
      nameEndonym: 'ɛlvɪʃ',
      names: ['Elvish', 'Elven Languages', 'ɛlvɪʃ'],
      pop: { rough: 50000, speaking: {}, writing: {} },
      // Only a parent in CLDR to create a cycle there
      CLDR: { parentLanguageCode: 'dori0123' },
    };
    const qya: LanguageData = {
      ...getBaseLanguageData('qya', 'Quenya'), // fictional Elvish language
      nameEndonym: 'kwɛnjɑ',
      names: ['Quenya', 'High Elvish', 'kwɛnjɑ'],
      pop: { rough: 10000, speaking: {}, writing: {} },
      Combined: { parentLanguageCode: 'elv' },
      ISO: { parentLanguageCode: 'elv' },
      Glottolog: { parentLanguageCode: 'sjn' },
      // No parent for CLDR, UNESCO or BCP
    };
    inputEnts['qya'] = qya;
    inputEnts['elv'] = elv;
    // Edit existing mocked languages to change language branching
    if (inputEnts['sjn'].type === EntityType.Language) {
      inputEnts['sjn'].Combined.parentLanguageCode = 'elv';
      inputEnts['sjn'].ISO.parentLanguageCode = 'dori0123'; // making a loop in ISO
      inputEnts['sjn'].CLDR.parentLanguageCode = 'elv';
      // no parent for Glottolog, UNESCO or BCP
    }
    if (inputEnts['dori0123'].type === EntityType.Language) {
      inputEnts['dori0123'].Combined.parentLanguageCode = 'sjn';
      inputEnts['dori0123'].ISO.parentLanguageCode = 'sjn';
      inputEnts['dori0123'].CLDR.parentLanguageCode = 'sjn';
      inputEnts['dori0123'].Glottolog.parentLanguageCode = 'sjn';
      // no parent for UNESCO or BCP
    }

    // Generate the data
    return getFullyInstantiatedMockedEntities(inputEnts);
  }

  it('getExtremeLanguagePaths', () => {
    const ents = generateEntities();
    const { allLanguoids, locales, getTerritory } = getMockedDataContext(ents);

    Object.values(LanguageSource).forEach((languageSource) => {
      // This shouldn't throw an error even in the presence of cycles
      updateEntitiesBasedOnDataParams(
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

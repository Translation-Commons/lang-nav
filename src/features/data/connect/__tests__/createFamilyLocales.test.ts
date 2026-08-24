import { describe, expect, it } from 'vitest';

import {
  getDisconnectedMockedEntities,
  getFullyInstantiatedMockedEntities,
} from '@features/__tests__/MockEntities';
import { EntityType } from '@features/params/PageParamTypes';

import { getBaseLanguageData, LanguageData } from '@entities/language/LanguageTypes';
import { EntityDictionary } from '@entities/types/DataTypes';

describe('createFamilyLocales', () => {
  function getLocaleIDs(ents: EntityDictionary): string {
    return Object.values(ents)
      .filter((ent) => ent.type === EntityType.Locale)
      .map((locale) => locale.ID)
      .join(' ');
  }

  it('should create family locales correctly', () => {
    const inputEnts = getDisconnectedMockedEntities();
    const elv: LanguageData = {
      ...getBaseLanguageData('elv', 'Elvish'), // fictional language family code
      nameEndonym: 'ɛlvɪʃ',
      names: ['Elvish', 'Elven Languages', 'ɛlvɪʃ'],
      pop: { rough: 50000, writing: {}, speaking: {} },
    };
    inputEnts['elv'] = elv;
    expect(getLocaleIDs(inputEnts)).toBe('sjn_BE sjn_ER dori0123_ER sjn_Teng_BE');

    // getFullyInstantiatedMockedEntities will run connectMockedEntities which runs
    // connectEntitiesAndCreateDerivedData which includes createFamilyLocales
    const ents = getFullyInstantiatedMockedEntities(inputEnts);

    // Now check that the family locales were created along with the regional locales
    expect(ents['elv_001'].nameDisplay).toBe('Elvish (Arda)');
    expect(getLocaleIDs(inputEnts)).toBe(
      'sjn_BE sjn_ER dori0123_ER sjn_Teng_BE elv_BE elv_ER sjn_123 elv_123 sjn_Teng_123 dori0123_123 sjn_001 elv_001 sjn_Teng_001 dori0123_001',
    );
  });
});

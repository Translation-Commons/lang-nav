import { describe, expect, it } from 'vitest';

import {
  getDisconnectedMockedObjects,
  getFullyInstantiatedMockedObjects,
} from '@features/__tests__/MockObjects';
import { ObjectType } from '@features/params/PageParamTypes';

import { getBaseLanguageData, LanguageData } from '@entities/language/LanguageTypes';
import { ObjectDictionary } from '@entities/types/DataTypes';

describe('createFamilyLocales', () => {
  function getLocaleIDs(objects: ObjectDictionary): string {
    return Object.values(objects)
      .filter((obj) => obj.type === ObjectType.Locale)
      .map((locale) => locale.ID)
      .join(' ');
  }

  it('should create family locales correctly', () => {
    const inputObjects = getDisconnectedMockedObjects();
    const elv: LanguageData = {
      ...getBaseLanguageData('elv', 'Elvish'), // fictional language family code
      nameEndonym: 'ɛlvɪʃ',
      names: ['Elvish', 'Elven Languages', 'ɛlvɪʃ'],
      populationRough: 50000,
    };
    inputObjects['elv'] = elv;
    expect(getLocaleIDs(inputObjects)).toBe('sjn_BE sjn_ER dori0123_ER sjn_Teng_BE');

    // getFullyInstantiatedMockedObjects will run connectMockedObjects which runs
    // connectObjectsAndCreateDerivedData which includes createFamilyLocales
    const objects = getFullyInstantiatedMockedObjects(inputObjects);

    // Now check that the family locales were created along with the regional locales
    expect(objects['elv_001'].nameDisplay).toBe('Elvish (Arda)');
    expect(getLocaleIDs(inputObjects)).toBe(
      'sjn_BE sjn_ER dori0123_ER sjn_Teng_BE elv_BE elv_ER sjn_123 elv_123 sjn_Teng_123 dori0123_123 sjn_001 elv_001 sjn_Teng_001 dori0123_001',
    );
  });
});

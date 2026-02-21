import { describe, expect, it } from 'vitest';

import {
  connectMockedObjects,
  getDisconnectedMockedObjects,
  getMockedObjectDictionaries,
} from '@features/__tests__/MockObjects';
import { LocaleSeparator, ObjectType } from '@features/params/PageParamTypes';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';

import { updateObjectCodesNameAndPopulation } from '../updateObjectCodesNameAndPopulation';

describe('updateObjectCodesNameAndPopulation', () => {
  it('updates language population estimates based on locales', () => {
    const mockedObjects = getDisconnectedMockedObjects();
    connectMockedObjects(mockedObjects); // Connect but do not compute population yet
    const mockedDictionaries = getMockedObjectDictionaries(mockedObjects);

    // Before update, populationEstimate should be based on the rough input or descendants only
    const sjn = mockedDictionaries.languages.sjn;
    const dori0123 = mockedDictionaries.languages.dori0123;
    const sjn_001 = mockedDictionaries.locales.sjn_001;
    expect(sjn.populationEstimate).toBe(14400); // original value for populationEstimate
    expect(dori0123.populationEstimate).toBe(2500); // original value for populationEstimate
    expect(sjn_001.populationSpeaking).toBe(10920); // original value added up from locales

    // Check the IDs and names
    expect(sjn.codeDisplay).toBe('sjn');
    expect(sjn.nameDisplay).toBe('Sindarin');
    expect(dori0123.codeDisplay).toBe('dori0123');
    expect(dori0123.nameDisplay).toBe('Doriathrin');
    expect(sjn_001.codeDisplay).toBe('sjn_001');
    expect(sjn_001.nameDisplay).toBe('sjn_001'); // A readable name has not been computed yet

    // Perform the update
    updateObjectCodesNameAndPopulation(
      [sjn, dori0123],
      Object.values(mockedDictionaries.locales),
      mockedDictionaries.territories['001'],
      LanguageSource.Combined,
      LocaleSeparator.Hyphen,
    );

    // After update, populationEstimate should consider populationFromLocales
    expect(sjn.populationEstimate).toBe(11220); // Updated to follow locales
    expect(dori0123.populationEstimate).toBe(1800); // Updated to follow locales
    expect(sjn_001.populationSpeaking).toBe(11220); // updated since locales updated from census data

    // Check the IDs and names again
    expect(sjn.codeDisplay).toBe('sjn');
    expect(sjn.nameDisplay).toBe('Sindarin');
    expect(dori0123.codeDisplay).toBe('dori0123');
    expect(dori0123.nameDisplay).toBe('Doriathrin');
    expect(sjn_001.codeDisplay).toBe('sjn-001'); // Separator changed to hyphen
    expect(sjn_001.nameDisplay).toBe('Sindarin (Arda)'); // Readable name computed

    // Add a another locale to increase dori0123 population dramatically
    const newLocale: LocaleData = {
      type: ObjectType.Locale,
      ID: 'dori0123_AM',
      codeDisplay: 'dori0123-AM',
      languageCode: 'dori0123',
      populationSpeaking: 100000,
      nameDisplay: 'Doriathrin (AM)',
      territoryCode: 'AM',
      names: [],
      localeSource: LocaleSource.Census,
    };
    mockedObjects[newLocale.ID] = newLocale;
    connectMockedObjects(mockedObjects); // Re-connect objects

    updateObjectCodesNameAndPopulation(
      [sjn, dori0123],
      [...Object.values(mockedDictionaries.locales), newLocale], // Include the new locale
      mockedDictionaries.territories['001'],
      LanguageSource.Combined,
      LocaleSeparator.Hyphen,
    );

    expect(sjn.populationEstimate).toBe(11220); // unchanged
    // TODO computeLanguageDescendantPopulation needs to be revamped
    expect(sjn.populationOfDescendants).toBe(200000); // this should be computed from dori0123
    expect(dori0123.populationEstimate).toBe(100000); // updated to include new locale
    expect(sjn_001.populationSpeaking).toBe(11220); // unchanged
  });
});

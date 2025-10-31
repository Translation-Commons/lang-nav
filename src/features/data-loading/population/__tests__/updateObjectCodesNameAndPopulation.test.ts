import { describe, expect, it } from 'vitest';

import {
  connectMockedObjects,
  getDisconnectedMockedObjects,
  getMockedObjectDictionaries,
} from '@features/__tests__/MockObjects';
import { computeLocalePopulationFromCensuses } from '@features/data-loading/population/computeLocalePopulationFromCensuses';
import { LocaleSeparator, ObjectType } from '@features/page-params/PageParamTypes';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { LocaleData, LocaleSource } from '@entities/types/DataTypes';

import { updateObjectCodesNameAndPopulation } from '../updateObjectCodesNameAndPopulation';

describe('updateLanguagesBasedOnSource', () => {
  it('updates language population estimates based on locales', () => {
    const mockedObjects = getDisconnectedMockedObjects();
    connectMockedObjects(mockedObjects); // Connect but do not compute population yet
    const mockedDictionaries = getMockedObjectDictionaries(mockedObjects);

    // Before update, populationEstimate should be based on cited or descendents only
    const sjn = mockedDictionaries.languages.sjn;
    const dori0123 = mockedDictionaries.languages.dori0123;
    expect(sjn.populationEstimate).toBe(14400); // original value for populationEstimate
    expect(dori0123.populationEstimate).toBe(2500); // original value for populationEstimate

    updateObjectCodesNameAndPopulation(
      [sjn, dori0123],
      Object.values(mockedDictionaries.locales),
      mockedDictionaries.territories['001'],
      LanguageSource.All,
      LocaleSeparator.Hyphen,
    );

    // After update, populationEstimate should consider populationFromLocales
    expect(sjn.populationEstimate).toBe(24000); // corrected to match populationCited
    expect(dori0123.populationEstimate).toBe(2500); // original value for populationEstimate

    // Add a another locale to increase dori0123 population dramatically
    const newLocale: LocaleData = {
      type: ObjectType.Locale,
      ID: 'dori0123_XY',
      codeDisplay: 'dori0123-XY',
      languageCode: 'dori0123',
      populationSpeaking: 100000,
      nameDisplay: 'Doriathrin (XY)',
      names: [],
      localeSource: LocaleSource.Census,
    };
    mockedObjects[newLocale.ID] = newLocale;
    connectMockedObjects(mockedObjects); // Re-connect objects
    const locales = Object.values(mockedDictionaries.locales);

    computeLocalePopulationFromCensuses(locales);
    updateObjectCodesNameAndPopulation(
      [sjn, dori0123],
      locales,
      mockedDictionaries.territories['001'],
      LanguageSource.All,
      LocaleSeparator.Hyphen,
    );

    expect(sjn.populationEstimate).toBe(24000); // corrected to match populationCited
    expect(dori0123.populationEstimate).toBe(2500); // original value for populationEstimate
  });
});

import { describe, expect, it } from 'vitest';

import {
  connectMockedObjects,
  getDisconnectedMockedObjects,
  getMockedCoreData,
} from '@features/__tests__/MockObjects';
import { CoreData } from '@features/data/load/CoreData';
import { ObjectType } from '@features/params/PageParamTypes';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import { LocaleData, LocaleSource, ObjectDictionary } from '@entities/types/DataTypes';

import { computeLocalesPopulationFromCensuses } from '../computeLocalesPopulationFromCensuses';
import { computeRegionalLocalesPopulation } from '../computeRegionalLocalesPopulation';
import { updateLanguagesPopulationFromLocale, updatePopulations } from '../updatePopulations';

describe('computeLocalePopulationFromCensuses', () => {
  // Gets a small test of objects to test on. We can run this function multiple time to get multiple batches of objects
  function getMockedData(extraObjects: ObjectDictionary = {}): CoreData {
    // Provides 4 base locales: sjn_BE, sjn_ER, dori0123_ER and sjn_Teng_BE
    const baseObjects = getDisconnectedMockedObjects();

    // Create symbolic links between objects and create regional locales
    // So how we have 3 ones for the region: sjn_123, dori0123_123, sjn_Teng_123
    // and 3 for the world: sjn_001, dori0123_001, sjn_Teng_001
    const connectedObjects = connectMockedObjects({ ...baseObjects, ...extraObjects });

    // No algorithms have been applied on this data yet so we can test them.
    return { objects: connectedObjects, ...getMockedCoreData(connectedObjects) };
  }

  it('computes adjusted populations for all locales', () => {
    // The 2 mocks are identical in data but separate instances so we can compare the values
    const mockRaw = getMockedData();
    const mockUpdated = getMockedData(); // Will perform computations on this one

    // Update populations from census data
    computeLocalesPopulationFromCensuses(mockUpdated.locales);

    // The population adjusted will be new in the updated data
    mockUpdated.locales.forEach((localeUpdated) => {
      const localeRaw = mockRaw.locales.find((l) => l.ID === localeUpdated.ID);

      // The raw data does not come with adjusted populations
      expect(localeRaw?.populationAdjusted).toBeUndefined();
      expect(localeRaw?.populationSpeaking).not.toBeUndefined();

      // The updated data should have adjusted populations that in these cases equal the speaking populations
      expect(localeUpdated.populationAdjusted).toBe(localeUpdated.populationSpeaking);
    });
  });

  it('Census data may update populations for individual locales', () => {
    // The 2 mocks are identical in data but separate instances so we can compare the values
    const mockRaw = getMockedData();
    const mockUpdated = getMockedData(); // Will perform computations on this one

    // Update populations from census data
    computeLocalesPopulationFromCensuses(mockUpdated.locales);

    // The update will affect the populationSpeaking for locales when we got new data from censuses
    mockUpdated.locales.forEach((localeUpdated) => {
      const localeRaw = mockRaw.locales.find((l) => l.ID === localeUpdated.ID);

      if (localeUpdated.ID === 'sjn_BE') {
        // This locale was updated from the census for BE
        expect(localeUpdated.populationSpeaking).not.toBe(localeRaw?.populationSpeaking);
      } else if (['sjn_123', 'sjn_001'].includes(localeUpdated.ID)) {
        // The changes have not yet propagated to regional locales
        expect(localeUpdated?.populationSpeaking).toBe(localeRaw?.populationSpeaking);
      } else if (['sjn_Teng_BE', 'sjn_Teng_123', 'sjn_Teng_001'].includes(localeUpdated.ID)) {
        // The locales with writing systems specificied are not modified by the census data
        // since it does assert that it also applies to sjn_Teng
        expect(localeUpdated?.populationSpeaking).toBe(localeRaw?.populationSpeaking);
      } else {
        // All other locales are the same
        expect(localeUpdated?.populationSpeaking).toBe(localeRaw?.populationSpeaking);
      }
    });

    // Finally check if the sjn language was updated
    const langRaw = mockRaw.allLanguoids.find((l) => l.ID === 'sjn');
    expect(langRaw?.populationEstimate, 'populationEstimate').toBe(14400);
    expect(langRaw?.populationRough, 'populationRough').toBe(24000);
    expect(langRaw?.populationFromLocales, 'populationFromLocales').toBe(undefined);
    expect(langRaw?.populationOfDescendants, 'populationOfDescendants').toBe(undefined);

    // Finally check if the sjn language was updated
    const langUpdated = mockUpdated.allLanguoids.find((l) => l.ID === 'sjn');
    expect(langUpdated?.populationEstimate, 'populationEstimate').toBe(14400);
    expect(langUpdated?.populationRough, 'populationRough').toBe(24000);
    expect(langUpdated?.populationFromLocales, 'populationFromLocales').toBe(undefined); // Not updated
    expect(langUpdated?.populationOfDescendants, 'populationOfDescendants').toBe(undefined);
  });

  it('Computing regional locale data is necessary to propagate the new data', () => {
    // The 2 mocks are identical in data but separate instances so we can compare the values
    const mockRaw = getMockedData();
    const mockUpdated = getMockedData(); // Will perform computations on this one
    const world = mockUpdated.territories.find((t) => t.ID === '001')!;

    // Update populations from census data AND re-compute regional populations
    computeLocalesPopulationFromCensuses(mockUpdated.locales);
    computeRegionalLocalesPopulation(world);
    updateLanguagesPopulationFromLocale(world);

    // The update will affect the populationSpeaking for locales when we got new data from censuses
    mockUpdated.locales.forEach((localeUpdated) => {
      const localeRaw = mockRaw.locales.find((l) => l.ID === localeUpdated.ID);

      if (localeUpdated.ID === 'sjn_BE') {
        // This locale was updated from the census for BE
        expect(localeUpdated.populationSpeaking).not.toBe(localeRaw?.populationSpeaking);
      } else if (['sjn_123', 'sjn_001'].includes(localeUpdated.ID)) {
        // The changes NOW HAVE propagated to regional locales
        expect(localeUpdated?.populationSpeaking).not.toBe(localeRaw?.populationSpeaking);
      } else if (['sjn_Teng_BE', 'sjn_Teng_123', 'sjn_Teng_001'].includes(localeUpdated.ID)) {
        // The locales with writing systems specificied are not modified by the census data
        // since it does assert that it also applies to sjn_Teng
        expect(localeUpdated?.populationSpeaking).toBe(localeRaw?.populationSpeaking);
      } else {
        // All other locales are the same
        expect(localeUpdated?.populationSpeaking).toBe(localeRaw?.populationSpeaking);
      }
    });

    // Finally check if the sjn language was updated
    const langRaw = mockRaw.allLanguoids.find((l) => l.ID === 'sjn');
    expect(langRaw?.populationEstimate, 'populationEstimate').toBe(14400);
    expect(langRaw?.populationRough, 'populationRough').toBe(24000);
    expect(langRaw?.populationFromLocales, 'populationFromLocales').toBe(undefined);
    expect(langRaw?.populationOfDescendants, 'populationOfDescendants').toBe(undefined);

    // Finally check if the sjn language was updated
    const langUpdated = mockUpdated.allLanguoids.find((l) => l.ID === 'sjn');
    expect(langUpdated?.populationEstimate, 'populationEstimate').toBe(14400);
    expect(langUpdated?.populationRough, 'populationRough').toBe(24000);
    expect(langUpdated?.populationFromLocales, 'populationFromLocales').toBe(11220); // <-- UPDATED VALUE
    expect(langUpdated?.populationOfDescendants, 'populationOfDescendants').toBe(undefined);
  });

  it('If we have a census with a crazy estimate it changes some values but is capped', () => {
    function getHighPopulationCensus(): CensusData {
      // Function so it create a new instance each time
      return {
        type: ObjectType.Census,
        ID: 'be9999',
        codeDisplay: 'be9999',
        isoRegionCode: 'BE',
        populationEligible: 50000, // BE's recorded population is 12000 but this census claims 50000 people
        nameDisplay: 'Census BE 9999',
        names: [],
        yearCollected: 9999,
        collectorType: CensusCollectorType.Government,
        languageCount: 1,
        languageEstimates: { sjn: 50000 }, // Crazy high value
        url: 'pretend this is a real URL',
      };
    }
    // The 2 mocks are identical in data but separate instances so we can compare the values
    const mockRaw = getMockedData({ be9999: getHighPopulationCensus() });
    const mockUpdated = getMockedData({ be9999: getHighPopulationCensus() }); // Will perform computations on this one

    // Update populations from census data AND re-compute regional populations
    computeLocalesPopulationFromCensuses(mockUpdated.locales);
    computeRegionalLocalesPopulation(mockUpdated.territories.find((t) => t.ID === '001'));
    updateLanguagesPopulationFromLocale(mockUpdated.territories.find((t) => t.ID === '001')!);

    // Check the Locale sjn_BE
    const localeRaw = mockRaw.locales.find((l) => l.ID === 'sjn_BE');
    expect(localeRaw?.populationSpeaking).toBe(9000); // Original value before census
    expect(localeRaw?.populationSpeakingPercent).toBe(75);
    expect(localeRaw?.populationAdjusted).toBeUndefined();

    const localeUpdated = mockUpdated.locales.find((l) => l.ID === 'sjn_BE');
    expect(localeUpdated?.populationSpeaking).toBe(50000); // crazy high
    expect(localeUpdated?.populationSpeakingPercent).toBe(100);
    expect(localeUpdated?.populationAdjusted).toBe(12000); // adjusted down since the territory BE is capped at 12000

    // Check the Language sjn
    const langRaw = mockRaw.allLanguoids.find((l) => l.ID === 'sjn');
    expect(langRaw?.populationEstimate, 'populationEstimate').toBe(14400);
    expect(langRaw?.populationRough, 'populationRough').toBe(24000);
    expect(langRaw?.populationFromLocales, 'populationFromLocales').toBe(undefined);

    const langUpdated = mockUpdated.allLanguoids.find((l) => l.ID === 'sjn');
    expect(langUpdated?.populationEstimate, 'populationEstimate').toBe(14400);
    expect(langUpdated?.populationRough, 'populationRough').toBe(24000);
    expect(langUpdated?.populationFromLocales, 'populationFromLocales').toBe(13920); // <-- UPDATED VALUE
  });

  it('adding a census for the other region will cascade correctly', () => {
    // Let's say we suddenly find that in the Undying lands (Aman) a huge population of Sindarin speakers exist
    function getAMCensus(): CensusData {
      // Function so it create a new instance each time
      return {
        type: ObjectType.Census,
        ID: 'am0590',
        codeDisplay: 'am0590',
        isoRegionCode: 'AM',
        populationEligible: 20000,
        nameDisplay: 'The Undying Lands 0590 Census',
        names: [],
        yearCollected: 1990,
        collectorType: CensusCollectorType.Government,
        languageCount: 1,
        languageEstimates: { sjn: 18000 },
        url: 'pretend this is a real URL',
      };
    }
    function getSindarinInAMLocale(): LocaleData {
      return {
        type: ObjectType.Locale,
        ID: 'sjn_AM',
        codeDisplay: 'sjn-AM',
        languageCode: 'sjn',
        territoryCode: 'AM',
        populationSpeaking: 2000, // let's say this is grossly underestimated before we get the census data
        nameDisplay: 'Sindarin (The Undying Lands)',
        names: [],
        localeSource: LocaleSource.StableDatabase,
      };
    }

    function generateLanguage(extraObjects: ObjectDictionary = {}) {
      const mockedObjects = getMockedData(extraObjects);
      const world = mockedObjects.territories.find((t) => t.ID === '001')!;
      // Update both population, noting one has a different census
      computeLocalesPopulationFromCensuses(mockedObjects.locales);
      computeRegionalLocalesPopulation(world);
      updatePopulations(mockedObjects.allLanguoids, mockedObjects.locales, world);

      return mockedObjects.allLanguoids.find((l) => l.ID === 'sjn');
    }

    // Check the Language sjn
    const langOriginal = generateLanguage({});
    const langOnlyCensus = generateLanguage({ am0590: getAMCensus() });
    const langOnlyLocale = generateLanguage({ sjn_AM: getSindarinInAMLocale() });
    const langBothNewEntities = generateLanguage({
      am0590: getAMCensus(),
      sjn_AM: getSindarinInAMLocale(),
    });

    // Rough Population will all stay to the original entry
    expect(langOriginal?.populationRough, 'langOriginal?.populationRough').toBe(24000);
    expect(langOnlyCensus?.populationRough, 'langOnlyCensus?.populationRough').toBe(24000);
    expect(langOnlyLocale?.populationRough, 'langOnlyLocale?.populationRough').toBe(24000);
    expect(langBothNewEntities?.populationRough, 'langBothNewEntities?.populationRough').toBe(
      24000,
    );

    // Population from Locales will be updated
    expect(
      langOriginal?.populationFromLocales,
      'langOriginal?.populationFromLocales, Prior value w/ ER & BE',
    ).toBe(11220);
    expect(
      langOnlyCensus?.populationFromLocales,
      'langOnlyCensus?.populationFromLocales, No new locale added so AM not counted',
    ).toBe(11220);
    expect(
      langOnlyLocale?.populationFromLocales,
      'langOnlyLocale?.populationFromLocales, New locale added so AM counted but not adjusted ',
    ).toBe(13220); // <-- UPDATED VALUE
    expect(
      langBothNewEntities?.populationFromLocales,
      'langBothNewEntities?.populationFromLocales, New locale added so AM counted and adjusted',
    ).toBe(29220); // <-- UPDATED VALUE

    // The ultimate population estimate will always be upcated because there is census data now
    expect(
      langOriginal?.populationEstimate,
      'langOriginal?.populationEstimate, updated value from locales',
    ).toBe(11220);
    expect(
      langOnlyCensus?.populationEstimate,
      'langOnlyCensus?.populationEstimate, updated value from locales',
    ).toBe(11220);
    expect(
      langOnlyLocale?.populationEstimate,
      'langOnlyLocale?.populationEstimate, updated value from locales',
    ).toBe(13220);
    expect(
      langBothNewEntities?.populationEstimate,
      'langBothNewEntities?.populationEstimate, updated value from locales',
    ).toBe(29220);
  });
});

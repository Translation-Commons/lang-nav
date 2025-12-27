import { describe, expect, it } from 'vitest';

import { getMockedObjectDictionaries } from '@features/__tests__/MockObjects';
import { connectLanguagesToParent } from '@features/data/connect/connectLanguagesToParent';
import connectLocales from '@features/data/connect/connectLocales';
import { connectTerritoriesToParent } from '@features/data/connect/connectTerritoriesToParent';
import { connectWritingSystems } from '@features/data/connect/connectWritingSystems';
import { createRegionalLocales } from '@features/data/connect/createRegionalLocales';
import { connectVariantTags } from '@features/data/load/extra_entities/IANAData';

import { searchLocalesForMissingLinks } from '../searchLocalesForMissingLinks';

describe('searchLocalesForMissingLinks', () => {
  it('should connect locales that are missing links based on language and territory codes', () => {
    const { languagesBySource, territories, writingSystems, locales, variantTags } =
      getMockedObjectDictionaries();
    expect(
      Object.values(locales).length,
      "Initially there are 4 locales:  ['sjn_BE', 'sjn_ER', 'dori0123_ER', 'sjn_Teng_BE']",
    ).toBe(4);

    // Run the other connection functions in connectObjects
    connectLanguagesToParent(languagesBySource);
    connectTerritoriesToParent(territories);
    connectWritingSystems(languagesBySource.Combined, territories, writingSystems);
    connectLocales(languagesBySource.Combined, territories, writingSystems, locales);
    connectVariantTags(variantTags, languagesBySource.BCP, locales);
    createRegionalLocales(territories, locales); // create them after connecting them
    expect(
      Object.values(locales).length,
      'After creating regional locales, there should be 10 locales',
    ).toBe(10);
    // New locales created:
    // 'sjn_123', 'sjn_Teng_123', 'dori0123_123', 'sjn_001', 'sjn_Teng_001', 'dori0123_001'

    Object.values(locales).forEach((locale) => {
      expect(locale.relatedLocales, `relatedLocales isn't initialized yet`).toBeUndefined();
    });

    // Now search for missing links
    searchLocalesForMissingLinks(locales);

    // Now check that locales are connected properly
    expect(locales['sjn_BE'].relatedLocales).toBeDefined();
    expect(locales['sjn_BE'].relatedLocales?.parentTerritory?.ID).toBe('sjn_123');
    expect(locales['sjn_BE'].relatedLocales?.moreSpecific?.[0].ID).toBe('sjn_Teng_BE');

    expect(locales['dori0123_123'].relatedLocales).toBeDefined();
    expect(locales['dori0123_123'].relatedLocales?.parentTerritory?.ID).toBe('dori0123_001');
    expect(locales['dori0123_123'].relatedLocales?.childTerritories?.[0].ID).toBe('dori0123_ER');
    expect(locales['dori0123_123'].relatedLocales?.parentLanguage?.ID).toBe('sjn_123');
    expect(locales['dori0123_123'].relatedLocales?.childLanguages?.[0].ID).toBeUndefined();
    expect(locales['dori0123_123'].relatedLocales?.moreGeneral?.[0].ID).toBeUndefined();
    expect(locales['dori0123_123'].relatedLocales?.moreSpecific?.[0].ID).toBeUndefined();

    expect(locales['sjn_Teng_001'].relatedLocales?.childTerritories?.[0].ID).toBe('sjn_Teng_123');
    expect(locales['sjn_Teng_001'].relatedLocales?.moreGeneral?.[0].ID).toBe('sjn_001');
  });
});

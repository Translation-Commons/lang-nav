import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedEntities } from '@features/__tests__/MockEntities';
import { EntityType } from '@features/params/PageParamTypes';

import { getLocaleFormedHerePrediction } from '../LocaleIndigeneityPredictions';

describe('getLocaleFormedHerePrediction', () => {
  const mockedEnts = getFullyInstantiatedMockedEntities();

  it('predicts true for a locale in the biggest country for its language', () => {
    [mockedEnts.sjn_BE, mockedEnts.dori0123_ER, mockedEnts.sjn_Teng_BE].forEach((locale) => {
      if (locale.type !== EntityType.Locale) throw new Error('Incorrect type');
      expect(getLocaleFormedHerePrediction(locale)).toBe(true);
    });
  });

  it('predicts false for a locale that is not the biggest for its language', () => {
    [mockedEnts.sjn_ER].forEach((locale) => {
      if (locale.type !== EntityType.Locale) throw new Error('Incorrect type');
      expect(getLocaleFormedHerePrediction(locale)).toBe(false);
    });
  });

  it('predicts false for regional locales right now', () => {
    [mockedEnts.sjn_123, mockedEnts.dori0123_123, mockedEnts.sjn_001].forEach((locale) => {
      if (locale.type !== EntityType.Locale) throw new Error('Incorrect type');
      expect(getLocaleFormedHerePrediction(locale)).toBe(false);
    });
  });
});

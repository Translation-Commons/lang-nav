import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';
import { ObjectType } from '@features/params/PageParamTypes';

import { getLocaleFormedHerePrediction } from '../LocaleIndigeneityPredictions';

describe('getLocaleFormedHerePrediction', () => {
  const mockedObjects = getFullyInstantiatedMockedObjects();

  it('predicts true for a locale in the biggest country for its language', () => {
    [mockedObjects.sjn_BE, mockedObjects.dori0123_ER, mockedObjects.sjn_Teng_BE].forEach(
      (locale) => {
        if (locale.type !== ObjectType.Locale) throw new Error('Incorrect type');
        expect(getLocaleFormedHerePrediction(locale)).toBe(true);
      },
    );
  });

  it('predicts false for a locale that is not the biggest for its language', () => {
    [mockedObjects.sjn_ER].forEach((locale) => {
      if (locale.type !== ObjectType.Locale) throw new Error('Incorrect type');
      expect(getLocaleFormedHerePrediction(locale)).toBe(false);
    });
  });

  it('predicts false for regional locales right now', () => {
    [mockedObjects.sjn_123, mockedObjects.dori0123_123, mockedObjects.sjn_001].forEach((locale) => {
      if (locale.type !== ObjectType.Locale) throw new Error('Incorrect type');
      expect(getLocaleFormedHerePrediction(locale)).toBe(false);
    });
  });
});

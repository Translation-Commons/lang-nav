import { describe, expect, it } from 'vitest';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import averageCoordinates from '../averageCoordinates';

describe('averageCoordinates', () => {
  function makeLanguage(lat: number, lng: number) {
    const lang = getBaseLanguageData(lat + '-' + lng, '');
    lang.populationEstimate = 1000; // population is needed for the averageCoordinates function to include the language in the average
    lang.latitude = lat;
    lang.longitude = lng;
    return lang;
  }

  const l10_20 = makeLanguage(10, 20);
  const l0_0 = makeLanguage(0, 0);
  const l20_40 = makeLanguage(20, 40);
  const lNeg10_Neg20 = makeLanguage(-10, -20);
  const l1p5_2p5 = makeLanguage(1.5, 2.5);
  const l2p5_3p5 = makeLanguage(2.5, 3.5);
  const l10_170 = makeLanguage(10, 170);
  const l10_Neg170 = makeLanguage(10, -170);

  it('should return the average of a single coordinate', () => {
    const result = averageCoordinates([l10_20]);
    expect(result.latitude).toBe(10);
    expect(result.longitude).toBe(20);
  });

  it('should return the average of multiple coordinates', () => {
    const result = averageCoordinates([l0_0, l10_20, l20_40]);
    expect(result.latitude).toBeCloseTo(10.407);
    expect(result.longitude).toBeCloseTo(19.579);
  });

  it('should handle negative coordinates', () => {
    const result = averageCoordinates([lNeg10_Neg20, l10_20]);
    expect(result.latitude).toBeCloseTo(0);
    expect(result.longitude).toBeCloseTo(0);
  });

  it('should handle decimal coordinates', () => {
    const result = averageCoordinates([l1p5_2p5, l2p5_3p5]);
    expect(result.latitude).toBeCloseTo(2);
    expect(result.longitude).toBeCloseTo(3);
  });

  it('should return zero coordinates for empty array', () => {
    const result = averageCoordinates([]);
    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
  });

  it('when coordinates are on the opposite side of the world should average correctly', () => {
    const result = averageCoordinates([l10_170, l10_Neg170]);
    expect(result.latitude).toBeCloseTo(10.15); // Closest point on a sphere is not necessarily the midpoint of the latitudes
    expect(result.longitude).toBeCloseTo(180);
  });

  it('weights coordinates by the population', () => {
    const smaller = makeLanguage(0, -10);
    smaller.populationEstimate = 1;

    const larger = makeLanguage(0, 10);
    larger.populationEstimate = 16;

    const result = averageCoordinates([smaller, larger]);
    // The average should be much closer to l20_40 than l10_20 because it has a much higher population
    expect(result.latitude).toBeCloseTo(0);
    expect(result.longitude).toBeCloseTo(3.36);
  });
});

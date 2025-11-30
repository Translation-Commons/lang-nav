import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import useScale from '../useScale';
import { SortBy } from '@features/transforms/sorting/SortTypes';
import { getBaseLanguageData } from '@entities/language/LanguageTypes';

describe('useScale', () => {
    it('returns default multiplier when scaleBy is undefined or "None"', () => {
        const lang = getBaseLanguageData('eng', 'English');
        const { result: r1 } = renderHook(() => useScale({ objects: [lang], scaleBy: undefined }));
        expect(r1.current.getScale(lang)).toBe(2);

        const { result: r2 } = renderHook(() => useScale({ objects: [lang], scaleBy: 'None' as any }));
        expect(r2.current.getScale(lang)).toBe(2);
    });

    it('maps latitude -90..90 to radius multipliers 2..10', () => {
        const latMax = getBaseLanguageData('max', 'LatMax');
        latMax.latitude = 90;

        const latMin = getBaseLanguageData('min', 'LatMin');
        latMin.latitude = -90;

        const { result } = renderHook(() => useScale({ objects: [latMax, latMin], scaleBy: SortBy.Latitude }));

        // Max latitude should map to the maximum multiplier (10)
        expect(result.current.getScale(latMax)).toBeCloseTo(10);
        // Min latitude should map to the minimum multiplier (2)
        expect(result.current.getScale(latMin)).toBeCloseTo(2);
    });

    it('applies sqrt + log transform for Population and handles missing values', () => {
        const small = getBaseLanguageData('s', 'Small');
        small.populationEstimate = 10; // small population

        const big = getBaseLanguageData('b', 'Big');
        big.populationEstimate = 10000; // much larger

        const missing = getBaseLanguageData('m', 'Missing');
        // no populationEstimate -> should be treated as not renderable -> getScale returns 0

        const { result } = renderHook(() => useScale({ objects: [small, big, missing], scaleBy: SortBy.Population }));

        const scaleSmall = result.current.getScale(small);
        const scaleBig = result.current.getScale(big);
        const scaleMissing = result.current.getScale(missing);

        // big should map to the maximum multiplier (10)
        expect(scaleBig).toBeCloseTo(10);
        // small should be between default and max, and specifically near expected value (approx 4)
        expect(scaleSmall).toBeGreaterThan(2);
        expect(scaleSmall).toBeLessThan(10);
        // missing population should not be renderable
        expect(scaleMissing).toBe(0);
    });
});

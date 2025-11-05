import { describe, expect, it } from 'vitest';

import { getRobinsonCoordinates } from '../getRobinsonCoordinates';

describe('getRobinsonCoordinates', () => {
  it('should return correct coordinates for known points', () => {
    const testCases = [
      { lat: 0, lon: 0, expected: { x: 0, y: 0 } },
      { lat: 45, lon: 0, expected: { x: 0, y: 0.5571 } },
      { lat: 90, lon: 0, expected: { x: 0, y: 1 } },
      { lat: 0, lon: 180, expected: { x: 1, y: 0 } },
      { lat: 0, lon: -180, expected: { x: -1, y: 0 } },
    ];

    testCases.forEach(({ lat, lon, expected }) => {
      const result = getRobinsonCoordinates(lat, lon);
      expect(result.x).toBeCloseTo(expected.x, 4);
      expect(result.y).toBeCloseTo(expected.y, 4);
    });
  });
});

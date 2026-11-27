// Test to make sure every color gradient function can return a function

import { describe, expect, it } from 'vitest';

import { ColorGradient } from '../ColorTypes';
import { getColorGradientFunction } from '../getColorGradientFunction';

describe('getColorGradientFunction', () => {
  it('should return a function for every color gradient', () => {
    Object.values(ColorGradient)
      .filter((v) => typeof v === 'number')
      .forEach((gradient) => {
        const func = getColorGradientFunction(gradient as ColorGradient);
        expect(typeof func).toBe('function');
      });
  });
});

import { describe, expect, it } from 'vitest';

import { LanguageModality } from '../LanguageModality';
import { getModalityFromLabel, getModalityLabel } from '../LanguageModalityDisplay';

describe('Enum <-> Label conversions', () => {
  it('Enum <-> Label conversions are stable', () => {
    Object.values(LanguageModality)
      .filter((v) => typeof v === 'number')
      .forEach((enumValue) => {
        const label = getModalityLabel(enumValue);
        expect(label).toBeDefined();
        const convertedBack = getModalityFromLabel(label!);
        expect(convertedBack).toBe(enumValue);
      });
  });
});

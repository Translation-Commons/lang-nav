import { describe, expect, it } from 'vitest';

import { anyWordStartsWith, convertAlphaToNumber } from '../stringUtils';

describe('convertAlphaToNumber', () => {
  it('An empty string is 0', () => {
    expect(convertAlphaToNumber('')).toBe(0);
  });

  it('Single letters are converted correctly', () => {
    expect(convertAlphaToNumber('    A'), 'A').toBe(1);
    expect(convertAlphaToNumber('    M'), 'M').toBe(13);
    expect(convertAlphaToNumber('    Z'), 'Z').toBe(26);
  });

  it('Multiple letters are converted correctly', () => {
    expect(convertAlphaToNumber('ABC'), 'ABC').toBe(1 * 27 ** 4 + 2 * 27 ** 3 + 3 * 27 ** 2);
    expect(convertAlphaToNumber('Hello'), 'Hello').toBe(
      8 * 27 ** 4 + 5 * 27 ** 3 + 12 * 27 ** 2 + 12 * 27 ** 1 + 15 * 27 ** 0,
    );
  });

  it('Accented characters are treated as their base ASCII letters', () => {
    expect(convertAlphaToNumber('éàç'), 'éàç').toBe(convertAlphaToNumber('eac'));
    expect(convertAlphaToNumber('Ñandú'), 'Ñandú').toBe(convertAlphaToNumber('nandu'));
    expect(convertAlphaToNumber("Q'éqchí"), "Q'éqchí").toBe(convertAlphaToNumber('q eqchi'));
  });

  it('Non-Latin letters are treated as spaces', () => {
    expect(convertAlphaToNumber('αβγδε'), 'αβγδε').toBe(0);
    expect(convertAlphaToNumber('你好'), '你好').toBe(0);
    expect(convertAlphaToNumber('Русский'), 'Русский').toBe(0);
    expect(convertAlphaToNumber('Русский (Russian)'), 'Русский (Russian)').toBe(
      convertAlphaToNumber('         Russian '),
    );
  });
});

describe('normalizeAccents', () => {
  it('removes accent marks from letters', () => {
    expect(convertAlphaToNumber('café'), 'café').toBe(convertAlphaToNumber('cafe'));
    expect(convertAlphaToNumber('naïve'), 'naïve').toBe(convertAlphaToNumber('naive'));
    expect(convertAlphaToNumber('résumé'), 'résumé').toBe(convertAlphaToNumber('resume'));
  });
});

describe('anyWordStartsWith', () => {
  it('matches words that start with the query', () => {
    expect(anyWordStartsWith('Hello World', 'Wor')).toBe(true);
    expect(anyWordStartsWith('Hello World', 'Hello')).toBe(true);
    expect(anyWordStartsWith('Hello World', 'lo Wo')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(anyWordStartsWith('Hello World', 'hello')).toBe(true);
    expect(anyWordStartsWith('Hello World', 'WORLD')).toBe(true);
  });

  it('is accent-insensitive', () => {
    expect(anyWordStartsWith('café au lait', 'Cafe')).toBe(true);
    expect(anyWordStartsWith('naïve approach', 'naive')).toBe(true);
  });

  it('matches the start of the string as well', () => {
    expect(anyWordStartsWith('SingleWord', 'Sing')).toBe(true);
    expect(anyWordStartsWith('SingleWord', 'Word')).toBe(false);
  });

  it('returns false when there is no match', () => {
    expect(anyWordStartsWith('Hello World', 'Test')).toBe(false);
    expect(anyWordStartsWith('café au lait', 'tea')).toBe(false);
  });

  it('handles characters in parentheses and punctuation', () => {
    expect(anyWordStartsWith('Русский (Russian)', 'Russian')).toBe(true);
    expect(anyWordStartsWith('Hello, world!', 'world')).toBe(true);
  });
});

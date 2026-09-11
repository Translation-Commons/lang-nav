import { describe, expect, it } from 'vitest';

import { getBaseLanguageData, LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { updatePopulations } from '../updatePopulations';

describe('updatePopulations', () => {
  /**
   * Regression test for a crash seen with the backend API's language data:
   * `discountPopulationEstimatesIfSimilarToParentRecursive` walks
   * `lang.childLanguages` with no depth cap, unlike its sibling
   * `getLanguagePopulationFollowingDescendants` a few lines above it, which
   * has `if (depth > 50) return`. An unusually deep parent/child chain
   * overflowed the call stack with `RangeError: Maximum call stack size
   * exceeded`, surfacing in the browser console as repeated "Potential
   * infinite recursion for: <id> depth: <n>" warnings that climbed past 50
   * with no crash short-circuit.
   *
   * 20,000 levels is deep enough to overflow Node's call stack without the
   * cap - confirmed by temporarily removing `if (depth > 50) return;` and
   * re-running this test, which then throws the same RangeError.
   */
  it('does not stack-overflow on an unusually deep parent/child chain', () => {
    const chain: LanguageData[] = [];
    for (let i = 0; i < 20000; i++) {
      const lang = getBaseLanguageData(`lang${i}`, `Language ${i}`);
      lang.pop.speaking = { estimate: 20000 - i };
      lang.pop.writing = { estimate: 10000 - i };
      lang.pop.overall = 20000 - i;
      chain.push(lang);
    }
    for (let i = 0; i < chain.length - 1; i++) {
      chain[i].childLanguages = [chain[i + 1]];
      chain[i + 1].parentLanguage = chain[i];
    }

    const world = { ID: '001', childLanguages: [] } as unknown as TerritoryData;

    expect(() => updatePopulations(chain, [], world)).not.toThrow();
  });
});

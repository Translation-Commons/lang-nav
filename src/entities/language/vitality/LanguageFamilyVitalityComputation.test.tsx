import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

import { getBaseLanguageData, LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { getFamilyVitalityScores } from './LanguageFamilyVitalityComputation';
// Mock the per-language vitality aggregator used by the family computation
vi.mock('./LanguageVitalityComputation', () => ({
  getAllVitalityScores: vi.fn(),
}));
import { getAllVitalityScores } from './LanguageVitalityComputation';
import { AllVitalityInfo, VitalitySource } from './VitalityTypes';

describe('getFamilyVitalityScores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns all undefined when input is not a family', () => {
    const notFamily = getBaseLanguageData('en', 'English');
    notFamily.scope = LanguageScope.Language;

    const result = getFamilyVitalityScores(notFamily);

    expect(result[VitalitySource.ISO].score).toBeUndefined();
    expect(result[VitalitySource.Eth2013].score).toBeUndefined();
    expect(result[VitalitySource.Eth2025].score).toBeUndefined();
    expect(result[VitalitySource.Metascore].score).toBeUndefined();

    expect(result[VitalitySource.ISO].label).toBeUndefined();
    expect(result[VitalitySource.ISO].explanation).toBeUndefined();
  });

  it('returns em-dash label and undefined score for an empty family', () => {
    const family = getBaseLanguageData('ine', 'Indo-European');
    family.scope = LanguageScope.Family;

    const result = getFamilyVitalityScores(family);

    for (const src of Object.values(VitalitySource)) {
      expect(result[src].score).toBeUndefined();
      expect(result[src].label).toBe('—');
      expect(result[src].explanation).toBe('No vitality data available for descendants.');
    }
  });

  it('computes population-weighted averages across descendants per source with correct labels', () => {
    // Build a family with two language descendants and one dialect (ignored)
    const family = getBaseLanguageData('ine', 'Indo-European');
    family.scope = LanguageScope.Family;

    const langA = getBaseLanguageData('deu', 'German');
    langA.scope = LanguageScope.Language;
    langA.populationEstimate = 100;

    const langB = getBaseLanguageData('nld', 'Dutch');
    langB.scope = LanguageScope.Language;
    langB.populationEstimate = 50;

    const dialect = getBaseLanguageData('gsw-x', 'Swiss German (dialect)');
    dialect.scope = LanguageScope.Dialect;

    family.childLanguages = [langA, langB, dialect];

    // Mock per-language vitality scores. Dialect should be ignored by the computation.
    (getAllVitalityScores as unknown as Mock).mockImplementation((lang: LanguageData) => {
      if (lang.ID === 'deu') {
        return {
          [VitalitySource.ISO]: { score: 9 },
          [VitalitySource.Eth2013]: { score: 8 },
          [VitalitySource.Eth2025]: { score: undefined },
          [VitalitySource.Metascore]: { score: 8 },
        };
      }
      if (lang.ID === 'nld') {
        return {
          [VitalitySource.ISO]: { score: 7 },
          [VitalitySource.Eth2013]: { score: undefined },
          [VitalitySource.Eth2025]: { score: 6 },
          [VitalitySource.Metascore]: { score: 4 },
        };
      }
      // Dialect: should not contribute even if it had scores
      return {
        [VitalitySource.ISO]: { score: 9 },
        [VitalitySource.Eth2013]: { score: 9 },
        [VitalitySource.Eth2025]: { score: 9 },
        [VitalitySource.Metascore]: { score: 9 },
      };
    });

    const result = getFamilyVitalityScores(family);

    // ISO: (100*9 + 50*7) / 150 = 8.333...
    expect(result[VitalitySource.ISO].score).toBeCloseTo(8.3333333, 5);
    expect(result[VitalitySource.ISO].label).toBe('Living'); // mapped from score
    expect(result[VitalitySource.ISO].explanation).toBeTruthy();

    // Eth2013: only langA (100*8 / 100) = 8 -> label Regional
    expect(result[VitalitySource.Eth2013].score).toBe(8);
    expect(result[VitalitySource.Eth2013].label).toBe('Regional');

    // Eth2025: only langB (50*6 / 50) = 6 -> label Stable
    expect(result[VitalitySource.Eth2025].score).toBe(6);
    expect(result[VitalitySource.Eth2025].label).toBe('Stable');

    // Metascore: (100*8 + 50*4) / 150 = 6.666... -> 6.7
    expect(result[VitalitySource.Metascore].score).toBeCloseTo(6.6666667, 5);
    expect(result[VitalitySource.Metascore].label).toBe('6.7'); // numeric for metascore
  });

  it('includes nested descendants and defaults weight to 1 when missing', () => {
    const family = getBaseLanguageData('foo', 'Foo Family');
    family.scope = LanguageScope.Family;

    const parent = getBaseLanguageData('p', 'Parent');
    parent.scope = LanguageScope.Language;
    // no populationEstimate -> defaults to 1

    const child = getBaseLanguageData('c', 'Child');
    child.scope = LanguageScope.Language;
    child.populationEstimate = 1; // explicitly 1

    const nestedFamily = getBaseLanguageData('nf', 'Nested Family');
    nestedFamily.scope = LanguageScope.Family;
    nestedFamily.childLanguages = [child];

    family.childLanguages = [parent, nestedFamily];

    (getAllVitalityScores as unknown as Mock).mockImplementation((lang: LanguageData) => {
      if (lang.ID === 'p') {
        return {
          [VitalitySource.ISO]: { score: 9 },
          [VitalitySource.Eth2013]: { score: 9 },
          [VitalitySource.Eth2025]: { score: 9 },
          [VitalitySource.Metascore]: { score: 9 },
        } as AllVitalityInfo;
      }
      if (lang.ID === 'c') {
        return {
          [VitalitySource.ISO]: { score: 0 },
          [VitalitySource.Eth2013]: { score: 0 },
          [VitalitySource.Eth2025]: { score: 0 },
          [VitalitySource.Metascore]: { score: 0 },
        } as AllVitalityInfo;
      }
      return {} as AllVitalityInfo;
    });

    const result = getFamilyVitalityScores(family);

    // Two descendants with equal weight 1 -> average 4.5 for ISO → Constructed
    expect(result[VitalitySource.ISO].score).toBeCloseTo(4.5, 5);
    expect(result[VitalitySource.ISO].label).toBe('Constructed');
  });
});

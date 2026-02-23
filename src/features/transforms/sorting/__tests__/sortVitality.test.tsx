import { describe, expect, it } from 'vitest';

import computeRecursiveLanguageData from '@features/data/compute/computeRecursiveLanguageData';
import { ObjectType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { getBaseLanguageData, LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';

import { getSortFunctionParameterized } from '../sort';
import { SortBehavior } from '../SortTypes';

// Helper to create a language with vitality data
function createLanguageWithVitality(
  code: LanguageCode,
  name: string,
  vitality: Partial<{
    iso: LanguageISOStatus;
    eth2012: VitalityEthnologueFine;
    eth2025: VitalityEthnologueCoarse;
  }>,
): LanguageData {
  const lang = getBaseLanguageData(code, name);
  lang.vitality = {};
  if (vitality.iso) lang.vitality.iso = vitality.iso;
  if (vitality.eth2012) lang.Ethnologue.vitality2012 = vitality.eth2012;
  if (vitality.eth2025) lang.Ethnologue.vitality2025 = vitality.eth2025;
  return lang;
}

describe('Vitality Sorting', () => {
  describe('VitalityMetascore', () => {
    it('sorts languages by metascore high to low', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {
          eth2012: VitalityEthnologueFine.National,
          eth2025: VitalityEthnologueCoarse.Institutional,
        }), // 9
        createLanguageWithVitality('fr', 'French', { eth2012: VitalityEthnologueFine.Threatened }), // 4
        createLanguageWithVitality('es', 'Spanish', { eth2012: VitalityEthnologueFine.Shifting }), // 3
      ];
      computeRecursiveLanguageData(langs);

      const sortFn = getSortFunctionParameterized(Field.VitalityMetascore, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en'); // highest score
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('es'); // lowest score
    });

    it('sorts languages without vitality data to the end', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {}), // no data = -1
        createLanguageWithVitality('fr', 'French', { eth2012: VitalityEthnologueFine.Threatened }), // 4
      ];
      computeRecursiveLanguageData(langs);

      const sortFn = getSortFunctionParameterized(Field.VitalityMetascore, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('fr'); // has data
      expect(sorted[1].codeDisplay).toBe('en'); // no data
    });

    it('uses secondarySortBy (e.g. Population) as tie-breaker when primary ties', () => {
      const langs = [
        createLanguageWithVitality('a', 'A', { eth2012: VitalityEthnologueFine.Threatened }),
        createLanguageWithVitality('b', 'B', { eth2012: VitalityEthnologueFine.Threatened }),
        createLanguageWithVitality('c', 'C', { eth2012: VitalityEthnologueFine.Threatened }),
      ];
      langs[0].populationEstimate = 100;
      langs[1].populationEstimate = 300;
      langs[2].populationEstimate = 200;
      computeRecursiveLanguageData(langs);

      const sortFn = getSortFunctionParameterized(
        Field.VitalityMetascore,
        SortBehavior.Normal,
        Field.Population,
      );
      const sorted = [...langs].sort(sortFn);

      // Same vitality → order by population descending: b (300), c (200), a (100)
      expect(sorted[0].codeDisplay).toBe('b');
      expect(sorted[1].codeDisplay).toBe('c');
      expect(sorted[2].codeDisplay).toBe('a');
    });

    it('sorts non-language objects to the end', () => {
      const lang = createLanguageWithVitality('en', 'English', {
        eth2012: VitalityEthnologueFine.National,
      });
      const territory: TerritoryData = {
        type: ObjectType.Territory,
        ID: 'US',
        codeDisplay: 'US',
        nameDisplay: 'United States',
        names: ['United States'],
        scope: TerritoryScope.Country,
        population: 0,
        populationFromUN: 0,
      };
      computeRecursiveLanguageData([lang]);

      const sortFn = getSortFunctionParameterized(Field.VitalityMetascore, SortBehavior.Normal);
      const sorted = [territory, lang].sort(sortFn);

      expect(sorted[0].type).toBe(ObjectType.Language); // language first
      expect(sorted[1].type).toBe(ObjectType.Territory); // territory last
    });
  });

  describe('LanguageISOStatus', () => {
    it('sorts by ISO vitality scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', { iso: LanguageISOStatus.Living }), // 9
        createLanguageWithVitality('eo', 'Esperanto', { iso: LanguageISOStatus.Constructed }), // 3
        createLanguageWithVitality('la', 'Latin', { iso: LanguageISOStatus.Extinct }), // 0
      ];

      const sortFn = getSortFunctionParameterized(Field.ISOStatus, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('eo');
      expect(sorted[2].codeDisplay).toBe('la');
    });
  });

  describe('VitalityEthnologueFine', () => {
    it('sorts by Ethnologue 2012 scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', { eth2012: VitalityEthnologueFine.National }), // 9
        createLanguageWithVitality('fr', 'French', { eth2012: VitalityEthnologueFine.Threatened }), // 4
        createLanguageWithVitality('gd', 'Scottish Gaelic', {
          eth2012: VitalityEthnologueFine.Shifting,
        }), // 3
      ];

      const sortFn = getSortFunctionParameterized(
        Field.VitalityEthnologueFine,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('gd');
    });
  });

  describe('VitalityEthnologueCoarse', () => {
    it('sorts by Ethnologue 2025 scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {
          eth2025: VitalityEthnologueCoarse.Institutional,
        }), // 9
        createLanguageWithVitality('fr', 'French', {
          eth2025: VitalityEthnologueCoarse.Stable,
        }), // 6
        createLanguageWithVitality('gd', 'Scottish Gaelic', {
          eth2025: VitalityEthnologueCoarse.Endangered,
        }), // 3
      ];

      const sortFn = getSortFunctionParameterized(
        Field.VitalityEthnologueCoarse,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('gd');
    });
  });
});

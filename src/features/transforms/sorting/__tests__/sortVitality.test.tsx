import { describe, expect, it } from 'vitest';

import computeRecursiveLanguageData from '@features/data/compute/computeRecursiveLanguageData';
import { EntityType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { getBaseLanguageData, LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';

import { getSortFunctionParameterized } from '../sort';
import { SortBehavior } from '../SortTypes';

// Helper to create a language with vitality data
function createLanguageWithVitality(
  code: LanguageCode,
  name: string,
  isoStatus?: LanguageISOStatus,
): LanguageData {
  const lang = getBaseLanguageData(code, name);
  lang.ISO.status = isoStatus;
  return lang;
}

describe('Vitality Sorting', () => {
  describe('VitalityMetascore', () => {
    it('sorts languages by metascore high to low', () => {
      const langs = [
        createLanguageWithVitality('eng', 'English', LanguageISOStatus.Living), // 9
        createLanguageWithVitality('epo', 'Esperanto', LanguageISOStatus.Constructed), // 3
        createLanguageWithVitality('lat', 'Latin', LanguageISOStatus.Historical), // 1
      ];
      computeRecursiveLanguageData(langs);

      const sortFn = getSortFunctionParameterized(Field.VitalityMetascore, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('eng'); // highest score
      expect(sorted[1].codeDisplay).toBe('epo');
      expect(sorted[2].codeDisplay).toBe('lat'); // lowest score
    });

    it('sorts languages without vitality data to the end', () => {
      const langs = [
        createLanguageWithVitality('eng', 'English', undefined), // no data = -1
        createLanguageWithVitality('epo', 'Esperanto', LanguageISOStatus.Constructed), // 3
      ];
      computeRecursiveLanguageData(langs);

      const sortFn = getSortFunctionParameterized(Field.VitalityMetascore, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('epo'); // has data
      expect(sorted[1].codeDisplay).toBe('eng'); // no data
    });

    it('uses secondarySortBy (e.g. Population) as tie-breaker when primary ties', () => {
      const langs = [
        createLanguageWithVitality('a', 'A', LanguageISOStatus.Constructed),
        createLanguageWithVitality('b', 'B', LanguageISOStatus.Constructed),
        createLanguageWithVitality('c', 'C', LanguageISOStatus.Constructed),
      ];
      langs[0].pop.overall = 100;
      langs[1].pop.overall = 300;
      langs[2].pop.overall = 200;
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

    it('sorts non-language entities to the end', () => {
      const lang = createLanguageWithVitality('en', 'English', LanguageISOStatus.Living);
      const territory: TerritoryData = {
        type: EntityType.Territory,
        ID: 'US',
        codeDisplay: 'US',
        nameDisplay: 'United States',
        names: ['United States'],
        scope: TerritoryScope.Country,
        pop: { overall: 0 },
      };
      computeRecursiveLanguageData([lang]);

      const sortFn = getSortFunctionParameterized(Field.VitalityMetascore, SortBehavior.Normal);
      const sorted = [territory, lang].sort(sortFn);

      expect(sorted[0].type).toBe(EntityType.Language); // language first
      expect(sorted[1].type).toBe(EntityType.Territory); // territory last
    });
  });

  describe('LanguageISOStatus', () => {
    it('sorts by ISO vitality scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', LanguageISOStatus.Living), // 9
        createLanguageWithVitality('eo', 'Esperanto', LanguageISOStatus.Constructed), // 3
        createLanguageWithVitality('la', 'Latin', LanguageISOStatus.Extinct), // 0
      ];

      const sortFn = getSortFunctionParameterized(Field.ISOStatus, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('eo');
      expect(sorted[2].codeDisplay).toBe('la');
    });
  });
});

import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';

import { getBaseLanguageData, LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { precomputeLanguageVitality } from '@entities/language/vitality/LanguageVitalityComputation';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

import { getSortFunctionParameterized } from '../sort';
import { SortBehavior, SortBy } from '../SortTypes';

// Helper to create a language with vitality data
function createLanguageWithVitality(
  code: LanguageCode,
  name: string,
  vitality: Partial<{
    iso: LanguageISOStatus;
    eth2013: VitalityEthnologueFine;
    eth2025: VitalityEthnologueCoarse;
  }>,
): LanguageData {
  const lang = getBaseLanguageData(code, name);
  lang.vitality = {};
  if (vitality.iso) lang.vitality.iso = vitality.iso;
  if (vitality.eth2013) lang.vitality.ethnologue2013 = vitality.eth2013;
  if (vitality.eth2025) lang.vitality.ethnologue2025 = vitality.eth2025;
  return lang;
}

describe('Vitality Sorting', () => {
  describe('VitalityMetascore', () => {
    it('sorts languages by metascore high to low', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {
          eth2013: VitalityEthnologueFine.National,
          eth2025: VitalityEthnologueCoarse.Institutional,
        }), // 9
        createLanguageWithVitality('fr', 'French', { eth2013: VitalityEthnologueFine.Threatened }), // 4
        createLanguageWithVitality('es', 'Spanish', { eth2013: VitalityEthnologueFine.Shifting }), // 3
      ];
      precomputeLanguageVitality(langs);

      const sortFn = getSortFunctionParameterized(SortBy.VitalityMetascore, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en'); // highest score
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('es'); // lowest score
    });

    it('sorts languages without vitality data to the end', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {}), // no data = -1
        createLanguageWithVitality('fr', 'French', { eth2013: VitalityEthnologueFine.Threatened }), // 4
      ];
      precomputeLanguageVitality(langs);

      const sortFn = getSortFunctionParameterized(SortBy.VitalityMetascore, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('fr'); // has data
      expect(sorted[1].codeDisplay).toBe('en'); // no data
    });

    it('sorts non-language objects to the end', () => {
      const lang = createLanguageWithVitality('en', 'English', {
        eth2013: VitalityEthnologueFine.National,
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
      precomputeLanguageVitality([lang]);

      const sortFn = getSortFunctionParameterized(SortBy.VitalityMetascore, SortBehavior.Normal);
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

      const sortFn = getSortFunctionParameterized(SortBy.ISOStatus, SortBehavior.Normal);
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('eo');
      expect(sorted[2].codeDisplay).toBe('la');
    });
  });

  describe('VitalityEthnologue2013', () => {
    it('sorts by Ethnologue 2013 scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', { eth2013: VitalityEthnologueFine.National }), // 9
        createLanguageWithVitality('fr', 'French', { eth2013: VitalityEthnologueFine.Threatened }), // 4
        createLanguageWithVitality('gd', 'Scottish Gaelic', {
          eth2013: VitalityEthnologueFine.Shifting,
        }), // 3
      ];

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityEthnologue2013,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('gd');
    });
  });

  describe('VitalityEthnologue2025', () => {
    it('sorts by Ethnologue 2025 scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {
          eth2025: VitalityEthnologueCoarse.Institutional,
        }), // 9
        createLanguageWithVitality('fr', 'French', { eth2025: VitalityEthnologueCoarse.Stable }), // 6
        createLanguageWithVitality('gd', 'Scottish Gaelic', {
          eth2025: VitalityEthnologueCoarse.Endangered,
        }), // 3
      ];

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityEthnologue2025,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('gd');
    });
  });
});

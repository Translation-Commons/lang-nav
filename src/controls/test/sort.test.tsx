import { describe, it, expect } from 'vitest';

import { TerritoryData } from '../../types/DataTypes';
import { getBaseLanguageData, LanguageData, LanguageSource } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';
import { SortBy, SortBehavior } from '../../types/SortTypes';
import { getSortFunctionParameterized } from '../sort';

// Helper to create a language with vitality data
function createLanguageWithVitality(
  code: string,
  name: string,
  vitality: Partial<{
    iso: string;
    eth2013: string;
    eth2025: string;
  }>,
): LanguageData {
  const lang = getBaseLanguageData(code, name);
  if (vitality.iso) lang.vitalityISO = vitality.iso;
  if (vitality.eth2013) lang.vitalityEth2013 = vitality.eth2013;
  if (vitality.eth2025) lang.vitalityEth2025 = vitality.eth2025;
  return lang;
}

describe('Vitality Sorting', () => {
  describe('VitalityMetascore', () => {
    it('sorts languages by metascore high to low', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {
          eth2013: 'National',
          eth2025: '1 Institutional',
        }), // 9
        createLanguageWithVitality('fr', 'French', { eth2013: 'Vigorous' }), // 4
        createLanguageWithVitality('es', 'Spanish', { eth2013: 'Shifting' }), // 3
      ];

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityMetascore,
        LanguageSource.ISO,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en'); // highest score
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('es'); // lowest score
    });

    it('sorts languages without vitality data to the end', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', {}), // no data = -1
        createLanguageWithVitality('fr', 'French', { eth2013: 'Vigorous' }), // 4
      ];

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityMetascore,
        LanguageSource.ISO,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('fr'); // has data
      expect(sorted[1].codeDisplay).toBe('en'); // no data
    });

    it('sorts non-language objects to the end', () => {
      const lang = createLanguageWithVitality('en', 'English', { eth2013: 'National' });
      const territory: TerritoryData = {
        type: ObjectType.Territory,
        ID: 'US',
        codeDisplay: 'US',
        nameDisplay: 'United States',
        names: ['United States'],
        scope: 'Country' as TerritoryData['scope'],
        population: 0,
      };

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityMetascore,
        LanguageSource.ISO,
        SortBehavior.Normal,
      );
      const sorted = [territory, lang].sort(sortFn);

      expect(sorted[0].type).toBe(ObjectType.Language); // language first
      expect(sorted[1].type).toBe(ObjectType.Territory); // territory last
    });
  });

  describe('VitalityISO', () => {
    it('sorts by ISO vitality scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', { iso: 'Living' }), // 9
        createLanguageWithVitality('eo', 'Esperanto', { iso: 'Constructed' }), // 3
        createLanguageWithVitality('la', 'Latin', { iso: 'Extinct' }), // 0
      ];

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityISO,
        LanguageSource.ISO,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('eo');
      expect(sorted[2].codeDisplay).toBe('la');
    });
  });

  describe('VitalityEthnologue2013', () => {
    it('sorts by Ethnologue 2013 scores', () => {
      const langs = [
        createLanguageWithVitality('en', 'English', { eth2013: 'National' }), // 9
        createLanguageWithVitality('fr', 'French', { eth2013: 'Vigorous' }), // 4
        createLanguageWithVitality('gd', 'Scottish Gaelic', { eth2013: 'Shifting' }), // 3
      ];

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityEthnologue2013,
        LanguageSource.ISO,
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
        createLanguageWithVitality('en', 'English', { eth2025: '1 Institutional' }), // 9
        createLanguageWithVitality('fr', 'French', { eth2025: '2 Stable' }), // 6
        createLanguageWithVitality('gd', 'Scottish Gaelic', { eth2025: '3 Endangered' }), // 3
      ];

      const sortFn = getSortFunctionParameterized(
        SortBy.VitalityEthnologue2025,
        LanguageSource.ISO,
        SortBehavior.Normal,
      );
      const sorted = [...langs].sort(sortFn);

      expect(sorted[0].codeDisplay).toBe('en');
      expect(sorted[1].codeDisplay).toBe('fr');
      expect(sorted[2].codeDisplay).toBe('gd');
    });
  });
});

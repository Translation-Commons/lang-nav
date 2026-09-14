import { useMemo } from 'react';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';
import { LanguageData } from '@entities/language/LanguageTypes';
import { getRootLanguageFamilyForEntity } from '@entities/language/relations/LanguageFamilyUtils';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { groupByArray, uniqueBy } from '@shared/lib/setUtils';

export type TerritoryLanguageStats = {
  languageCount: number;
  primaryFamilies: string[];
  topLanguage: LanguageData | undefined;
};

export default function useTerritoryLanguageStats(
  territory: TerritoryData | undefined,
): TerritoryLanguageStats {
  return useMemo(() => {
    const locales = territory?.locales ?? [];
    const languages = uniqueBy(
      locales
        .map((locale) => locale.language)
        .filter((lang): lang is LanguageData => lang != null),
      (lang) => lang.ID,
    );

    const familyGroups = groupByArray(
      languages
        .map((lang) => getRootLanguageFamilyForEntity(lang)?.nameDisplay)
        .filter((name): name is string => name != null),
      (name) => name,
    );
    const primaryFamilies = [...familyGroups]
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 2)
      .map(([name]) => name);

    const topLanguage = [...languages].sort(
      (a, b) => (getEntityPopulation(b) ?? 0) - (getEntityPopulation(a) ?? 0),
    )[0];

    return {
      languageCount: languages.length,
      primaryFamilies,
      topLanguage,
    };
  }, [territory]);
}

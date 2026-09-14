import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';
import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { getRootLanguageFamilyForEntity } from '@entities/language/relations/LanguageFamilyUtils';

import { groupByArray } from '@shared/lib/setUtils';

import isLivingLanguage from './isLivingLanguage';

export type GlobalLanguageStats = {
  totalLivingLanguages: number;
  familyCount: number;
  languagesForHalfOfHumanity: number;
  topLanguageByPopulation: LanguageData | undefined;
  writingSystemCount: number;
  languagesWithWritingSystem: number;
  largestFamily: { name: string; languageCount: number } | undefined;
};

export default function useGlobalLanguageStats(): GlobalLanguageStats {
  const { languagesInSelectedSource, writingSystems } = useDataContext();

  return useMemo(() => {
    const livingLanguages = languagesInSelectedSource.filter(isLivingLanguage);
    const familyCount = languagesInSelectedSource.filter(
      (lang) => lang.scope === LanguageScope.Family,
    ).length;

    const sortedByPopulation = [...livingLanguages].sort(sortByPopulation);
    const topLanguageByPopulation = sortedByPopulation[0];

    const totalPopulation = livingLanguages.reduce(
      (sum, lang) => sum + (getEntityPopulation(lang) ?? 0),
      0,
    );
    const halfPopulation = totalPopulation / 2;
    let runningTotal = 0;
    let languagesForHalfOfHumanity = 0;
    for (const lang of sortedByPopulation) {
      if (runningTotal >= halfPopulation) break;
      runningTotal += getEntityPopulation(lang) ?? 0;
      languagesForHalfOfHumanity++;
    }

    const languagesWithWritingSystem = livingLanguages.filter(
      (lang) => lang.primaryWritingSystem != null,
    ).length;

    const familyGroups = groupByArray(
      livingLanguages
        .map((lang) => getRootLanguageFamilyForEntity(lang))
        .filter((fam): fam is LanguageData => fam != null),
      (fam) => fam.ID,
    );
    const largestFamilyGroup = [...familyGroups].sort(([, a], [, b]) => b.length - a.length)[0];
    const largestFamily = largestFamilyGroup
      ? { name: largestFamilyGroup[1][0].nameDisplay, languageCount: largestFamilyGroup[1].length }
      : undefined;

    return {
      totalLivingLanguages: livingLanguages.length,
      familyCount,
      languagesForHalfOfHumanity,
      topLanguageByPopulation,
      writingSystemCount: writingSystems.length,
      languagesWithWritingSystem,
      largestFamily,
    };
  }, [languagesInSelectedSource, writingSystems]);
}

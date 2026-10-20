import { sortByPopulation } from '@features/transforms/sorting/sort';

import { getEntityLocales } from '@entities/lib/getEntityRelatedTerritories';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

function computeDescendantPopulation(writingSystems: WritingSystemData[]): void {
  // Organizing writing systems by population is a bit funny because some fundamental writing systems
  // like Egyptian have no people but writing systems that descend from then certainly do. Thereby we
  // separately compute an upper bound for how many people speak the descendants. This is safe
  // recursively because the writing system lineage is not a cycle.
  Object.values(writingSystems)
    .filter((writingSystem) => writingSystem.parentWritingSystem == null)
    .forEach(computeWritingSystemDescendantPopulation);
}

function computeWritingSystemDescendantPopulation(writingSystem: WritingSystemData): number {
  const { childWritingSystems } = writingSystem;
  const descendantPopulation =
    childWritingSystems?.reduce(
      (total, childSystem) => total + computeWritingSystemDescendantPopulation(childSystem),
      0,
    ) || 0;
  writingSystem.populationOfDescendants = descendantPopulation || undefined;
  return descendantPopulation + (writingSystem.population ?? 0);
}

export function computeWritingSystemsPopulation(writingSystems: WritingSystemData[]): void {
  // Get regular populations from locales
  writingSystems.forEach((ws) => {
    const locs = uniqueBy(getEntityLocales(ws), (l) => l.territoryCode ?? '');
    ws.population = sumBy(locs, (l) => l.pop.writing.adjusted) || undefined;
  });

  // Manually set populations when we know we typically use Jpan and Kore as the locale marker that are equivalent
  const Hang = writingSystems.find((ws) => ws.ID === 'Hang');
  const Kana = writingSystems.find((ws) => ws.ID === 'Kana');
  const Hira = writingSystems.find((ws) => ws.ID === 'Hira');
  const Jpan = writingSystems.find((ws) => ws.ID === 'Jpan');
  if (Hang) Hang.population = writingSystems.find((ws) => ws.ID === 'Kore')?.population;
  if (Kana) Kana.population = Jpan?.population;
  if (Hira) Hira.population = Jpan?.population;

  // Compute population for writing system groups
  writingSystems
    .filter((ws) => ws.scope === WritingSystemScope.Group)
    .forEach((ws) => {
      // Get the locales for the group and the descendents
      let locs = getAllRecursiveContainedLocales(ws);

      // Limit languages for Korean and Japanese to prevent overcounting Hani
      if (ws.ID === 'Kore') {
        locs = locs.filter((l) => l.languageCode === 'kor' || l.languageCode === 'cia');
      } else if (ws.ID === 'Jpan') {
        locs = locs.filter((l) => l.languageCode === 'jpn');
      }

      // Only count 1 language per territory, the biggest in each
      locs = uniqueBy(locs.sort(sortByPopulation), (l) => l.territoryCode ?? '');
      ws.population = sumBy(locs, (l) => l.pop.writing.adjusted);
    });

  // finally compute the descendent population (used for sorting the hierarchy)
  computeDescendantPopulation(writingSystems);
}

function getAllRecursiveContainedLocales(writingSystem: WritingSystemData): LocaleData[] {
  const descendentLocales = writingSystem.containsWritingSystems?.flatMap(
    getAllRecursiveContainedLocales,
  );

  return [...(descendentLocales ?? []), ...getEntityLocales(writingSystem)];
}

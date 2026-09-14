import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { sortByPopulation } from '@features/transforms/sorting/sort';
import isLivingLanguage from '@features/transforms/stats/isLivingLanguage';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';

import { Card, CardContent } from '@shared/ui/card';
import CountOfPeople from '@shared/ui/CountOfPeople';

const TOP_LANGUAGE_COUNT = 10;

const IntroLandscapeByScale: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  const topLanguages = useMemo(
    () =>
      languagesInSelectedSource
        .filter(isLivingLanguage)
        .slice()
        .sort(sortByPopulation)
        .slice(0, TOP_LANGUAGE_COUNT),
    [languagesInSelectedSource],
  );

  if (topLanguages.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">Loading languages…</CardContent>
      </Card>
    );
  }

  const maxPopulation = getEntityPopulation(topLanguages[0]) ?? 1;

  return (
    <Card>
      <CardContent className="flex flex-col divide-y divide-border">
        {topLanguages.map((lang, index) => {
          const population = getEntityPopulation(lang) ?? 0;
          return (
            <div key={lang.ID} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-6 shrink-0 text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="w-36 shrink-0 truncate font-medium">{lang.nameDisplay}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(population / maxPopulation) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-muted-foreground">
                <CountOfPeople count={population} />
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default IntroLandscapeByScale;

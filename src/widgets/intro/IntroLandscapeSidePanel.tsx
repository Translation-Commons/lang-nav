import { Link } from 'react-router-dom';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useGlobalLanguageStats from '@features/transforms/stats/useGlobalLanguageStats';
import useTerritoryLanguageStats from '@features/transforms/stats/useTerritoryLanguageStats';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';

import { buttonVariants } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import CountOfPeople from '@shared/ui/CountOfPeople';

const IntroLandscapeSidePanel: React.FC = () => {
  const { entID, colorBy, updatePageParams } = usePageParams();
  const { getTerritory } = useDataContext();
  const globalStats = useGlobalLanguageStats();
  const territory = entID ? getTerritory(entID) : undefined;
  const territoryStats = useTerritoryLanguageStats(territory);

  if (territory) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Territory dossier</CardDescription>
          <CardTitle className="text-xl">{territory.nameDisplay}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div>
            <span className="text-2xl font-bold text-primary">{territoryStats.languageCount}</span>{' '}
            <span className="text-muted-foreground">living languages</span>
          </div>
          {territoryStats.primaryFamilies.length > 0 && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Primary families</span>
              <span className="text-right">{territoryStats.primaryFamilies.join(', ')}</span>
            </div>
          )}
          {territoryStats.topLanguage && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Top language</span>
              <span className="text-right">
                {territoryStats.topLanguage.nameDisplay}:{' '}
                <CountOfPeople count={getEntityPopulation(territoryStats.topLanguage)} />
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => updatePageParams({ entID: undefined })}
            >
              Clear selection
            </button>
            <Link
              to={`/data?entType=${EntityType.Locale}&territoryFilter=${territory.ID}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              View all languages in {territory.nameDisplay}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (colorBy === Field.Population) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Lens: Most spoken</CardDescription>
          <CardTitle className="text-xl">
            {globalStats.topLanguageByPopulation?.nameDisplay ?? 'Loading…'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {globalStats.topLanguageByPopulation && (
            <div>
              <CountOfPeople count={getEntityPopulation(globalStats.topLanguageByPopulation)} />{' '}
              <span className="text-muted-foreground">speakers, more than any other language</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reach half of humanity</span>
            <span>{globalStats.languagesForHalfOfHumanity} languages</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (colorBy === Field.CountOfWritingSystems) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Lens: Writing systems</CardDescription>
          <CardTitle className="text-xl">
            {globalStats.writingSystemCount} writing systems
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">In active use</span>
            <span>{globalStats.writingSystemCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Languages with a documented script</span>
            <span>{globalStats.languagesWithWritingSystem}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (colorBy === Field.LanguageFamily) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Lens: Language families</CardDescription>
          <CardTitle className="text-xl">{globalStats.familyCount} families identified</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {globalStats.largestFamily && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Largest family</span>
              <span className="text-right">
                {globalStats.largestFamily.name} ({globalStats.largestFamily.languageCount}{' '}
                languages)
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>Global snapshot</CardDescription>
        <CardTitle className="text-3xl text-primary">{globalStats.totalLivingLanguages}</CardTitle>
        <CardDescription>living languages</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Language families</span>
          <span>~{globalStats.familyCount} identified</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Reach half of humanity</span>
          <span>{globalStats.languagesForHalfOfHumanity} languages</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Search for a country, click any dot on the map, or switch on a lens to change the story.
        </p>
      </CardContent>
    </Card>
  );
};

export default IntroLandscapeSidePanel;

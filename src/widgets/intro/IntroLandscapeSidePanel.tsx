import React from 'react';
import { Link } from 'react-router-dom';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useGlobalLanguageStats, {
  GlobalLanguageStats,
} from '@features/transforms/stats/useGlobalLanguageStats';
import useTerritoryLanguageStats, {
  TerritoryLanguageStats,
} from '@features/transforms/stats/useTerritoryLanguageStats';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { buttonVariants } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import CountOfPeople from '@shared/ui/CountOfPeople';

type LandscapeCardProps = {
  description: string;
  title: React.ReactNode;
  titleClassName?: string;
  extraDescription?: React.ReactNode;
  children: React.ReactNode;
};

const LandscapeCard: React.FC<LandscapeCardProps> = ({
  description,
  title,
  titleClassName = 'text-xl',
  extraDescription,
  children,
}) => (
  <Card>
    <CardHeader>
      <CardDescription>{description}</CardDescription>
      <CardTitle className={titleClassName}>{title}</CardTitle>
      {extraDescription && <CardDescription>{extraDescription}</CardDescription>}
    </CardHeader>
    <CardContent className="flex flex-col gap-3 text-sm">{children}</CardContent>
  </Card>
);

type TerritoryDossierCardProps = {
  territory: TerritoryData;
  stats: TerritoryLanguageStats;
  onClear: () => void;
};

const TerritoryDossierCard: React.FC<TerritoryDossierCardProps> = ({
  territory,
  stats,
  onClear,
}) => (
  <LandscapeCard description="Territory dossier" title={territory.nameDisplay}>
    <div>
      <span className="text-2xl font-bold text-primary">{stats.languageCount}</span>{' '}
      <span className="text-muted-foreground">living languages</span>
    </div>
    {stats.primaryFamilies.length > 0 && (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Primary families</span>
        <span className="text-right">{stats.primaryFamilies.join(', ')}</span>
      </div>
    )}
    {stats.topLanguage && (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Top language</span>
        <span className="text-right">
          {stats.topLanguage.nameDisplay}:{' '}
          <CountOfPeople count={getEntityPopulation(stats.topLanguage)} />
        </span>
      </div>
    )}
    <div className="mt-2 flex items-center justify-between gap-2">
      <button type="button" className="text-xs text-muted-foreground underline" onClick={onClear}>
        Clear selection
      </button>
      <Link
        to={`/data?entType=${EntityType.Locale}&territoryFilter=${territory.ID}`}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        View all languages in {territory.nameDisplay}
      </Link>
    </div>
  </LandscapeCard>
);

const MostSpokenLensCard: React.FC<{ stats: GlobalLanguageStats }> = ({ stats }) => (
  <LandscapeCard
    description="Lens: Most spoken"
    title={stats.topLanguageByPopulation?.nameDisplay ?? 'Loading…'}
  >
    {stats.topLanguageByPopulation && (
      <div>
        <CountOfPeople count={getEntityPopulation(stats.topLanguageByPopulation)} />{' '}
        <span className="text-muted-foreground">speakers, more than any other language</span>
      </div>
    )}
    <div className="flex justify-between">
      <span className="text-muted-foreground">Reach half of humanity</span>
      <span>{stats.languagesForHalfOfHumanity} languages</span>
    </div>
  </LandscapeCard>
);

const WritingSystemsLensCard: React.FC<{ stats: GlobalLanguageStats }> = ({ stats }) => (
  <LandscapeCard
    description="Lens: Writing systems"
    title={`${stats.writingSystemCount} writing systems`}
  >
    <div className="flex justify-between">
      <span className="text-muted-foreground">In active use</span>
      <span>{stats.writingSystemCount}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Languages with a documented script</span>
      <span>{stats.languagesWithWritingSystem}</span>
    </div>
  </LandscapeCard>
);

const LanguageFamiliesLensCard: React.FC<{ stats: GlobalLanguageStats }> = ({ stats }) => (
  <LandscapeCard
    description="Lens: Language families"
    title={`${stats.familyCount} families identified`}
  >
    {stats.largestFamily && (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Largest family</span>
        <span className="text-right">
          {stats.largestFamily.name} ({stats.largestFamily.languageCount} languages)
        </span>
      </div>
    )}
  </LandscapeCard>
);

const GlobalSnapshotCard: React.FC<{ stats: GlobalLanguageStats }> = ({ stats }) => (
  <LandscapeCard
    description="Global snapshot"
    title={stats.totalLivingLanguages}
    titleClassName="text-3xl text-primary"
    extraDescription="living languages"
  >
    <div className="flex justify-between">
      <span className="text-muted-foreground">Language families</span>
      <span>~{stats.familyCount} identified</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Reach half of humanity</span>
      <span>{stats.languagesForHalfOfHumanity} languages</span>
    </div>
    <p className="text-xs text-muted-foreground">
      Search for a country, click any dot on the map, or switch on a lens to change the story.
    </p>
  </LandscapeCard>
);

const IntroLandscapeSidePanel: React.FC = () => {
  const { entID, colorBy, updatePageParams } = usePageParams();
  const { getTerritory } = useDataContext();
  const globalStats = useGlobalLanguageStats();
  const territory = entID ? getTerritory(entID) : undefined;
  const territoryStats = useTerritoryLanguageStats(territory);

  if (territory) {
    return (
      <TerritoryDossierCard
        territory={territory}
        stats={territoryStats}
        onClear={() => updatePageParams({ entID: undefined })}
      />
    );
  }

  if (colorBy === Field.Population) {
    return <MostSpokenLensCard stats={globalStats} />;
  }

  if (colorBy === Field.CountOfWritingSystems) {
    return <WritingSystemsLensCard stats={globalStats} />;
  }

  if (colorBy === Field.LanguageFamily) {
    return <LanguageFamiliesLensCard stats={globalStats} />;
  }

  return <GlobalSnapshotCard stats={globalStats} />;
};

export default IntroLandscapeSidePanel;

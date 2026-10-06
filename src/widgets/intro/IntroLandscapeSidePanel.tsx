import React from 'react';
import { Link } from 'react-router-dom';

import { useDataContext } from '@features/data/context/useDataContext';
import { getDataPageURL } from '@features/params/getDataPageURL';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useGlobalLanguageStats, {
  GlobalLanguageStats,
} from '@features/transforms/stats/useGlobalLanguageStats';
import useTerritoryLanguageStats from '@features/transforms/stats/useTerritoryLanguageStats';

import { getEntityPopulation } from '@entities/lib/getEntityPopulation';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { Button, buttonVariants } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import CountOfPeople from '@shared/ui/CountOfPeople';

type LandscapeCardProps = {
  description: string;
  title: React.ReactNode;
  children: React.ReactNode;
};

const LandscapeCard: React.FC<LandscapeCardProps> = ({ description, title, children }) => (
  <Card>
    <CardHeader>
      <CardDescription>{description}</CardDescription>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 text-sm">{children}</CardContent>
  </Card>
);

const StatRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex justify-between gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right">{children}</span>
  </div>
);

type TerritoryDossierCardProps = {
  territory: TerritoryData;
  onClear: () => void;
};

const TerritoryDossierCard: React.FC<TerritoryDossierCardProps> = ({ territory, onClear }) => {
  const { languageCount, primaryFamilies, topLanguage } = useTerritoryLanguageStats(territory);
  return (
    <LandscapeCard description="Territory dossier" title={territory.nameDisplay}>
      <div>
        <span className="text-2xl font-bold text-primary">{languageCount}</span>{' '}
        <span className="text-muted-foreground">living languages</span>
      </div>
      {primaryFamilies.length > 0 && (
        <StatRow label="Primary families">{primaryFamilies.join(', ')}</StatRow>
      )}
      {topLanguage && (
        <StatRow label="Top language">
          {topLanguage.nameDisplay}: <CountOfPeople count={getEntityPopulation(topLanguage)} />
        </StatRow>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <Button variant="link" size="sm" onClick={onClear}>
          Clear selection
        </Button>
        <Link
          to={getDataPageURL({ entType: EntityType.Locale, territoryFilter: territory.ID })}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          View all languages in {territory.nameDisplay}
        </Link>
      </div>
    </LandscapeCard>
  );
};

type StatsCardProps = { stats: GlobalLanguageStats };

const MostSpokenLensCard: React.FC<StatsCardProps> = ({ stats }) => (
  <LandscapeCard description="Lens: Most spoken" title={stats.topLanguageByPopulation?.nameDisplay}>
    {stats.topLanguageByPopulation && (
      <div>
        <CountOfPeople count={getEntityPopulation(stats.topLanguageByPopulation)} />{' '}
        <span className="text-muted-foreground">speakers, more than any other language</span>
      </div>
    )}
    <StatRow label="Reach half of humanity">{stats.languagesForHalfOfHumanity} languages</StatRow>
  </LandscapeCard>
);

const WritingSystemsLensCard: React.FC<StatsCardProps> = ({ stats }) => (
  <LandscapeCard
    description="Lens: Writing systems"
    title={`${stats.writingSystemCount} writing systems`}
  >
    <StatRow label="Languages with a documented script">{stats.languagesWithWritingSystem}</StatRow>
  </LandscapeCard>
);

const LanguageFamiliesLensCard: React.FC<StatsCardProps> = ({ stats }) => (
  <LandscapeCard
    description="Lens: Language families"
    title={`${stats.familyCount} families identified`}
  >
    {stats.largestFamily && (
      <StatRow label="Largest family">
        {stats.largestFamily.name} ({stats.largestFamily.languageCount} languages)
      </StatRow>
    )}
  </LandscapeCard>
);

const GlobalSnapshotCard: React.FC<StatsCardProps> = ({ stats }) => (
  <Card>
    <CardHeader>
      <CardDescription>Global snapshot</CardDescription>
      <CardTitle className="text-3xl text-primary">{stats.totalLivingLanguages}</CardTitle>
      <CardDescription>living languages</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 text-sm">
      <StatRow label="Language families">{stats.familyCount} identified</StatRow>
      <p className="text-xs text-muted-foreground">
        Search for a country, click any dot on the map, or switch on a lens to change the story.
      </p>
    </CardContent>
  </Card>
);

const LENS_CARDS: Partial<Record<Field, React.FC<StatsCardProps>>> = {
  [Field.Population]: MostSpokenLensCard,
  [Field.CountOfWritingSystems]: WritingSystemsLensCard,
  [Field.LanguageFamily]: LanguageFamiliesLensCard,
};

const IntroLandscapeSidePanel: React.FC = () => {
  const { entID, colorBy, updatePageParams } = usePageParams();
  const { getTerritory } = useDataContext();
  const globalStats = useGlobalLanguageStats();
  const territory = entID ? getTerritory(entID) : undefined;
  const LensCard = LENS_CARDS[colorBy] ?? GlobalSnapshotCard;

  return (
    <div aria-live="polite" className="grid">
      {territory ? (
        <TerritoryDossierCard
          territory={territory}
          onClear={() => updatePageParams({ entID: undefined })}
        />
      ) : (
        <LensCard stats={globalStats} />
      )}
    </div>
  );
};

export default IntroLandscapeSidePanel;

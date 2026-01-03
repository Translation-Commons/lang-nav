import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { PopulationSourceCategory } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import LanguagePopulationOfDescendants from './LanguagePopulationFromDescendants';
import LanguagePopulationFromLocales from './LanguagePopulationFromLocales';
import { LanguageData } from './LanguageTypes';

export const LanguagePopulationEstimate: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { populationEstimate, populationEstimateSource } = lang;

  if (!populationEstimate) return <Deemphasized>no data</Deemphasized>;

  switch (populationEstimateSource ?? PopulationSourceCategory.Other) {
    case PopulationSourceCategory.AggregatedFromTerritories:
      return <LanguagePopulationFromLocales lang={lang} />;
    case PopulationSourceCategory.AggregatedFromLanguages:
      return <LanguagePopulationOfDescendants lang={lang} />;
    case PopulationSourceCategory.Algorithmic:
      return (
        <Hoverable hoverContent="Algorithmically derived estimate based on various data sources.">
          <CountOfPeople count={populationEstimate} />
        </Hoverable>
      );
    case PopulationSourceCategory.Other:
      return (
        <Hoverable hoverContent="From various internet databases, working to get more citations">
          <CountOfPeople count={populationEstimate} />
        </Hoverable>
      );
  }
  return <Deemphasized>n/a</Deemphasized>;
};

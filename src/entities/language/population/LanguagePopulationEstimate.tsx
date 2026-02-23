import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from '../LanguageTypes';

import LanguagePopulationOfDescendants from './LanguagePopulationFromDescendants';
import LanguagePopulationFromEthnologue from './LanguagePopulationFromEthnologue';
import LanguagePopulationFromLocales from './LanguagePopulationFromLocales';

export const LanguagePopulationEstimate: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { populationEstimate, populationEstimateSource } = lang;

  if (!populationEstimate && populationEstimateSource !== PopulationSourceCategory.Ethnologue)
    return <Deemphasized>no data</Deemphasized>;

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
    case PopulationSourceCategory.Ethnologue:
      return <LanguagePopulationFromEthnologue lang={lang} />;
    case PopulationSourceCategory.Other:
      return (
        <Hoverable hoverContent="From various internet databases, working to get more citations">
          <CountOfPeople count={populationEstimate} />
        </Hoverable>
      );
  }
  return <Deemphasized>n/a</Deemphasized>;
};

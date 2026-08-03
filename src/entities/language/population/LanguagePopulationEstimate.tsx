import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from '../LanguageTypes';

import LanguagePopulationOfDescendants from './LanguagePopulationFromDescendants';
import LanguagePopulationFromLocales from './LanguagePopulationFromLocales';

export const LanguagePopulationEstimate: React.FC<{
  lang: LanguageData;
  use?: 'speaking' | 'writing';
}> = ({ lang, use }) => {
  use = use ?? (lang.pop.overall === lang.pop.writing.estimate ? 'writing' : 'speaking');
  const pop = lang.pop[use];

  if (pop.estimate == null) return <Deemphasized>no data</Deemphasized>;

  switch (pop.source ?? PopulationSourceCategory.Other) {
    case PopulationSourceCategory.AggregatedFromTerritories:
      return <LanguagePopulationFromLocales lang={lang} use={use} />;
    case PopulationSourceCategory.AggregatedFromLanguages:
      return <LanguagePopulationOfDescendants lang={lang} use={use} />;
    case PopulationSourceCategory.Algorithmic:
      return (
        <Hoverable hoverContent="Algorithmically derived estimate based on various data sources.">
          <CountOfPeople count={pop.estimate} />
        </Hoverable>
      );
    case PopulationSourceCategory.Other:
      return (
        <Hoverable hoverContent="From various internet databases, working to get more citations">
          <CountOfPeople count={pop.estimate} />
        </Hoverable>
      );
  }
  return <Deemphasized>n/a</Deemphasized>;
};

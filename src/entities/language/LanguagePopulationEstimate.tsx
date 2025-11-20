import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';

import Deemphasized from '@shared/ui/Deemphasized';

import LanguagePopulationOfDescendents from './LanguagePopulationFromDescendents';
import LanguagePopulationFromLocales from './LanguagePopulationFromLocales';
import { LanguageData } from './LanguageTypes';

export const LanguagePopulationEstimate: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { populationEstimate, populationOfDescendents, populationFromLocales } = lang;

  if (!populationEstimate) return <Deemphasized>no data</Deemphasized>;

  if (populationEstimate === populationFromLocales) {
    return <LanguagePopulationFromLocales lang={lang} />;
  }

  if (populationEstimate === populationOfDescendents) {
    return <LanguagePopulationOfDescendents lang={lang} />;
  }
  return (
    <Hoverable hoverContent="From internet databases, citation needed">
      {populationEstimate?.toLocaleString()}
    </Hoverable>
  );
};

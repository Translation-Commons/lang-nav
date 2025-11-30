import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import LanguagePopulationOfDescendants from './LanguagePopulationFromDescendants';
import LanguagePopulationFromLocales from './LanguagePopulationFromLocales';
import { LanguageData } from './LanguageTypes';

export const LanguagePopulationEstimate: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { populationEstimate, populationOfDescendants, populationFromLocales } = lang;

  if (!populationEstimate) return <Deemphasized>no data</Deemphasized>;

  if (populationEstimate === populationFromLocales) {
    return <LanguagePopulationFromLocales lang={lang} />;
  }

  if (populationEstimate === populationOfDescendants) {
    return <LanguagePopulationOfDescendants lang={lang} />;
  }
  return (
    <Hoverable hoverContent="From internet databases, citation needed">
      <CountOfPeople count={populationEstimate} />
    </Hoverable>
  );
};

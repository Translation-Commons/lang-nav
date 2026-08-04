import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import PopulationSourceCategoryDisplay from '@entities/ui/PopulationSourceCategoryDisplay';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
};

const LanguagePopulationSource: React.FC<Props> = ({ lang }) => {
  const { populationFocus } = usePageParams();
  const speakingOrWriting = getSpeakingOrWritingFocus(lang, populationFocus);
  const pop = lang.pop[speakingOrWriting];
  if (pop.estimate == null) return null;
  return <PopulationSourceCategoryDisplay sourceCategory={pop.source} />;
};

export default LanguagePopulationSource;

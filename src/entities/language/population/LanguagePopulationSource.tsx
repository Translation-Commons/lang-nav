import React from 'react';

import PopulationSourceCategoryDisplay from '@entities/ui/PopulationSourceCategoryDisplay';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
  use?: 'speaking' | 'writing';
};

const LanguagePopulationSource: React.FC<Props> = ({ lang, use }) => {
  use = use ?? (lang.pop.overall === lang.pop.writing.estimate ? 'writing' : 'speaking');
  const pop = lang.pop[use];
  if (pop.estimate == null) return null;
  return <PopulationSourceCategoryDisplay sourceCategory={pop.source} />;
};

export default LanguagePopulationSource;

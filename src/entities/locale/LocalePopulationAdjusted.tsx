import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LocaleData } from '@entities/locale/LocaleTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';

import LocalePopulationBreakdown from './LocalePopulationBreakdown';

type Props = {
  locale: LocaleData;
  use: 'speaking' | 'writing';
};

const LocalePopulationAdjusted: React.FC<Props> = ({ locale, use }) => {
  const pop = locale.pop[use];
  if (pop.adjusted == null) return null;

  return (
    <Hoverable hoverContent={<LocalePopulationBreakdown locale={locale} use={use} />}>
      <CountOfPeople count={pop.adjusted} />
    </Hoverable>
  );
};

export default LocalePopulationAdjusted;

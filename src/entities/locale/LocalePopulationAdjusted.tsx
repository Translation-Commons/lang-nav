import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LocaleData } from '@entities/locale/LocaleTypes';

import CountOfPeople from '@shared/ui/old/CountOfPeople';

import LocalePopulationBreakdown from './LocalePopulationBreakdown';

const LocalePopulationAdjusted: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  if (locale.pop.speaking.adjusted == null) return null;

  return (
    <Hoverable hoverContent={<LocalePopulationBreakdown locale={locale} />}>
      <CountOfPeople count={locale.pop.speaking.adjusted} />
    </Hoverable>
  );
};

export default LocalePopulationAdjusted;

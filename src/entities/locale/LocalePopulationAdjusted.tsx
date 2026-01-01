import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LocaleData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';

import LocalePopulationBreakdown from './LocalePopulationBreakdown';

const LocalePopulationAdjusted: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  if (locale.populationAdjusted == null) return null;

  return (
    <Hoverable hoverContent={<LocalePopulationBreakdown locale={locale} />}>
      <CountOfPeople count={locale.populationAdjusted} />
    </Hoverable>
  );
};

export default LocalePopulationAdjusted;

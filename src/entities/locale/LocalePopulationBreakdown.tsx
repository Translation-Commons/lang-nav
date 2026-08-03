import React from 'react';

import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import LocalePopulationBreakdownAdjusted from './LocalePopulationBreakdownAdjusted';
import LocalePopulationBreakdownAggregated from './LocalePopulationBreakdownAggregated';

type Props = {
  locale: LocaleData;
  speakingOrWriting: 'speaking' | 'writing';
};

const LocalePopulationBreakdown: React.FC<Props> = ({ locale, speakingOrWriting }) => {
  if (!locale.territory || locale.pop[speakingOrWriting].adjusted == null) return null;

  if (
    locale.pop[speakingOrWriting].source === PopulationSourceCategory.AggregatedFromLanguages ||
    locale.pop[speakingOrWriting].source === PopulationSourceCategory.AggregatedFromTerritories
  ) {
    return (
      <LocalePopulationBreakdownAggregated locale={locale} speakingOrWriting={speakingOrWriting} />
    );
  }

  return (
    <LocalePopulationBreakdownAdjusted locale={locale} speakingOrWriting={speakingOrWriting} />
  );
};

export default LocalePopulationBreakdown;

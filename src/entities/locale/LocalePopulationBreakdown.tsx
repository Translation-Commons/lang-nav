import React from 'react';

import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import LocalePopulationBreakdownAdjusted from './LocalePopulationBreakdownAdjusted';
import LocalePopulationBreakdownAggregated from './LocalePopulationBreakdownAggregated';

const LocalePopulationBreakdown: React.FC<{ locale: LocaleData; use: 'speaking' | 'writing' }> = ({
  locale,
  use,
}) => {
  if (!locale.territory || !locale.pop[use].adjusted) return null;

  if (
    locale.pop[use].source === PopulationSourceCategory.AggregatedFromLanguages ||
    locale.pop[use].source === PopulationSourceCategory.AggregatedFromTerritories
  ) {
    return <LocalePopulationBreakdownAggregated locale={locale} use={use} />;
  }

  return <LocalePopulationBreakdownAdjusted locale={locale} use={use} />;
};

export default LocalePopulationBreakdown;

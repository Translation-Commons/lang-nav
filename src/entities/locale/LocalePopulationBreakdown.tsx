import React from 'react';

import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import LocalePopulationBreakdownAdjusted from './LocalePopulationBreakdownAdjusted';
import LocalePopulationBreakdownAggregated from './LocalePopulationBreakdownAggregated';

const LocalePopulationBreakdown: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  if (!locale.territory || !locale.populationAdjusted) return null;

  if (
    locale.populationSource === PopulationSourceCategory.AggregatedFromLanguages ||
    locale.populationSource === PopulationSourceCategory.AggregatedFromTerritories
  ) {
    return <LocalePopulationBreakdownAggregated locale={locale} />;
  }

  return <LocalePopulationBreakdownAdjusted locale={locale} />;
};

export default LocalePopulationBreakdown;

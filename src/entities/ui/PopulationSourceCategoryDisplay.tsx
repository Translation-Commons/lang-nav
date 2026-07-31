import React from 'react';

import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const PopulationSourceCategoryDisplay: React.FC<{ sourceCategory?: PopulationSourceCategory }> = ({
  sourceCategory,
}) => {
  if (sourceCategory == null) return <Deemphasized>no citation</Deemphasized>;
  switch (sourceCategory) {
    case PopulationSourceCategory.AggregatedFromTerritories:
      return 'aggregated from countries';
    case PopulationSourceCategory.AggregatedFromLanguages:
      return 'aggregated from dialects';
    case PopulationSourceCategory.UnverifiedOfficial:
      return 'Official (but unverified)';
    case PopulationSourceCategory.Algorithmic:
    case PopulationSourceCategory.CLDR:
    case PopulationSourceCategory.EDL:
    case PopulationSourceCategory.Official:
    case PopulationSourceCategory.Study:
      return sourceCategory;
    case PopulationSourceCategory.Other:
    case PopulationSourceCategory.NoSource:
      return <Deemphasized>no citation</Deemphasized>;
  }
};

export default PopulationSourceCategoryDisplay;

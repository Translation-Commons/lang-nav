import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { CensusCollectorType, CensusData } from './CensusTypes';

function getPopulationSourceCategoryForCensus(census: CensusData): PopulationSourceCategory {
  if (census.presentedBy === 'CLDR') return PopulationSourceCategory.CLDR;

  switch (census.collectorType) {
    case CensusCollectorType.Government:
      return PopulationSourceCategory.Official;
    case CensusCollectorType.Study:
      return PopulationSourceCategory.Study;
    case CensusCollectorType.NGO:
    case CensusCollectorType.Media:
    case CensusCollectorType.Secondary:
    case CensusCollectorType.Unknown:
      return PopulationSourceCategory.Other;
    default:
      enforceExhaustiveSwitch(census.collectorType);
  }
}

export default getPopulationSourceCategoryForCensus;

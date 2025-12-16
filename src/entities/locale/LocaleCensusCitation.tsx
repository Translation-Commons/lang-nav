import React from 'react';

import HoverableObject from '@features/layers/hovercard/HoverableObject';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { LocaleData, PopulationSourceCategory } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  locale: LocaleData;
  size?: 'short' | 'full';
};

const LocaleCensusCitation: React.FC<Props> = ({ locale, size = 'full' }) => {
  const { populationCensus } = locale;
  if (populationCensus != null) {
    const { yearCollected, collectorName, collectorType } = populationCensus;
    if (collectorType === CensusCollectorType.CLDR) {
      // Leave out the date from CLDR, it's not available from the source
      return (
        <HoverableObject object={populationCensus}>
          {collectorName ?? collectorType}
        </HoverableObject>
      );
    }
    let name = collectorName;
    if (name == null || name === '' || size === 'short') {
      switch (collectorType) {
        case 'Government':
          name = locale.territory?.nameDisplay ?? locale.territoryCode;
          break;
        default:
          name = collectorType;
      }
    }
    return (
      <HoverableObject object={populationCensus}>
        {name} {yearCollected}
      </HoverableObject>
    );
  }
  if (size === 'short') {
    switch (locale.populationSource) {
      case PopulationSourceCategory.Official:
      case PopulationSourceCategory.UnverifiedOfficial:
      case PopulationSourceCategory.Study:
      case PopulationSourceCategory.Ethnologue:
        break; // Use the name below
      case PopulationSourceCategory.EDL:
        return 'EDL';
      case PopulationSourceCategory.CLDR:
        return 'CLDR';
      case PopulationSourceCategory.NoSource:
      case PopulationSourceCategory.Other:
        return <Deemphasized>no citation</Deemphasized>;
      case PopulationSourceCategory.AggregatedFromTerritories:
      case PopulationSourceCategory.AggregatedFromLanguages:
      case PopulationSourceCategory.Algorithmic:
        return <Deemphasized>aggregate</Deemphasized>;
    }
  }

  switch (locale.populationSource) {
    case PopulationSourceCategory.Official:
    case PopulationSourceCategory.UnverifiedOfficial:
      return (locale.territory?.nameDisplay ?? locale.territoryCode) + ' census'; // TODO add year
    case PopulationSourceCategory.Study:
      return 'Study'; // TODO add author, year
    case PopulationSourceCategory.Ethnologue:
      return 'Ethnologue'; // TODO add year
    case PopulationSourceCategory.EDL:
      return 'Endangered Languages Project'; // TODO add year
    case PopulationSourceCategory.CLDR:
      return 'Unicode Common Locale Data Repository';
    case PopulationSourceCategory.Other:
      return 'citation needed';
    case PopulationSourceCategory.NoSource:
      return 'no source';
    case PopulationSourceCategory.AggregatedFromLanguages:
    case PopulationSourceCategory.AggregatedFromTerritories:
    case PopulationSourceCategory.Algorithmic:
      return 'aggregated from other sources';
  }
};

export default LocaleCensusCitation;

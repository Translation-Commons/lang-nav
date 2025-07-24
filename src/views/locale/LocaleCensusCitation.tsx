import React from 'react';

import Deemphasized from '../../generic/Deemphasized';
import { CensusCollectorType } from '../../types/CensusTypes';
import { LocaleData, PopulationSourceCategory } from '../../types/DataTypes';
import HoverableObject from '../common/HoverableObject';

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
      case PopulationSourceCategory.Census:
      case PopulationSourceCategory.Study:
      case PopulationSourceCategory.Ethnologue:
        break; // Use the name below
      case PopulationSourceCategory.EDL:
        return 'EDL';
      case PopulationSourceCategory.NoSource:
        return <Deemphasized>no source</Deemphasized>;
      case PopulationSourceCategory.OtherCitation:
      case PopulationSourceCategory.GeneralizedData:
      case PopulationSourceCategory.Fallback:
      case PopulationSourceCategory.Aggregated:
        return <Deemphasized>rough estimate</Deemphasized>;
    }
  }

  switch (locale.populationSource) {
    case PopulationSourceCategory.Census:
      return (locale.territory?.nameDisplay ?? locale.territoryCode) + ' census'; // TODO add year
    case PopulationSourceCategory.Study:
      return 'Study'; // TODO add author, year
    case PopulationSourceCategory.Ethnologue:
      return 'Ethnologue'; // TODO add year
    case PopulationSourceCategory.EDL:
      return 'Endangered Languages Project'; // TODO add year
    case PopulationSourceCategory.OtherCitation:
      return 'weak source, better citation needed'; // TODO add info about the weak source
    case PopulationSourceCategory.GeneralizedData:
      return 'added up from other cited estimates';
    case PopulationSourceCategory.Fallback:
      return 'upper bound based on language / country populations';
    case PopulationSourceCategory.NoSource:
      return 'no source';
    case PopulationSourceCategory.Aggregated:
      return 'aggregated from other sources';
  }
};

export default LocaleCensusCitation;

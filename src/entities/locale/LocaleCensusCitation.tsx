import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObject from '@features/layers/hovercard/HoverableObject';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import { LocaleData, PopulationSourceCategory } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  locale: LocaleData;
  size?: 'short' | 'full';
};

const LocaleCensusCitation: React.FC<Props> = ({ locale, size = 'full' }) => {
  const { populationCensus, populationSource } = locale;

  if (populationCensus != null) return <CensusCitation census={populationCensus} size={size} />;
  if (populationSource != null)
    return <PopulationSource populationSource={populationSource} size={size} />;
  return <Deemphasized>n/a</Deemphasized>;
};

const CensusCitation: React.FC<{ census: CensusData; size: 'short' | 'full' }> = ({
  census,
  size,
}) => {
  const { yearCollected, collectorName, collectorType } = census;
  if (collectorType === CensusCollectorType.CLDR) {
    // Leave out the date from CLDR, it's not available from the source
    return <HoverableObject object={census}>{collectorName ?? collectorType}</HoverableObject>;
  }
  let name = collectorName;
  if (name == null || name === '' || size === 'short') {
    switch (collectorType) {
      case 'Government':
        name = census.territory?.nameDisplay ?? census.isoRegionCode;
        break;
      default:
        name = collectorType;
    }
  }
  return (
    <HoverableObject object={census}>
      {name} {yearCollected}
    </HoverableObject>
  );
};

const PopulationSource: React.FC<{
  populationSource: PopulationSourceCategory;
  size: 'short' | 'full';
}> = ({ populationSource, size }) => {
  const description = getPopulationSourceDescription(populationSource);
  const label = getPopulationSourceLabel(populationSource, size);
  // const isMinor =

  switch (populationSource) {
    case PopulationSourceCategory.NoSource:
    case PopulationSourceCategory.Other:
    case PopulationSourceCategory.AggregatedFromLanguages:
    case PopulationSourceCategory.AggregatedFromTerritories:
    case PopulationSourceCategory.Algorithmic:
      return (
        <Hoverable hoverContent={description}>
          <span style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>{label}</span>
        </Hoverable>
      );
    default:
      return <Hoverable hoverContent={description}>{label}</Hoverable>;
  }
};

function getPopulationSourceLabel(
  source: PopulationSourceCategory,
  size: 'short' | 'full',
): string {
  switch (source) {
    case PopulationSourceCategory.Official:
    case PopulationSourceCategory.UnverifiedOfficial:
      return 'census';
    case PopulationSourceCategory.Study:
      return 'study';
    case PopulationSourceCategory.Ethnologue:
      return 'Ethnologue';
    case PopulationSourceCategory.EDL:
      return size === 'short' ? 'EDL' : 'Endangered Languages Project';
    case PopulationSourceCategory.CLDR:
      return size === 'short' ? 'CLDR' : 'Unicode Common Locale Data Repository';
    case PopulationSourceCategory.NoSource:
    case PopulationSourceCategory.Other:
      return 'citation needed';
    case PopulationSourceCategory.AggregatedFromLanguages:
    case PopulationSourceCategory.AggregatedFromTerritories:
      return 'aggregated';
    case PopulationSourceCategory.Algorithmic:
      return size === 'short' ? 'derived' : 'derived from other data';
  }
}

function getPopulationSourceDescription(source: PopulationSourceCategory): string {
  switch (source) {
    case PopulationSourceCategory.Official:
      return 'The population figure is taken from an official census or government source.';
    case PopulationSourceCategory.UnverifiedOfficial:
      return 'The population figure is reported to be from an official census or government source, but from a secondary source';
    case PopulationSourceCategory.Study:
      return 'The population figure is taken from a linguistic or demographic study.';
    case PopulationSourceCategory.Ethnologue:
      return 'The population figure is taken from Ethnologue.';
    case PopulationSourceCategory.EDL:
      return 'The population figure is taken from the Endangered Languages Project.';
    case PopulationSourceCategory.CLDR:
      return 'The population figure is taken from the Unicode Common Locale Data Repository (CLDR).';
    case PopulationSourceCategory.NoSource:
      return 'No source is provided for the population figure.';
    case PopulationSourceCategory.Other:
      return 'The population figure is taken from an unspecified source.';
    case PopulationSourceCategory.AggregatedFromLanguages:
      return 'The population figure is aggregated from the populations of contained languages/dialects.';
    case PopulationSourceCategory.AggregatedFromTerritories:
      return 'The population figure is aggregated from the populations of contained territories.';
    case PopulationSourceCategory.Algorithmic:
      return 'The population figure is derived from other data.';
  }
}

export default LocaleCensusCitation;

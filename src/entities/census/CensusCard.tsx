import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';

import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';

import { CensusCollectorType, CensusData } from './CensusTypes';

interface Props {
  census: CensusData;
}
const CensusCard: React.FC<Props> = ({ census }) => {
  const {
    isoRegionCode,
    territory,
    collectorType,
    yearCollected,
    languageUse,
    acquisitionOrder,
    domain,
    languageCount,
  } = census;
  const languageUseParts = [
    languageUse,
    acquisitionOrder !== 'Any' && acquisitionOrder,
    domain && `@${domain}`,
  ].filter(Boolean);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <ObjectTitle object={census} />
      </div>
      <CardField
        title="Territory"
        field={Field.Territory}
        description="Where this census was conducted."
      >
        {territory != null ? <HoverableObjectName object={territory} /> : isoRegionCode}
      </CardField>

      <CardField
        title="Collector Type"
        field={Field.SourceType}
        description="The type of organization that collected this census"
      >
        {collectorType === CensusCollectorType.Secondary ? (
          <Deemphasized>Secondary source</Deemphasized>
        ) : (
          collectorType
        )}
      </CardField>

      <CardField
        title="Collection Year"
        field={Field.Date}
        description="The year this census was collected."
      >
        {yearCollected}
      </CardField>

      <CardField
        title="Language Use"
        field={Field.Modality}
        description='The way people use the language if provided by the census source. The Mode, Acquisition Order, and/or Domain (e.g. "Speaks, L1, Home").'
      >
        {languageUseParts.length > 0 ? (
          languageUseParts.join(', ')
        ) : (
          <Deemphasized>Unspecified</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Number of Languages"
        field={Field.CountOfLanguages}
        description="How many languages are covered by this census."
      >
        {languageCount.toLocaleString()}
      </CardField>
    </div>
  );
};

export default CensusCard;

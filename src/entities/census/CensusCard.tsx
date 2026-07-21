import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';

import CardTitleBlock from '@entities/ui/CardTitleBlock';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { CensusData } from './CensusTypes';

interface Props {
  census: CensusData;
}
const CensusCard: React.FC<Props> = ({ census }) => {
  const {
    isoRegionCode,
    territory,
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
      <CardTitleBlock object={census} />
      <CardField
        title="Territory"
        field={Field.Territory}
        description="Where this census was conducted."
      >
        {territory != null ? <HoverableObjectName object={territory} /> : isoRegionCode}
      </CardField>

      <CardField
        title="Collector"
        field={Field.SourceType}
        description="The type of organization that collected this census and/or presented it"
      >
        <div>
          {census.collector && <HoverableObjectName object={census.collector} />}
          {census.presenter && (
            <>
              {' '}
              via <HoverableObjectName object={census.presenter} />
            </>
          )}
        </div>
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

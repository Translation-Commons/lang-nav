import { BlocksIcon, CalendarIcon, EarthIcon, HashIcon, LanguagesIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';

import { CensusData } from './CensusTypes';

interface Props {
  census: CensusData;
}
const CensusCard: React.FC<Props> = ({ census }) => {
  const {
    isoRegionCode,
    territory,
    collectorType,
    yearCollected,
    mode,
    acquisitionOrder,
    domain,
    languageCount,
  } = census;
  const languageUseParts = [mode, acquisitionOrder, domain].filter(Boolean);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <ObjectTitle object={census} />
      </div>
      <CardField title="Territory" icon={EarthIcon} description="Where this census was conducted.">
        {territory != null ? <HoverableObjectName object={territory} /> : isoRegionCode}
      </CardField>

      <CardField
        title="Collector Type"
        icon={BlocksIcon}
        description="The type of organization that collected this census"
      >
        {collectorType}
      </CardField>

      <CardField
        title="Collection Year"
        icon={CalendarIcon}
        description="The year this census was collected."
      >
        {yearCollected}
      </CardField>

      <CardField
        title="Language Use"
        icon={LanguagesIcon}
        description='The way people use the language if provided by the census source. The Mode, Acquisition Order, and/or Domain (e.g. "Speaks, L1, Home").'
      >
        {languageUseParts.length > 0 ? (
          languageUseParts.join(', ')
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Number of Languages"
        icon={HashIcon}
        description="How many languages are covered by this census."
      >
        {languageCount.toLocaleString()}
      </CardField>
    </div>
  );
};

export default CensusCard;

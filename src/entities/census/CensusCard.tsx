import { BlocksIcon, Calendar, EarthIcon, HashIcon, LanguagesIcon } from 'lucide-react';
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
  const languageUseParts = [mode, acquisitionOrder, domain]
    .map((v) => (v == null ? null : String(v).trim()))
    .filter((v): v is string => Boolean(v));

  return (
    <div>
      <h3>
        <ObjectTitle object={census} />
      </h3>
      <CardField title="Territory" icon={EarthIcon} description="Where this census was conducted.">
        {territory != null ? (
          <HoverableObjectName object={territory} />
        ) : isoRegionCode ? (
          <span>{isoRegionCode}</span>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Collector Type"
        icon={BlocksIcon}
        description="The type of organization that collected this census"
      >
        {collectorType != null ? (
          <span>{collectorType}</span>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Collection Year"
        icon={CalendarIcon}
        description="The year this census was collected."
      >
        {yearCollected != null ? (
          <span>{yearCollected}</span>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Language Use"
        icon={LanguagesIcon}
        description='Combined from Mode, Acquisition Order, and Domain (e.g. "Speaks, L1, Home").'
      >
        {languageUseParts.length > 0 ? (
          <span>{languageUseParts.join(', ')} </span>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Numbers of Languages"
        icon={HashIcon}
        description="How many languages are covered by this census."
      >
        {languageCount != null ? (
          <span>{languageCount.toLocaleString()}</span>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>
    </div>
  );
};

export default CensusCard;

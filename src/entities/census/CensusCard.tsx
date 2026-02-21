import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import { CensusData } from './CensusTypes';

interface Props {
  census: CensusData;
}
const CensusCard: React.FC<Props> = ({ census }) => {
  const { isoRegionCode, languageCount, territory } = census;

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <ObjectTitle object={census} />
        <ObjectSubtitle object={census} />
      </div>
      <div>
        <h4>Languages</h4>
        {languageCount.toLocaleString()}
      </div>
      <div>
        <h4>Territory</h4>
        {territory != null ? (
          <HoverableObjectName object={territory} />
        ) : (
          <span>{isoRegionCode}</span>
        )}
      </div>
    </div>
  );
};

export default CensusCard;

import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';

import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import { CensusData } from './CensusTypes';

interface Props {
  census: CensusData;
}
const CensusCard: React.FC<Props> = ({ census }) => {
  const { ID, isoRegionCode, languageCount, territory } = census;
  const { updatePageParams } = usePageParams();

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })} role="link">
          <ObjectTitle object={census} />
        </a>
        <ObjectSubtitle object={census} />
      </h3>
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

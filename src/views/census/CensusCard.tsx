import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { CensusData } from '../../types/CensusTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectTitle from '../common/ObjectTitle';

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
          <ObjectTitle object={census} highlightSearchMatches={true} />
        </a>
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

import HoverableObjectName from '@entities/ui/HoverableObjectName';
import ObjectTitle from '@entities/ui/ObjectTitle';
import { usePageParams } from '@widgets/PageParamsProvider';
import React from 'react';

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

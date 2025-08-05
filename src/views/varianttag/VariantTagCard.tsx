// src/views/varianttag/VariantTagCard.tsx

import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import CommaSeparated from '../../generic/CommaSeparated';
import { VariantTagData } from '../../types/DataTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectTitle from '../common/ObjectTitle';

interface Props {
  data: VariantTagData;
}

const VariantTagCard: React.FC<Props> = ({ data }) => {
  const { updatePageParams } = usePageParams();
  const { ID, nameDisplay, languages } = data;

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })} role="link">
          <ObjectTitle object={data} highlightSearchMatches={true} />
        </a>
      </h3>

      <div>
        <label>Name:</label>
        {nameDisplay}
      </div>

      {languages && Object.values(languages).length > 0 && (
        <div>
          <label>Languages:</label>
          <CommaSeparated>
            {Object.values(languages).map((lang) => (
              <HoverableObjectName key={lang.ID} object={lang} />
            ))}
          </CommaSeparated>
        </div>
      )}
    </div>
  );
};

export default VariantTagCard;

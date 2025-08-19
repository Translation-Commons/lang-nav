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
  // destructure additional population fields if present on the variant tag
  const { ID, nameDisplay, languages } = data;
  const populationCited = (data as any).populationCited;
  const populationUpperBound = (data as any).populationUpperBound;

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

      {/* Show cited and potential populations when available and non-zero */}
      {typeof populationCited === 'number' && populationCited > 0 && (
        <div>
          <label>Cited Population:</label>
          {populationCited.toLocaleString()}
        </div>
      )}
      {typeof populationUpperBound === 'number' && populationUpperBound > 0 && (
        <div>
          <label>Potential Population:</label>
          {populationUpperBound.toLocaleString()}
        </div>
      )}

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

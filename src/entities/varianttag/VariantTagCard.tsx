// src/views/varianttag/VariantTagCard.tsx

import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import usePageParams from '@features/page-params/usePageParams';

import { VariantTagData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CommaSeparated from '@shared/ui/CommaSeparated';

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

// src/views/varianttag/VariantTagCard.tsx

import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { VariantTagData } from './VariantTagTypes';

interface Props {
  data: VariantTagData;
}

const VariantTagCard: React.FC<Props> = ({ data }) => {
  const { nameDisplay, languages } = data;

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <ObjectTitle object={data} />
        <ObjectSubtitle object={data} />
      </div>

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

import React from 'react';

import { EntityData } from '@entities/types/DataTypes';
import EntityName, { EntityNameLabelSource } from '@entities/ui/EntityName';

import HoverableEntity from './HoverableEntity';

type Props = {
  ent?: EntityData;
  labelSource?: EntityNameLabelSource;
  format?: 'text' | 'button';
  style?: React.CSSProperties;
};

const HoverableEntityName: React.FC<Props> = ({
  ent,
  labelSource = 'name',
  format = 'text',
  style,
}) => {
  if (!ent) return null;

  return (
    <HoverableEntity ent={ent}>
      <span style={style}>
        {format === 'text' ? (
          <EntityName ent={ent} labelSource={labelSource} />
        ) : (
          <button>
            <EntityName ent={ent} labelSource={labelSource} />
          </button>
        )}
      </span>
    </HoverableEntity>
  );
};

export default HoverableEntityName;

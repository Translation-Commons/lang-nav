import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';

import type { EntityRef } from '@entities/types/EntityTypes';
import EntityName, { EntityNameLabelSource } from '@entities/ui/EntityName';

import HoverableEntity from './HoverableEntity';

type Props = {
  entRef?: EntityRef;
  labelSource?: EntityNameLabelSource;
  style?: React.CSSProperties;
};

const HoverableEntityRef: React.FC<Props> = ({ entRef, labelSource = 'name', style }) => {
  const { getEntity } = useDataContext();
  if (!entRef) return null;
  const ent = getEntity(entRef.ID);
  if (!ent) {
    return (
      <span style={style}>
        {labelSource === 'code' && entRef.ID}
        {labelSource === 'name and code' && `${entRef.name} [${entRef.ID}]`}
        {!labelSource.includes('code') && entRef.name}
      </span>
    );
  }

  return (
    <HoverableEntity ent={ent}>
      <span style={style}>
        <EntityName ent={ent} labelSource={labelSource} />
      </span>
    </HoverableEntity>
  );
};

export default HoverableEntityRef;

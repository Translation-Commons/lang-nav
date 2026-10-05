import React from 'react';

import { EntityRef } from '@features/data/api/list/tableContract';
import { useDataContext } from '@features/data/context/useDataContext';

import HoverableEntity from './HoverableEntity';

type Props = {
  entRef?: EntityRef;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

/** Hover card for an embedded reference. The card still reads the graph; without it, only the name shows. */
const HoverableEntityRef: React.FC<Props> = ({ entRef, children, style }) => {
  const ent = useDataContext().getEntity(entRef?.id ?? '');
  if (!entRef) return null;
  return (
    <HoverableEntity ent={ent} style={style}>
      {children ?? <span>{entRef.name}</span>}
    </HoverableEntity>
  );
};

export default HoverableEntityRef;

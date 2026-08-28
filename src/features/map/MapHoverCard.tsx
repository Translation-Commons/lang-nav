import React from 'react';

import { EntityData } from '@entities/types/DataTypes';

type Props = {
  ent: EntityData;
  allowSidebar?: boolean;
  noResultsDescription?: React.ReactNode;
};

const MapHoverCard: React.FC<Props> = ({ ent, allowSidebar, noResultsDescription }) => {
  let description = noResultsDescription;
  if (!description) description = allowSidebar ? 'Open in sidebar' : 'Open in details panel';

  return (
    <div>
      <strong>{ent.nameDisplay}</strong>
      <div style={{ color: 'var(--color-text-secondary)' }}>{description}</div>
    </div>
  );
};

export default MapHoverCard;

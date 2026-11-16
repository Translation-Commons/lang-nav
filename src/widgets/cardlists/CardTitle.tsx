import React from 'react';

import { EntityData, EntityType } from '@entities/types/EntityTypes';
import EntitySubtitle from '@entities/ui/EntitySubtitle';
import EntityTitle from '@entities/ui/EntityTitle';

const CardTitle: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  return (
    <div className="text-lg">
      <EntityTitle ent={ent} />
      {hasSubtitle(ent) && <EntitySubtitle ent={ent} />}
    </div>
  );
};

const hasSubtitle = (ent?: EntityData) => {
  switch (ent?.type) {
    case EntityType.Language:
    case EntityType.Locale:
      return true;
    default:
      return false;
  }
};

export default CardTitle;

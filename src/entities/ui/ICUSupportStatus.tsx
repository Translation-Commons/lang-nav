import React from 'react';

import { EntityData, EntityType } from '@entities/types/EntityTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import IsSupportedIcon from '@shared/ui/IsSupportedIcon';

const ICUSupportStatus: React.FC<{ ent: EntityData }> = ({ ent }) => {
  if (ent.type !== EntityType.Language) return null;
  const { coverage, dataProvider } = ent.CLDR;

  if (coverage == null) {
    if (dataProvider != null) return <ICUSupportStatus ent={dataProvider} />;
    return <Deemphasized>n/a</Deemphasized>;
  }

  return <IsSupportedIcon isSupported={coverage.inICU} />;
};

export default ICUSupportStatus;

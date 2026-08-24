import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const ICUSupportStatus: React.FC<{ ent: EntityData }> = ({ ent }) => {
  if (ent.type !== EntityType.Language) return null;

  const { coverage, dataProvider } = ent.CLDR;

  if (coverage == null) {
    if (dataProvider != null) {
      return <ICUSupportStatus ent={dataProvider} />;
    }
    return <Deemphasized>n/a</Deemphasized>;
  }

  return coverage.inICU ? (
    <CheckCircle2Icon
      style={{ color: 'var(--color-green)', verticalAlign: 'middle' }}
      size={'1em'}
    />
  ) : (
    <XCircleIcon style={{ color: 'var(--color-red)', verticalAlign: 'middle' }} size={'1em'} />
  );
};

export default ICUSupportStatus;

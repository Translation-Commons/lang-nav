import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const ICUSupportStatus: React.FC<{ object: ObjectData }> = ({ object }) => {
  if (object.type !== ObjectType.Language) return null;

  const { coverage, dataProvider } = object.CLDR;

  if (coverage == null) {
    if (dataProvider != null) {
      return <ICUSupportStatus object={dataProvider} />;
    }
    return <Deemphasized>n/a</Deemphasized>;
  }

  return coverage.inICU ? (
    <CheckCircle2Icon
      style={{ color: 'var(--color-text-green)', verticalAlign: 'middle' }}
      size={'1em'}
    />
  ) : (
    <XCircleIcon style={{ color: 'var(--color-text-red)', verticalAlign: 'middle' }} size={'1em'} />
  );
};

export default ICUSupportStatus;

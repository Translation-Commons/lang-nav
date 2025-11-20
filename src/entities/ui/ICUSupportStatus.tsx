import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import React from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

const ICUSupportStatus: React.FC<{ object: ObjectData }> = ({ object }) => {
  if (object.type !== ObjectType.Language) return null;

  const { cldrCoverage, cldrDataProvider } = object;

  if (cldrCoverage == null) {
    if (cldrDataProvider != null) {
      return <ICUSupportStatus object={cldrDataProvider} />;
    }
    return <Deemphasized>n/a</Deemphasized>;
  }

  return cldrCoverage.inICU ? (
    <CheckCircle2Icon
      style={{ color: 'var(--color-text-green)', verticalAlign: 'middle' }}
      size={'1em'}
    />
  ) : (
    <XCircleIcon style={{ color: 'var(--color-text-red)', verticalAlign: 'middle' }} size={'1em'} />
  );
};

export default ICUSupportStatus;

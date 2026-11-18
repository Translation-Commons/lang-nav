import { ScalingIcon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import Field from '../fields/Field';
import FieldDropdown from '../sorting/FieldDropdown';
import TransformOptionsPopup from '../TransformOptionsPopup';

import DisperseSelector from './DisperseSelector';
import ScaleFactorSelector from './ScaleFactorSelector';

const ScalePopupCard: React.FC = () => {
  const { scaleBy, view } = usePageParams();

  if (view !== View.Map && view !== View.Chart) return null;

  const options: Record<string, React.ReactNode> = {
    'Scale By': <FieldDropdown pageParam="scaleBy" />,
    'Scale Factor': <ScaleFactorSelector />,
  };
  if (view == View.Chart) options['Disperse'] = <DisperseSelector />;

  return (
    <TransformOptionsPopup
      isActive={scaleBy != Field.None}
      label={
        <>
          <ScalingIcon />
          <div className={'truncate text-ellipsis' + (scaleBy === Field.None ? ' hidden' : '')}>
            {scaleBy}
          </div>
        </>
      }
      options={options}
    />
  );
};

export default ScalePopupCard;

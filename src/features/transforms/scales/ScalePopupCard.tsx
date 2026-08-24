import { ScalingIcon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import Field from '../fields/Field';
import FieldDropdown from '../sorting/FieldDropdown';
import TransformOptionsPopup from '../TransformOptionsPopup';

const ScalePopupCard: React.FC = () => {
  const { scaleBy, view } = usePageParams();

  if (view !== View.Map) return null;

  return (
    <TransformOptionsPopup
      isActive={scaleBy != Field.None}
      label={
        <>
          <ScalingIcon />
          <div className="truncate text-ellipsis">{scaleBy}</div>
        </>
      }
      options={{
        'Scale By': <FieldDropdown pageParam="scaleBy" />,
      }}
    />
  );
};

export default ScalePopupCard;

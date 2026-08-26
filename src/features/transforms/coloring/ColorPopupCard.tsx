import { PaletteIcon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import Field from '../fields/Field';
import FieldDropdown from '../sorting/FieldDropdown';
import TransformOptionsPopup from '../TransformOptionsPopup';

import ColorGradientSelector from './ColorGradientSelector';

const ColorPopupCard: React.FC = () => {
  const { colorBy, view } = usePageParams();

  if (view !== View.Map && view !== View.CardList) return null;

  return (
    <TransformOptionsPopup
      isActive={colorBy != Field.None}
      label={
        <>
          <PaletteIcon />
          <div className="truncate text-ellipsis">{colorBy}</div>
        </>
      }
      options={{
        'Color By': <FieldDropdown pageParam="colorBy" />,
        'Color Gradient': <ColorGradientSelector />,
      }}
    />
  );
};

export default ColorPopupCard;

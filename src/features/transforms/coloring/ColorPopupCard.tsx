import { PaletteIcon } from 'lucide-react';
import React from 'react';

import { useDataVizParams } from '@features/params/DataVizParamsProvider';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import EnumDropdown from '@shared/ui/EnumDropdown';

import Field from '../fields/Field';
import { Axis, AxisScale } from '../scales/AxisScale';
import getAxisScaleLabel from '../scales/getAxisScaleLabel';
import getDefaultAxisScale from '../scales/getDefaultAxisScale';
import FieldDropdown from '../sorting/FieldDropdown';
import TransformOptionsPopup from '../TransformOptionsPopup';

import ColorGradientSelector from './ColorGradientSelector';

const ColorPopupCard: React.FC = () => {
  const { colorBy, view } = usePageParams();
  const { scale, setScale } = useDataVizParams();

  if (view !== View.Map && view !== View.CardList && view !== View.Hierarchy && view !== View.Chart)
    return null;

  const defaultScale = getDefaultAxisScale(colorBy);
  let currentScale = scale?.color;
  if (currentScale == null || currentScale === AxisScale.Default) currentScale = defaultScale;

  return (
    <TransformOptionsPopup
      isActive={colorBy != Field.None}
      label={
        <>
          <PaletteIcon />
          <div className={'truncate text-ellipsis' + (colorBy === Field.None ? ' hidden' : '')}>
            {colorBy}
          </div>
        </>
      }
      options={{
        'Color By': <FieldDropdown pageParam="colorBy" />,
        'Color Gradient': <ColorGradientSelector />,
        'Axis Scale': (
          <EnumDropdown
            value={currentScale}
            options={Object.values(AxisScale).filter((v) => typeof v === 'number')}
            onChange={setScale ? (scale: AxisScale) => setScale(Axis.Color, scale) : () => {}}
            getLabel={(s) => getAxisScaleLabel(s)}
          />
        ),
      }}
    />
  );
};

export default ColorPopupCard;

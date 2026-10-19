import { PaletteIcon } from 'lucide-react';
import React from 'react';

import { useDataVizParams } from '@features/params/DataVizParamsProvider';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import EnumDropdown from '@shared/ui/EnumDropdown';

import Field from '../fields/Field';
import getDefaultScaleAdjustment from '../scales/getDefaultScaleAdjustment';
import getScaleAdjustmentLabel from '../scales/getScaleAdjustmentLabel';
import { ScaleAdjustment } from '../scales/ScaleAdjustment';
import FieldDropdown from '../sorting/FieldDropdown';
import TransformOptionsPopup from '../TransformOptionsPopup';

import ColorGradientSelector from './ColorGradientSelector';

const ColorPopupCard: React.FC = () => {
  const { colorBy, view } = usePageParams();
  const { colorScale, setColorScale } = useDataVizParams();

  if (view !== View.Map && view !== View.CardList && view !== View.Hierarchy && view !== View.Chart)
    return null;

  const defaultScale = getDefaultScaleAdjustment(colorBy);
  let currentScale = colorScale;
  if (currentScale == null || currentScale === ScaleAdjustment.Default) currentScale = defaultScale;

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
        'Scale Adjustment': (
          <EnumDropdown
            value={currentScale}
            options={Object.values(ScaleAdjustment).filter((v) => typeof v === 'number')}
            onChange={setColorScale ?? (() => {})}
            getLabel={(s) => getScaleAdjustmentLabel(s)}
          />
        ),
      }}
    />
  );
};

export default ColorPopupCard;

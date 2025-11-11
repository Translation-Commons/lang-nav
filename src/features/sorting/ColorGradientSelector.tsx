import React from 'react';

import {
  SelectorDisplay,
  useSelectorDisplay,
} from '@widgets/controls/components/SelectorDisplayContext';

import { View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { ColorGradient } from '@features/sorting/SortTypes';

import { toSentenceCase } from '@shared/lib/stringUtils';

import Selector from '../../widgets/controls/components/Selector';

import BaseColorBar from './BaseColorBar';

const ColorGradientSelector: React.FC = () => {
  const { colorBy, colorGradient, updatePageParams, view } = usePageParams();
  const { display } = useSelectorDisplay();

  // Only showing if coloring is enabled
  if (colorBy == 'None') return null;

  // Only applicable to the card list and map views
  if (view !== View.Map && view !== View.CardList) return null;

  return (
    <Selector<ColorGradient>
      selectorLabel={display === SelectorDisplay.Dropdown ? 'Color gradient' : undefined}
      selectorDescription="Choose the range of colors used to represent values."
      options={Object.values(ColorGradient).filter((cg) => typeof cg === 'number')}
      onChange={(colorGradient) => updatePageParams({ colorGradient })}
      selected={colorGradient}
      getOptionLabel={(colorGradient) => (
        <div style={{ minWidth: '4em', height: '16px', display: 'inline-block' }}>
          <BaseColorBar colorGradient={colorGradient} />
        </div>
      )}
      getOptionDescription={getGradientLabel}
    />
  );
};

function getGradientLabel(colorGradient: ColorGradient): string {
  const key = Object.entries(ColorGradient).find(([, value]) => value === colorGradient)?.[0] || '';
  return toSentenceCase(key);
}

export default ColorGradientSelector;

import React from 'react';

import usePageParams from '@features/page-params/usePageParams';
import { ColorGradient } from '@features/sorting/SortTypes';

import { toSentenceCase } from '@shared/lib/stringUtils';

import Selector from '../../widgets/controls/components/Selector';
import { SelectorDisplay } from '../../widgets/controls/components/SelectorDisplay';

import { getColorGradientFunction } from './getColorGradientFunction';

const ColorGradientSelector: React.FC = () => {
  const { colorBy, colorGradient, updatePageParams } = usePageParams();
  if (colorBy == 'None') return null;

  return (
    <Selector<ColorGradient>
      selectorLabel="Color gradient"
      selectorDescription="Choose the range of colors used to represent values."
      options={Object.values(ColorGradient).filter((cg) => typeof cg === 'number')}
      onChange={(colorGradient) => updatePageParams({ colorGradient })}
      selected={colorGradient}
      display={SelectorDisplay.Dropdown}
      getOptionLabel={(colorGradient) => (
        <div style={{ minWidth: '4em', height: '16px', display: 'inline-block' }}>
          <GradientBar colorGradient={colorGradient} />
        </div>
      )}
      getOptionDescription={getGradientLabel}
    />
  );
};

function GradientBar({ colorGradient }: { colorGradient: ColorGradient }) {
  const colorFunc = getColorGradientFunction(colorGradient);
  return [...Array(51).keys()].map((i) => {
    return (
      <div
        key={i}
        style={{
          backgroundColor: colorFunc(i / 50),
          width: '2%',
          height: '100%',
          display: 'inline-block',
        }}
      />
    );
  });
}

function getGradientLabel(colorGradient: ColorGradient): string {
  const key = Object.entries(ColorGradient).find(([, value]) => value === colorGradient)?.[0] || '';
  return toSentenceCase(key);
}

export default ColorGradientSelector;

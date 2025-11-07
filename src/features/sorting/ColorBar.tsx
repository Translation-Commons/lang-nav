import React from 'react';

import usePageParams from '@features/page-params/usePageParams';

import { getColorGradientFunction } from './getColorGradientFunction';
import { ColorGradient } from './SortTypes';

const ColorBar: React.FC = () => {
  const { colorGradient } = usePageParams();

  return <BaseColorBar colorGradient={colorGradient} />;
};

export function BaseColorBar({ colorGradient }: { colorGradient: ColorGradient }) {
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

export default ColorBar;

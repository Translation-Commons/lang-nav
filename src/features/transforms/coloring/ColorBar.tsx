import React, { useEffect, useMemo, useRef, useState } from 'react';

import usePageParams from '@features/params/usePageParams';
import { getFieldValueType } from '@features/table/getValueType';
import TableValueType from '@features/table/TableValueType';
import getTickMarks from '@features/transforms/getTickMarks';

import Field from '../fields/Field';

import BaseColorBar from './BaseColorBar';
import { ColoringFunctions } from './useColors';

type Props = {
  coloringFunctions: ColoringFunctions;
};

const ColorBar: React.FC<Props> = ({ coloringFunctions }) => {
  const { minValue, maxValue } = coloringFunctions;
  const { colorGradient } = usePageParams();
  const colorBarRef = useRef<HTMLDivElement>(null);
  const [colorBarWidth, setColorBarWidth] = useState(800);

  useEffect(() => {
    const el = colorBarRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setColorBarWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ticks = useMemo(
    () => getTickMarks(coloringFunctions, colorBarWidth),
    [coloringFunctions, colorBarWidth],
  );
  const renormalize = isFieldWholeNumbersOnly(coloringFunctions.colorBy)
    ? (value: number) =>
        coloringFunctions.getNormalizedValue(
          Math.round(coloringFunctions.getDenormalizedValue(value)),
        )
    : undefined;

  if (minValue === undefined || maxValue === undefined) return null;

  return (
    <div ref={colorBarRef} style={{ width: '100%' }}>
      <div style={{ height: '1em', width: '100%' }}>
        <BaseColorBar colorGradient={colorGradient} renormalize={renormalize} />
      </div>
      <div
        style={{
          position: 'relative',
          height: '2.5em',
          width: '100%',
          fontSize: `${Math.max(0.5, Math.min(1, colorBarWidth / 900))}em`,
        }}
      >
        {ticks.map(({ position, label }, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              top: '0',
              left: `${position * 100}%`,
              transform: 'translateX(-50%)', // center the tick label
            }}
          >
            <div style={{ height: '.25em', width: 1, backgroundColor: 'var(--color-text)' }} />
            <div style={{ whiteSpace: 'nowrap' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function isFieldWholeNumbersOnly(field: Field): boolean {
  const valueType = getFieldValueType(field);
  return (
    valueType === TableValueType.Count ||
    valueType === TableValueType.Enum ||
    valueType === TableValueType.Population
  );
}

export default ColorBar;

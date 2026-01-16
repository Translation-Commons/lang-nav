import { useCallback, useMemo } from 'react';

import { ObjectData } from '@entities/types/DataTypes';

import { getSortField } from '../fields/getField';
import { getMaximumValue, getMinimumValue } from '../rangeUtils';

import { ScaleBy } from './ScaleTypes';

type Props = { objects: ObjectData[]; scaleBy?: ScaleBy };

export type ScalingFunctions = {
  scaleBy: ScaleBy | undefined;
  getScale: (object: ObjectData) => number; // returns radius multiplier (to be multiplied by scalar)
  maxValue: number;
  minValue: number;
};

const useScale = ({ objects, scaleBy }: Props): ScalingFunctions => {
  // If caller didn't pass, they'd use page params via usePageParams normally
  const minValue = getMinimumValue(scaleBy);
  const maxValue = useMemo(() => getMaximumValue(objects, scaleBy), [objects, scaleBy]);

  const transformValue = (v: number) => Math.pow(v, 0.5);

  const tMin = transformValue(minValue);
  const tMax = transformValue(maxValue);

  const range = tMax - tMin;

  const getNormalizedValue = useCallback(
    (value: number | string): number => {
      let numericValue: number;
      if (typeof value === 'number') numericValue = value;
      else numericValue = Number(value) || 0;

      numericValue = transformValue(numericValue);

      if (tMax === tMin) return 1;
      if (numericValue > tMax) return 1;

      numericValue -= tMin;
      if (numericValue <= 0) return 0;
      return numericValue / range;
    },
    [scaleBy, tMin, tMax, range],
  );

  const getScale = useCallback(
    (object: ObjectData) => {
      if (!scaleBy || scaleBy === 'None') return 1; // default radius multiplier

      const val = getSortField(object, scaleBy);
      if (val == null) return 0; // not renderable

      const normalized = getNormalizedValue(val as number);
      // Map normalized 0..1 to radius multiplier 1..10
      return 1 + normalized * 9;
    },
    [scaleBy, getNormalizedValue],
  );

  return { scaleBy, getScale, maxValue, minValue };
};

export default useScale;

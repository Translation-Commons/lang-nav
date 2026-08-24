import { useCallback, useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import Field from '../fields/Field';
import getField from '../fields/getField';
import { getMaximumValue, getMinimumValue } from '../fields/rangeUtils';

type Props = { ents: EntityData[]; scaleBy?: Field };

export type ScalingFunctions = {
  scaleBy: Field | undefined;
  getScale: (ent: EntityData) => number; // returns radius multiplier (to be multiplied by scalar)
  maxValue: number;
  minValue: number;
};

const useScale = ({ ents, scaleBy }: Props): ScalingFunctions => {
  const { populationMin } = usePageParams();
  // If caller didn't pass, they'd use page params via usePageParams normally
  const minValue = getMinimumValue(scaleBy, populationMin);
  const maxValue = useMemo(() => getMaximumValue(ents, scaleBy), [ents, scaleBy]);

  const transformValue = (v: number) => Math.pow(Math.max(v, 0), 0.5);

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
    (ent: EntityData) => {
      if (!scaleBy || scaleBy === Field.None) return 1; // default radius multiplier

      const val = getField(ent, scaleBy);
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

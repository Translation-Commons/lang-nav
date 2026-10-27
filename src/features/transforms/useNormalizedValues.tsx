import { useCallback, useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/EntityTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { convertAlphaToNumber } from '@shared/lib/stringUtils';

import Field from './fields/Field';
import { getMaximumValue, getMinimumValue } from './fields/rangeUtils';
import { AxisScale } from './scales/AxisScale';
import getDefaultAxisScale from './scales/getDefaultAxisScale';

type Props = { ents: EntityData[]; field: Field; scale?: AxisScale };

export type NormalizingFunctions = {
  field: Field;
  getNormalizedValue: (value: number | string) => number;
  getDenormalizedValue: (normalized: number) => number;
  maxValue: number;
  minValue: number;
};

const useNormalizedValues = ({ ents, field, scale }: Props): NormalizingFunctions => {
  const { populationMin } = usePageParams();

  const minValue = useMemo(
    () => getMinimumValue(ents, field, populationMin),
    [ents, field, populationMin],
  );
  const maxValue = useMemo(() => getMaximumValue(ents, field), [ents, field]);
  if ((scale == null || scale === AxisScale.Default) && maxValue - minValue > 10)
    scale = getDefaultAxisScale(field);

  let range = maxValue - minValue;
  if (scale === AxisScale.Logarthmic) range = Math.log10(range);
  if (scale === AxisScale.SquareRooted) range = Math.sqrt(range);

  const getNormalizedValue = useCallback(
    (value: number | string): number => {
      let numericValue: number;
      if (typeof value === 'number') {
        numericValue = value;
      } else {
        numericValue = convertAlphaToNumber(value);
      }

      if (maxValue === minValue) return 1; // avoid division by zero
      if (numericValue > maxValue) return 1;

      // eg. shift to 0-based, eg. -180..+180  =>  0..360
      numericValue -= minValue;
      if (numericValue <= 0) return 0;
      if (scale === AxisScale.Logarthmic) return Math.log10(numericValue) / range;
      if (scale === AxisScale.SquareRooted) return Math.sqrt(numericValue) / range;
      return numericValue / range;
    },
    [field, minValue, maxValue, range, scale],
  );

  const getDenormalizedValue = useCallback(
    (normalized: number): number => {
      let denormalized: number;
      if (scale === AxisScale.Logarthmic) {
        denormalized = Math.pow(10, normalized * range);
      } else if (scale === AxisScale.SquareRooted) {
        denormalized = Math.pow(normalized * range, 2);
      } else {
        denormalized = normalized * range;
      }
      denormalized += minValue;
      denormalized = numberToSigFigs(denormalized, 3);
      // Rounding because JS precision may lead to insignificant trailing decimals
      return denormalized > 1000 ? Math.round(denormalized) : denormalized;
    },
    [minValue, range, scale],
  );

  return {
    field,
    getNormalizedValue,
    getDenormalizedValue,
    maxValue,
    minValue,
  };
};

export default useNormalizedValues;

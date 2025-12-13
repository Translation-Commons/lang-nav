import { useCallback, useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { convertAlphaToNumber } from '@shared/lib/stringUtils';

import { getMaximumValue, getMinimumValue } from '../rangeUtils';
import { getSortField } from '../sorting/sort';
import { SortBy } from '../sorting/SortTypes';

import { ColorBy } from './ColorTypes';
import { getColorGradientFunction } from './getColorGradientFunction';

type Props = { objects: ObjectData[]; colorBy?: ColorBy };

export type ColoringFunctions = {
  colorBy: ColorBy;
  getColor: (object: ObjectData) => string | undefined;
  getNormalizedValue: (value: number) => number;
  getDenormalizedValue: (normalized: number) => number;
  maxValue: number;
  minValue: number;
};

const useColors = ({ objects, colorBy }: Props): ColoringFunctions => {
  const { colorBy: colorByParam, colorGradient } = usePageParams();
  colorBy = colorBy ?? colorByParam;

  const minValue = getMinimumValue(colorBy);
  const maxValue = useMemo(() => getMaximumValue(objects, colorBy), [objects, colorBy]);
  const shouldUseLogScale = shouldUseLogarithmicScale(colorBy);
  const range = shouldUseLogScale ? Math.log10(maxValue - minValue) : maxValue - minValue;
  const applyColorGradient = getColorGradientFunction(colorGradient);

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
      if (shouldUseLogScale) return Math.log10(numericValue) / range;
      return numericValue / range;
    },
    [colorBy, minValue, maxValue, range, shouldUseLogScale],
  );

  const getDenormalizedValue = useCallback(
    (normalized: number): number => {
      let denormalized: number;
      if (shouldUseLogScale) {
        denormalized = Math.pow(10, normalized * range);
      } else {
        denormalized = normalized * range;
      }
      denormalized += minValue;
      denormalized = numberToSigFigs(denormalized, 3);
      // Rounding because JS precision may lead to insignificant trailing decimals
      return denormalized > 1000 ? Math.round(denormalized) : denormalized;
    },
    [minValue, range, shouldUseLogScale],
  );

  const getColor = useCallback(
    (object: ObjectData): string | undefined => {
      if (colorBy === 'None') return undefined;

      const value = getSortField(object, colorBy);
      if (value == null) return undefined; // Will be off the color scale, usually gray

      const num = getNormalizedValue(value);
      if (num == null) return undefined; // have customers handle undefined, eg. gray or transparent
      return applyColorGradient(num);
    },
    [getNormalizedValue, applyColorGradient],
  );

  return {
    colorBy,
    getColor,
    getNormalizedValue,
    getDenormalizedValue,
    maxValue,
    minValue,
  };
};

export default useColors;

function shouldUseLogarithmicScale(colorBy: ColorBy): boolean {
  switch (colorBy) {
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfDialects:
    case SortBy.CountOfTerritories:
    case SortBy.ISOStatus: // Because it's values are actually 0, 1, 3, 9. Note that there is also a -1 value for "special codes" -- that's just left out
    case SortBy.Area:
      return true;
    default:
      return false;
  }
}

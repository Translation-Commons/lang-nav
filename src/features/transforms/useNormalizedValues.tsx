import { useCallback, useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { convertAlphaToNumber } from '@shared/lib/stringUtils';

import Field from './fields/Field';
import { getMaximumValue, getMinimumValue } from './fields/rangeUtils';

type Props = { ents: EntityData[]; field: Field };

export type NormalizingFunctions = {
  field: Field;
  getNormalizedValue: (value: number | string) => number;
  getDenormalizedValue: (normalized: number) => number;
  maxValue: number;
  minValue: number;
};

const useNormalizedValues = ({ ents, field }: Props): NormalizingFunctions => {
  const { populationMin } = usePageParams();

  const minValue = getMinimumValue(field, populationMin);
  const maxValue = useMemo(() => getMaximumValue(ents, field), [ents, field]);
  const shouldUseLogScale = shouldUseLogarithmicScale(field);
  const range = shouldUseLogScale ? Math.log10(maxValue - minValue) : maxValue - minValue;

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
    [field, minValue, maxValue, range, shouldUseLogScale],
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

  return {
    field,
    getNormalizedValue,
    getDenormalizedValue,
    maxValue,
    minValue,
  };
};

export default useNormalizedValues;

function shouldUseLogarithmicScale(field: Field): boolean {
  switch (field) {
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationSpeaking:
    case Field.PopulationWriting:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
    case Field.CountOfLanguages:
    case Field.CountOfKeyboards:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.ISOStatus: // Because it's values are actually 0, 1, 3, 9. Note that there is also a -1 value for "special codes" -- that's just left out
    case Field.Area:
      return true;
    default:
      return false;
  }
}

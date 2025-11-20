import { useCallback, useMemo } from 'react';

import usePageParams from '@features/page-params/usePageParams';

import { VitalityEthnologueCoarse } from '@entities/language/vitality/VitalityTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { convertAlphaToNumber } from '@shared/lib/stringUtils';

import { getColorGradientFunction } from './getColorGradientFunction';
import { getSortField } from './sort';
import { ColorBy, SortBy } from './SortTypes';

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

function getMinimumValue(colorBy: ColorBy): number {
  switch (colorBy) {
    case SortBy.Longitude:
      return -180;
    case SortBy.Latitude:
      return -90;
    case SortBy.ISOStatus:
      return -1;
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendents:
    case SortBy.PopulationPercentInBiggestDescendentLanguage:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Literacy:
    case SortBy.VitalityMetascore:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
      return 0;
    case 'None':
      return 0;
    case SortBy.Date:
      return new Date(0).getTime();
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
      return convertAlphaToNumber(''); // 0
  }
}

function getMaximumValue(objects: ObjectData[], colorBy: ColorBy): number {
  switch (colorBy) {
    case 'None':
      return 0;
    case SortBy.VitalityMetascore:
    case SortBy.ISOStatus:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
      return VitalityEthnologueCoarse.Institutional; // 9;
    case SortBy.Latitude:
      return 90;
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Literacy:
      return 100;
    case SortBy.Longitude:
      return 180;
    case SortBy.Date:
      return new Date().getTime(); // Today
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendents:
    case SortBy.PopulationPercentInBiggestDescendentLanguage:
      return Math.max(
        objects.reduce((acc, obj) => Math.max(acc, (getSortField(obj, colorBy) as number) || 0), 0),
      );
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
      return convertAlphaToNumber('ZZZZZZZZZZ');
  }
}

function shouldUseLogarithmicScale(colorBy: ColorBy): boolean {
  switch (colorBy) {
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendents:
    case SortBy.PopulationPercentInBiggestDescendentLanguage:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
    case SortBy.ISOStatus: // Because it's values are actually 0, 1, 3, 9. Note that there is also a -1 value for "special codes" -- that's just left out
      return true;
    default:
      return false;
  }
}

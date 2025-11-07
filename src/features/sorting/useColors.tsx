import { useCallback } from 'react';

import usePageParams from '@features/page-params/usePageParams';

import { VitalityEthnologueCoarse } from '@entities/language/vitality/VitalityTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { getColorGradientFunction } from './getColorGradientFunction';
import { getNormalSortDirection, getSortField } from './sort';
import { ColorBy, SortBy, SortDirection } from './SortTypes';

type Props = { objects: ObjectData[]; colorBy?: ColorBy };

const useColors = ({ objects, colorBy }: Props) => {
  const { colorBy: colorByParam, colorGradient } = usePageParams();
  colorBy = colorBy ?? colorByParam;

  const min = getMinimumValue(colorBy);
  const max = getMaximumValue(objects, colorBy);
  const normalSortDirection =
    colorBy == 'None' ? SortDirection.Ascending : getNormalSortDirection(colorBy);
  const shouldUseLogScale = shouldUseLogarithmicScale(colorBy);
  const range = shouldUseLogScale ? Math.log10(max - min) : max - min;
  const applyColorGradient = getColorGradientFunction(colorGradient);

  const getNormalizedValue = useCallback(
    (object: ObjectData): number | undefined => {
      if (colorBy === 'None') return undefined;
      const value = getSortField(object, colorBy);
      if (value == null) return undefined; // Will be off the color scale, usually gray

      let numericValue: number;
      if (typeof value === 'number') {
        numericValue = value;
      } else {
        numericValue = convertAlphaToNumber(value);
      }

      if (max === min) return undefined; // avoid division by zero
      if (numericValue < min) return 0;
      if (numericValue > max) return 1;

      numericValue -= min; // eg. shift to 0-based, eg. -180..+180  =>  0..360
      if (shouldUseLogScale) numericValue = Math.log10(numericValue);
      return numericValue / range;
    },
    [colorBy, min, max, range, shouldUseLogScale],
  );

  const getScaledNumber = useCallback(
    (object: ObjectData): number | undefined => {
      let normalizedValue = getNormalizedValue(object);
      if (normalizedValue == null) return undefined;
      if (normalSortDirection === SortDirection.Descending) {
        normalizedValue = 1 - normalizedValue;
      }
      if (shouldUseLogScale) {
        // Apply logarithmic scaling
        // normalizedValue = (11 ** normalizedValue - 1) / 10;
        // normalizedValue = Math.log10(1 + 9 * normalizedValue); // log scale from 0 to 1
      }
      return normalizedValue;
    },
    [getNormalizedValue, shouldUseLogScale],
  );

  const getColor = useCallback(
    (object: ObjectData): string | undefined => {
      const num = getScaledNumber(object);
      if (num == null) return undefined; // have customers handle undefined, eg. gray or transparent

      return applyColorGradient(num);
    },
    [getScaledNumber, applyColorGradient],
  );

  return {
    colorBy,
    getColor,
  };
};

export default useColors;

function getMinimumValue(colorBy: ColorBy): number {
  switch (colorBy) {
    case SortBy.Longitude:
      return -180;
    case SortBy.Latitude:
      return -90;
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendents:
    case SortBy.PopulationPercentInBiggestDescendentLanguage:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Literacy:
    case SortBy.VitalityMetascore:
    case SortBy.VitalityISO:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
    case 'None':
      return 0;
    case SortBy.Date:
      return new Date(0).getTime();
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
      return convertAlphaToNumber(''); // 0
  }
}

function getMaximumValue(objects: ObjectData[], colorBy: ColorBy): number {
  switch (colorBy) {
    case 'None':
      return 0;
    case SortBy.VitalityMetascore:
    case SortBy.VitalityISO:
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

    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendents:
    case SortBy.PopulationPercentInBiggestDescendentLanguage:
      return Math.max(
        objects.reduce((acc, obj) => Math.max(acc, (getSortField(obj, colorBy) as number) || 0), 0),
      );
    case SortBy.Date:
      // Today
      return new Date().getTime();
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
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
      return true;
    default:
      return false;
  }
}

/**
 * Converts an alphabetical string to a number so we can compute value on a continuous scale.
 *
 * Reduces the input string into base ASCII and converts non ascii-able characters to spaces.
 * So "Q'eqchí" becomes "q eqchi".
 *
 * Now we can convert this to a base 27 number, where 'a' = 1, 'b' = 2, ..., 'z' = 26, and ' ' = 0.
 * The first 5 characters are the integer part and the rest are the decimal part.
 * So a name like "abcdefgh" becomes: "12345.678" in base 27.
 *
 * So "q eqchi" becomes:
 *    17 * 27^5 +
 *     0 * 27^4 +
 *     5 * 27^3 +
 *    17 * 27^2 +
 *     3 * 27^1 +
 *     8 * 27^0 +
 *     9 * 27^-1
 *  = 9038604.308641976...
 */
function convertAlphaToNumber(value: string): number {
  // Remove accent marks and diacritics, and convert to lowercase
  // TODO transliterate non-Latin characters
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, ' ');

  let num = 0;
  for (let i = 0; i < normalized.length; i++) {
    if (normalized.charCodeAt(i) === 32) continue; // skip spaces
    num += (normalized.charCodeAt(i) - 97 + 1) * Math.pow(27, 4 - i);
  }
  return num;
}

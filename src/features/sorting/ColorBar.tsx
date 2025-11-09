import React, { useMemo } from 'react';

import usePageParams from '@features/page-params/usePageParams';

import {
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineLabel,
  getVitalityISOLabel,
} from '@entities/language/vitality/VitalityStrings';
import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  VitalityISO,
} from '@entities/language/vitality/VitalityTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { convertAlphaToNumber } from '@shared/lib/stringUtils';

import BaseColorBar from './BaseColorBar';
import { SortBy } from './SortTypes';
import { ColoringFunctions } from './useColors';

type Props = {
  coloringFunctions: ColoringFunctions;
};

const ColorBar: React.FC<Props> = ({ coloringFunctions }) => {
  const { minValue, maxValue } = coloringFunctions;
  const { colorGradient } = usePageParams();

  if (minValue === undefined || maxValue === undefined) {
    return null;
  }

  const ticks = useMemo(() => getTicks(coloringFunctions), [coloringFunctions]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: '1em', width: '100%' }}>
        <BaseColorBar colorGradient={colorGradient} />
      </div>
      <div style={{ position: 'relative', height: '2.5em', width: '100%' }}>
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

/**
 * Gets tick marks and their labels for a color bar based on the coloring functions.
 *
 * @returns An array of tuples where each tuple contains a normalized position (0 to 1) and its corresponding label.
 */
function getTicks(
  coloringFunctions: ColoringFunctions,
  numberOfTicks: number = 5,
): { position: number; label: string }[] {
  const { colorBy, minValue, maxValue, getDenormalizedValue, getNormalizedValue } =
    coloringFunctions;
  if (colorBy === 'None') return [];

  let suffix = '';

  switch (colorBy) {
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
      return pickDistributedTicksFromRange(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        numberOfTicks,
      ).map((letter) => ({
        position: getNormalizedValue(convertAlphaToNumber(letter)),
        label: letter,
      }));
    case SortBy.VitalityISO:
      return pickDistributedTicksFromRange(
        [VitalityISO.Extinct, VitalityISO.Historical, VitalityISO.Constructed, VitalityISO.Living],
        numberOfTicks,
      ).map((value) => ({
        position: getNormalizedValue(value),
        label: getVitalityISOLabel(value),
      }));
    case SortBy.VitalityEthnologue2013:
      return pickDistributedTicksFromRange(
        Object.values(VitalityEthnologueFine).filter((value) => typeof value === 'number'),
        numberOfTicks,
      ).map((value) => ({
        position: getNormalizedValue(value),
        label: getVitalityEthnologueFineLabel(value),
      }));
    case SortBy.VitalityEthnologue2025:
      return pickDistributedTicksFromRange(
        Object.values(VitalityEthnologueCoarse).filter((value) => typeof value === 'number'),
        numberOfTicks,
      ).map((value) => ({
        position: getNormalizedValue(value),
        label: getVitalityEthnologueCoarseLabel(value),
      }));
    case SortBy.Literacy:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.PercentOfOverallLanguageSpeakers:
      suffix = '%';
      break;
    case SortBy.Latitude:
    case SortBy.Longitude:
      suffix = '°';
      break;
    default:
      break;
  }

  const formatter = new Intl.NumberFormat(undefined, {
    notation: 'compact',
    compactDisplay: 'long', // or 'long' for “thousand”, “million”
    maximumFractionDigits: 1,
  });

  return Array.from({ length: numberOfTicks }, (_, index) => {
    if (index === 0) return { position: 0, label: formatter.format(minValue) + suffix };
    if (index === numberOfTicks - 1)
      return { position: 1, label: formatter.format(maxValue) + suffix };
    const position = index / (numberOfTicks - 1);
    return {
      position,
      label: formatter.format(numberToSigFigs(getDenormalizedValue(position), 2)) + suffix,
    };
  });
}

function pickDistributedTicksFromRange<T>(range: T[], count: number): T[] {
  if (range.length <= count) {
    return range;
  }
  const step = (range.length - 1) / (count - 1);
  const ticks: T[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step);
    ticks.push(range[index]);
  }
  return ticks;
}

export default ColorBar;

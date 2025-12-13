import { useCallback, useMemo } from 'react';

import { ObjectData } from '@entities/types/DataTypes';

import { getSortField } from '../sorting/sort';
import { SortBy } from '../sorting/SortTypes';

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
      if (!scaleBy || scaleBy === 'None') return 2; // default radius multiplier

      const val = getSortField(object, scaleBy);
      if (val == null) return 0; // not renderable

      const normalized = getNormalizedValue(val as number);
      // Map normalized 0..1 to radius multiplier 2..10
      return 2 + normalized * 8;
    },
    [scaleBy, getNormalizedValue],
  );

  return { scaleBy, getScale, maxValue, minValue };
};

export default useScale;

function getMinimumValue(scaleBy?: ScaleBy): number {
  switch (scaleBy) {
    case SortBy.Longitude:
      return -180;
    case SortBy.Latitude:
      return -90;
    case SortBy.ISOStatus:
      return -1;
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Literacy:
    case SortBy.VitalityMetascore:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
    case SortBy.Area:
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
      return 0;
    default:
      return 0;
  }
}

function getMaximumValue(objects: ObjectData[], scaleBy?: ScaleBy): number {
  switch (scaleBy) {
    case 'None':
      return 0;
    case SortBy.VitalityMetascore:
    case SortBy.ISOStatus:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
      return 9;
    case SortBy.Latitude:
      return 90;
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Literacy:
      return 100;
    case SortBy.Longitude:
      return 180;
    case SortBy.Date:
      return new Date().getTime();
    case SortBy.CountOfLanguages:
    case SortBy.CountOfTerritories:
    case SortBy.Population:
    case SortBy.PopulationAttested:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
    case SortBy.Area:
      return Math.max(
        objects.reduce(
          (acc, obj) => Math.max(acc, (getSortField(obj, scaleBy as SortBy) as number) || 0),
          0,
        ),
      );
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
      return 1;
    default:
      return 1;
  }
}

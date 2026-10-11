import React, { useCallback } from 'react';

import { POPULATION_MAX } from '@features/params/Profiles';
import usePageParams from '@features/params/usePageParams';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { Slider } from '@shared/ui/slider';

const PopulationFilterSelector: React.FC = () => {
  const { populationMin, populationMax, updatePageParams } = usePageParams();

  // The page params are the source of truth; convert them for the logarithmic slider.
  const sliderValue: [number, number] = [log(populationMin), log(populationMax)];

  const updateSlider = useCallback(
    (value: number | readonly number[]) => {
      const nextSliderValue: [number, number] = Array.isArray(value)
        ? [value[0], value[1]]
        : [sliderValue[0], value];
      const nextMin = exp(nextSliderValue[0]);
      const nextMax = exp(nextSliderValue[1]);

      if (nextMin !== populationMin || nextMax !== populationMax) {
        updatePageParams({ populationMin: nextMin, populationMax: nextMax });
      }
    },
    [populationMin, populationMax, sliderValue, updatePageParams],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs">
        {populationMin < 0 ? 'No minimum' : populationMin.toLocaleString()} to{' '}
        {populationMax >= POPULATION_MAX ? 'No maximum' : populationMax.toLocaleString()}
      </div>
      <Slider
        min={-0.2}
        max={log(POPULATION_MAX)}
        step={0.1}
        value={sliderValue}
        onValueChange={updateSlider}
      />
    </div>
  );
};

// Converts to base-10 log space, reserving negative values for the no-minimum and zero states.
function log(value: number): number {
  const rounded = numberToSigFigs(value, 2);
  if (rounded === -1) return -0.2;
  if (rounded <= 0) return -0.1;
  return Math.log10(rounded);
}

// Rounds values to something more readable (for example, 8675 becomes 8700).
function exp(value: number): number {
  if (value === -0.2) return -1;
  if (value < 0) return 0;
  return numberToSigFigs(Math.pow(10, value), 2);
}

export default PopulationFilterSelector;

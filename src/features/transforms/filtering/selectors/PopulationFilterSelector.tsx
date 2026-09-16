import React, { useCallback, useEffect } from 'react';

import { POPULATION_MAX } from '@features/params/Profiles';
import usePageParams from '@features/params/usePageParams';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { Slider } from '@shared/ui/slider';

const PopulationFilterSelector: React.FC = () => {
  const { populationMin, populationMax, updatePageParams } = usePageParams();

  // Use logarithmic scales for the slider
  const [sliderValue, setSliderValue] = React.useState<[number, number]>([
    log(populationMin),
    log(populationMax),
  ]);

  const updateSlider = useCallback(
    (value: number | readonly number[]) => {
      if (typeof value === 'number') {
        setSliderValue([sliderValue[0], value]);
      } else {
        setSliderValue([value[0], value[1]]);
      }
    },
    [sliderValue],
  );

  // Have slider update the page params
  useEffect(() => {
    updatePageParams({ populationMin: exp(sliderValue[0]), populationMax: exp(sliderValue[1]) });
  }, [sliderValue, updatePageParams]);

  // Have page params update the slider
  useEffect(() => {
    setSliderValue([log(populationMin), log(populationMax)]);
  }, [populationMin, populationMax]);

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

// Converts a number to the base-10 log version, but uses negative space for -1 and 0 (since they cannot be logged to)
function log(value: number): number {
  if (value === -1) return -0.2;
  if (value <= 0) return -0.1;
  return Math.log10(value);
}
// Also rounds the values to something more readable (eg. 8675 -> 8700)
function exp(value: number): number {
  if (value === -0.2) return -1;
  if (value < 0) return 0; // 10^0 = 1, so we need to use negative space for actual 0
  return numberToSigFigs(Math.pow(10, value), 2);
}

export default PopulationFilterSelector;

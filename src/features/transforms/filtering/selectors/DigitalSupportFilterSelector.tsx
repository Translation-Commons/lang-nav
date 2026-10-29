import React, { useCallback } from 'react';

import { DIGITAL_SUPPORT_MAX } from '@features/params/Profiles';
import usePageParams from '@features/params/usePageParams';

import { Slider } from '@shared/ui/slider';

const DigitalSupportFilterSelector: React.FC = () => {
  const { digitalSupportMin, digitalSupportMax, updatePageParams } = usePageParams();

  // The page params are the source of truth; convert them for the logarithmic slider.
  const sliderValue: [number, number] = [digitalSupportMin, digitalSupportMax];

  const updateSlider = useCallback(
    (value: number | readonly number[]) => {
      const [nextMin, nextMax] = Array.isArray(value)
        ? [value[0], value[1]]
        : [sliderValue[0], value];

      if (nextMin !== digitalSupportMin || nextMax !== digitalSupportMax) {
        updatePageParams({ digitalSupportMin: nextMin, digitalSupportMax: nextMax });
      }
    },
    [digitalSupportMin, digitalSupportMax, sliderValue, updatePageParams],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs">
        {digitalSupportMin < 0 ? 'No minimum' : digitalSupportMin.toLocaleString()} to{' '}
        {digitalSupportMax >= DIGITAL_SUPPORT_MAX
          ? 'No maximum'
          : digitalSupportMax.toLocaleString()}
      </div>
      <Slider
        min={-1}
        max={DIGITAL_SUPPORT_MAX}
        step={0.5}
        value={sliderValue}
        onValueChange={updateSlider}
      />
    </div>
  );
};

export default DigitalSupportFilterSelector;

import React, { useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

import { Slider } from '@shared/ui/slider';

const ScaleFactorSelector: React.FC = () => {
  const { scaleFactor, updatePageParams } = usePageParams();
  // const [localFactor, setLocalFactor] = React.useState(scaleFactor);
  const [localFactor, setLocalFactor] = React.useState(1);

  useEffect(() => {
    setLocalFactor(scaleFactor);
  }, [scaleFactor]);

  useEffect(() => {
    // if(scaleFactor === localFactor) return;
    // debounce
    const timeout = setTimeout(() => updatePageParams({ scaleFactor: localFactor }), 100);
    return () => clearTimeout(timeout);
  }, [localFactor, updatePageParams]);

  return (
    <Slider
      value={localFactor}
      min={0}
      max={10}
      step={0.1}
      onValueChange={(value) => {
        const newValue = typeof value === 'number' ? value : 1;
        setLocalFactor(newValue);
      }}
    />
  );
};

export default ScaleFactorSelector;

import React from 'react';

import { useDataVizParams } from '@features/params/DataVizParamsProvider';

import { Slider } from '@shared/ui/slider';

const DisperseSelector: React.FC = () => {
  const { disperse, setDisperse } = useDataVizParams();

  return (
    <Slider
      value={disperse}
      min={0}
      max={10}
      step={0.1}
      onValueChange={(value) => setDisperse && setDisperse(Array.isArray(value) ? value[0] : value)}
    />
  );
};

export default DisperseSelector;

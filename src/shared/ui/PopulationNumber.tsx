import React from 'react';

import Deemphasized from './Deemphasized';

const PopulationNumber: React.FC<{ population?: number | boolean | null }> = ({ population }) => {
  if (population == null || population === false) return <Deemphasized>—</Deemphasized>;
  if (population === true || (population > 0 && population <= 10))
    return <Deemphasized>≥1</Deemphasized>;
  if (population <= 0) return <Deemphasized>0</Deemphasized>;
  return <span>{population.toLocaleString()}</span>;
};

export default PopulationNumber;

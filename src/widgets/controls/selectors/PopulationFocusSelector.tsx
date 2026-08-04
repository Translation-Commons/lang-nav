import React from 'react';

import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import PopulationFocus from '@entities/types/PopulationFocus';

const PopulationFocusSelector: React.FC = () => {
  const { populationFocus, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Population Focus"
      selectorDescription="When we show population data, we sometimes can break it down by the population speaking a language or a population writing a language, change the primary way population data is shown that is with this setting."
      options={Object.values(PopulationFocus)}
      onChange={(populationFocus: PopulationFocus) => updatePageParams({ populationFocus })}
      selected={populationFocus}
    />
  );
};

export default PopulationFocusSelector;

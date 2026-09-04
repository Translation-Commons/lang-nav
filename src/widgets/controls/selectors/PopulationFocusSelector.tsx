import React from 'react';

import usePageParams from '@features/params/usePageParams';

import PopulationFocus from '@entities/types/PopulationFocus';

import { toTitleCase } from '@shared/lib/stringUtils';
import ContextIcon from '@shared/ui/ContextIcon';
import EnumDropdown from '@shared/ui/EnumDropdown';

const PopulationFocusSelector: React.FC = () => {
  const { populationFocus, updatePageParams } = usePageParams();

  return (
    <>
      <div className="text-right">
        Population focus{' '}
        <ContextIcon>
          When we show population data, we sometimes can break it down by the population speaking a
          language or a population writing a language, change the primary way population data is
          shown that is with this setting.
        </ContextIcon>
      </div>
      <EnumDropdown
        options={Object.values(PopulationFocus)}
        value={populationFocus}
        onChange={(value) => updatePageParams({ populationFocus: value as PopulationFocus })}
        getLabel={toTitleCase}
      />
    </>
  );
};

export default PopulationFocusSelector;

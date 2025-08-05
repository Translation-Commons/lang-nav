import React from 'react';

import { toTitleCase } from '../../generic/stringUtils';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const SortDirectionSelector: React.FC = () => {
  const { sortDirection, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Sort Direction"
      optionsDisplay={OptionsDisplay.ButtonGroup}
      options={['normal', 'reverse']}
      getOptionLabel={(direction) => toTitleCase(direction)}
      getOptionDescription={(direction) =>
        direction === 'normal'
          ? 'Sort with high numbers first / first letter in alphabet first.'
          : 'Sort with low numbers first / last letter in alphabet first.'
      }
      onChange={(direction: 'normal' | 'reverse') => updatePageParams({ sortDirection: direction })}
      selected={sortDirection}
    />
  );
};

export default SortDirectionSelector;

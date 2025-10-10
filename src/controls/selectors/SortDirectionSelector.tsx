import React from 'react';

import { SortBehavior } from '../../types/SortTypes';
import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';
import { usePageParams } from '../PageParamsContext';

const SortDirectionSelector: React.FC = () => {
  const { sortBehavior, updatePageParams } = usePageParams();

  return (
    <Selector<SortBehavior>
      selectorLabel="Sort Direction"
      display={SelectorDisplay.ButtonGroup}
      options={[SortBehavior.Normal, SortBehavior.Reverse]}
      getOptionLabel={(direction) => SortBehavior[direction]}
      getOptionDescription={(direction) =>
        direction === SortBehavior.Normal
          ? 'Sort with high numbers first / first letter in alphabet first.'
          : 'Sort with low numbers first / last letter in alphabet first.'
      }
      onChange={(behavior: SortBehavior) => updatePageParams({ sortBehavior: behavior })}
      selected={sortBehavior}
    />
  );
};

export default SortDirectionSelector;

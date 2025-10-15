import { SortBehavior } from '@features/sorting/SortTypes';
import React from 'react';

import { usePageParams } from '../../PageParamsProvider';
import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

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

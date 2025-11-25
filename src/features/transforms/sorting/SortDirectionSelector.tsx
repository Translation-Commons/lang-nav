import React from 'react';

import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { SortBehavior } from './SortTypes';

const SortDirectionSelector: React.FC = () => {
  const { sortBehavior, updatePageParams } = usePageParams();

  return (
    <Selector<SortBehavior>
      selectorLabel="Sort Direction"
      options={[SortBehavior.Normal, SortBehavior.Reverse]}
      getOptionLabel={(direction) => SortBehavior[direction]}
      getOptionDescription={(direction) =>
        direction === SortBehavior.Normal
          ? 'Sort with high numbers first / first letter in alphabet first.'
          : 'Sort with low numbers first / last letter in alphabet first.'
      }
      onChange={(sortBehavior) => updatePageParams({ sortBehavior })}
      selected={sortBehavior}
    />
  );
};

export default SortDirectionSelector;

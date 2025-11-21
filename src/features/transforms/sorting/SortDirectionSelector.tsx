import React from 'react';

import usePageParams from '@features/page-params/usePageParams';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import Selector from '../../../widgets/controls/components/Selector';

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

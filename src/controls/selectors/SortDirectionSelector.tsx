import React from 'react';

import { DisplaySortDirection } from '../../types/SortTypes';
import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';
import { usePageParams } from '../PageParamsContext';

const SortDirectionSelector: React.FC = () => {
  const { sortDirection, updatePageParams } = usePageParams();

  return (
    <Selector<DisplaySortDirection>
      selectorLabel="Sort Direction"
      display={SelectorDisplay.ButtonGroup}
      options={[DisplaySortDirection.Normal, DisplaySortDirection.Reverse]}
      getOptionLabel={(direction) => DisplaySortDirection[direction]}
      getOptionDescription={(direction) =>
        direction === DisplaySortDirection.Normal
          ? 'Sort with high numbers first / first letter in alphabet first.'
          : 'Sort with low numbers first / last letter in alphabet first.'
      }
      onChange={(direction: DisplaySortDirection) => updatePageParams({ sortDirection: direction })}
      selected={sortDirection}
    />
  );
};

export default SortDirectionSelector;

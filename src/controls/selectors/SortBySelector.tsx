import React from 'react';

import { SortBy } from '../../types/PageParamTypes';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const SortBySelector: React.FC = () => {
  const { sortBy, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Sort by:"
      selectorDescription="Choose the order of items in the view."
      options={Object.values(SortBy)}
      onChange={(sortBy: SortBy) => updatePageParams({ sortBy })}
      selected={sortBy}
      optionsDisplay={OptionsDisplay.ButtonList}
    />
  );
};

export default SortBySelector;

import React from 'react';

import { SortBy } from '../../types/PageParamTypes';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';
import { getSortBysApplicableToObjectType } from '../sort';

const SortBySelector: React.FC = () => {
  const { sortBy, updatePageParams, objectType } = usePageParams();
  const applicableSortBys = getSortBysApplicableToObjectType(objectType);

  return (
    <Selector
      selectorLabel="Sort by"
      selectorDescription="Choose the order of items in the view."
      options={Object.values(SortBy).filter((sb) => applicableSortBys.includes(sb))}
      onChange={(sortBy: SortBy) => updatePageParams({ sortBy })}
      selected={sortBy}
      optionsDisplay={OptionsDisplay.ButtonList}
    />
  );
};

export default SortBySelector;

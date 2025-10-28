import React from 'react';

import usePageParams from '@features/page-params/usePageParams';
import { getSortBysApplicableToObjectType } from '@features/sorting/sort';
import { SortBy } from '@features/sorting/SortTypes';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

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
      display={SelectorDisplay.ButtonList}
    />
  );
};

export default SortBySelector;

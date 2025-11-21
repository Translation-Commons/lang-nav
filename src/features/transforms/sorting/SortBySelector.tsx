import React from 'react';

import Selector from '@widgets/controls/components/Selector';
import { SelectorDisplay } from '@widgets/controls/components/SelectorDisplayContext';

import usePageParams from '@features/page-params/usePageParams';

import { getSortBysApplicableToObjectType } from './sort';
import { SortBy } from './SortTypes';

const SortBySelector: React.FC = () => {
  const { sortBy, updatePageParams, objectType } = usePageParams();
  const applicableSortBys = getSortBysApplicableToObjectType(objectType);

  return (
    <Selector
      selectorLabel="Sort By"
      selectorDescription="Choose the order of items in the view."
      options={Object.values(SortBy).filter((sb) => applicableSortBys.includes(sb))}
      onChange={(sortBy) => updatePageParams({ sortBy })}
      selected={sortBy}
      display={SelectorDisplay.Dropdown}
    />
  );
};

export default SortBySelector;

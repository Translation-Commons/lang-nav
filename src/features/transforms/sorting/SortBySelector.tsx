import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import {
  getFieldsForSorting,
  intersectAllowedWithObjectType,
} from '@features/transforms/fields/FieldApplicability';

import { SortBy } from './SortTypes';

const SortBySelector: React.FC = () => {
  const { sortBy, updatePageParams, objectType } = usePageParams();
  const applicableSortBys = intersectAllowedWithObjectType(getFieldsForSorting(), objectType);

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

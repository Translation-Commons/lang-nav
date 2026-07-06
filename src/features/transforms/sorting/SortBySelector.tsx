import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';

import TransformEnum from '../TransformEnum';

const SortBySelector: React.FC = () => {
  const { sortBy, updatePageParams, objectType } = usePageParams();
  const applicableSortBys = getApplicableFields(TransformEnum.Sort, objectType);

  return (
    <Selector
      selectorLabel="Sort By"
      selectorDescription="Choose the order of items in the view."
      options={applicableSortBys}
      onChange={(sortBy) => updatePageParams({ sortBy })}
      selected={sortBy}
      display={SelectorDisplay.Dropdown}
    />
  );
};

export default SortBySelector;

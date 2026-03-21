import { ArrowDownUpIcon } from 'lucide-react';
import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';

import TransformEnum from '../TransformEnum';

const SortBySelector: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
  const { sortBy, updatePageParams, objectType } = usePageParams();
  const applicableSortBys = getApplicableFields(TransformEnum.Sort, objectType);

  return (
    <Selector
      selectorLabel={showLabel ? 'Sort By' : <ArrowDownUpIcon size="1.2em" />}
      selectorDescription={showLabel ? 'Choose the order of items in the view.' : undefined}
      options={applicableSortBys}
      onChange={(sortBy) => updatePageParams({ sortBy })}
      selected={sortBy}
      display={SelectorDisplay.Dropdown}
    />
  );
};

export default SortBySelector;

import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getSortBysApplicableToObjectType } from '@features/transforms/fields/FieldApplicability';

import Field from '../fields/Field';

const SecondarySortBySelector: React.FC = () => {
  const { secondarySortBy, updatePageParams, objectType } = usePageParams();
  const applicableSortBys = getSortBysApplicableToObjectType(objectType);
  const options = [Field.None, ...applicableSortBys];

  return (
    <Selector<Field>
      selectorLabel="Secondary Sort By"
      selectorDescription="Tie-breaker when the primary sort is equal."
      options={options}
      onChange={(secondarySortBy) => updatePageParams({ secondarySortBy })}
      selected={secondarySortBy ?? Field.None}
      display={SelectorDisplay.Dropdown}
    />
  );
};

export default SecondarySortBySelector;

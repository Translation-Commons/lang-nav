import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

const SearchBySelector: React.FC = () => {
  const { updatePageParams, searchBy } = usePageParams();

  return (
    <Selector
      selectorLabel="Search by"
      options={Object.values(SearchableField)}
      onChange={(searchBy) => updatePageParams({ searchBy })}
      selected={searchBy}
      display={SelectorDisplay.Dropdown}
      selectorStyle={{ marginLeft: '1em', marginBottom: '0em' }}
    />
  );
};

export default SearchBySelector;

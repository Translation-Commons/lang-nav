import React from 'react';

import { SearchableField } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplayContext';

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

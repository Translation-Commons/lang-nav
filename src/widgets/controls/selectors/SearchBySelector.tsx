import React from 'react';

import { usePageParams } from '@widgets/PageParamsProvider';
import { SearchableField } from '@widgets/PageParamTypes';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

const SearchBySelector: React.FC = () => {
  const { updatePageParams, searchBy } = usePageParams();

  return (
    <Selector
      selectorLabel="Search by"
      options={Object.values(SearchableField)}
      display={SelectorDisplay.Dropdown}
      onChange={(searchBy) => updatePageParams({ searchBy })}
      selected={searchBy}
      selectorStyle={{ marginLeft: '1em', marginBottom: '0em' }}
    />
  );
};

export default SearchBySelector;

import React from 'react';

import { SearchableField } from '../../types/PageParamTypes';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const SearchBySelector: React.FC = () => {
  const { updatePageParams, searchBy } = usePageParams();

  return (
    <Selector
      selectorLabel="Search by"
      options={Object.values(SearchableField)}
      optionsDisplay={OptionsDisplay.Dropdown}
      onChange={(searchBy) => updatePageParams({ searchBy })}
      selected={searchBy}
      selectorStyle={{ marginLeft: '1em', marginBottom: '0em' }}
    />
  );
};

export default SearchBySelector;

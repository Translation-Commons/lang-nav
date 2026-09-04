import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import EnumDropdown from '@shared/ui/EnumDropdown';

const SearchBySelector: React.FC = () => {
  const { updatePageParams, searchBy } = usePageParams();

  return (
    <>
      <div className="text-right">Search by</div>
      <EnumDropdown
        options={Object.values(SearchableField)}
        value={searchBy}
        onChange={(value) => updatePageParams({ searchBy: value })}
      />
    </>
  );
};

export default SearchBySelector;

import { useEffect, useState } from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import EnumDropdown from '@shared/ui/EnumDropdown';
import { Input } from '@shared/ui/input';

const SubstringFilterSelector = () => {
  const { updatePageParams, searchBy, searchString } = usePageParams();
  const [localString, setLocalString] = useState(searchString);

  useEffect(() => {
    setLocalString(searchString);
  }, [searchString]);
  useEffect(() => {
    // debounce
    const handler = setTimeout(() => {
      updatePageParams({ searchString: localString });
    }, 300);
    return () => clearTimeout(handler);
  }, [localString]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex text-xs items-center gap-2">
        Search by
        <EnumDropdown<SearchableField>
          options={Object.values(SearchableField)}
          value={searchBy}
          onChange={(searchBy) => updatePageParams({ searchBy })}
        />
      </div>
      <Input
        placeholder="Name or code"
        value={localString}
        onChange={(e) => setLocalString(e.target.value)}
      />
    </div>
  );
};

export default SubstringFilterSelector;

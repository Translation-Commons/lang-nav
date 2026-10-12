import { FilterIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { InputGroup, InputGroupButton, InputGroupInput } from '@shared/ui/input-group';

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
    <InputGroup>
      <InputGroupInput
        placeholder="Search..."
        value={localString}
        onChange={(e) => setLocalString(e.target.value)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <InputGroupButton aria-label="Choose search field">
              <FilterIcon />
            </InputGroupButton>
          }
        />
        <DropdownMenuContent className="min-w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Search by</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={searchBy}
              onValueChange={(searchBy) => updatePageParams({ searchBy })}
            >
              {Object.values(SearchableField).map((option) => (
                <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer">
                  {option}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <InputGroupButton aria-label="Clear search" onClick={() => setLocalString('')}>
        <XIcon />
      </InputGroupButton>
    </InputGroup>
  );
};

export default SubstringFilterSelector;

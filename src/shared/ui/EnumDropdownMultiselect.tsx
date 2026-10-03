import { ChevronDownIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { joinOxfordComma } from '@shared/lib/stringUtils';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

type Props<T extends React.Key> = {
  value: T[];
  onChange: (value: T[]) => void;
  options: T[];
  getLabel?: (value: T) => string;
  allSelectedLabel?: string;
  noneSelectedLabel?: string;
};

function EnumDropdownMultiSelect<T extends React.Key>({
  value,
  onChange,
  options,
  getLabel = (v) => v.toString(),
  allSelectedLabel = 'All Selected',
  noneSelectedLabel = 'None Selected',
}: Props<T>) {
  const toggleOption = useCallback(
    (option: T) => {
      if (value.includes(option)) onChange(value.filter((v) => v !== option));
      else onChange([...value, option]);
    },
    [value, onChange],
  );
  let buttonLabel = joinOxfordComma(value.map(getLabel), 'or');
  if (value.length === 0) buttonLabel = noneSelectedLabel;
  if (value.length === options.length) buttonLabel = allSelectedLabel;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="cursor-pointer" variant="outline" title={buttonLabel}>
            <div className="max-w-30 truncate text-ellipsis">{buttonLabel}</div>
            <ChevronDownIcon />
          </Button>
        }
      />
      <DropdownMenuContent>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={value.includes(option)}
            className="cursor-pointer"
            onCheckedChange={() => toggleOption(option)}
          >
            {getLabel(option)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EnumDropdownMultiSelect;

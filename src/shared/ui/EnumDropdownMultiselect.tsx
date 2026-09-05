import React, { useCallback } from 'react';

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="cursor-pointer" variant="outline">
            <div className="max-w-30 truncate text-ellipsis">
              {value.length === 0 && noneSelectedLabel}
              {value.length === options.length && allSelectedLabel}
              {value.length > 0 && value.length < options.length && value.map(getLabel).join(', ')}
            </div>
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

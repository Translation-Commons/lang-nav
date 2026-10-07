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
  limitWidth?: boolean;
};

function EnumDropdownMultiSelect<T extends React.Key>({
  value,
  onChange,
  options,
  getLabel = (v) => v.toString(),
  allSelectedLabel = 'All Selected',
  noneSelectedLabel = 'None Selected',
  limitWidth = true,
}: Props<T>) {
  let buttonLabel = joinOxfordComma(value.map(getLabel), 'or');
  if (value.length === 0) buttonLabel = noneSelectedLabel;
  if (value.length === options.length) buttonLabel = allSelectedLabel;
  const noneSameAsAll = allSelectedLabel === noneSelectedLabel;
  const isAllSelected = options.length === value.length || (value.length == 0 && noneSameAsAll);

  const toggleOption = useCallback(
    (option: T) => {
      if (isAllSelected) onChange(options.filter((o) => o !== option));
      else if (value.includes(option)) onChange(value.filter((v) => v !== option));
      else onChange([...value, option]);
    },
    [value, onChange, isAllSelected, options],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="cursor-pointer" variant="outline" title={buttonLabel}>
            <div className={`truncate text-ellipsis${limitWidth ? ' max-w-30' : ''}`}>
              {buttonLabel}
            </div>
            <ChevronDownIcon />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={isAllSelected}
          className="cursor-pointer"
          onCheckedChange={() => onChange(noneSameAsAll ? [] : options)}
          disabled={isAllSelected && noneSameAsAll}
        >
          {allSelectedLabel}
        </DropdownMenuCheckboxItem>
        {!noneSameAsAll && (
          <DropdownMenuCheckboxItem
            checked={value.length === 0}
            className="cursor-pointer"
            onCheckedChange={() => onChange([])}
          >
            {noneSelectedLabel}
          </DropdownMenuCheckboxItem>
        )}

        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={value.includes(option) || isAllSelected}
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

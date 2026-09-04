import React from 'react';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

type Props<T extends React.Key> = {
  value: T;
  onChange: (value: T) => void;
  options: T[];
  getLabel?: (value: T) => string;
};

function EnumDropdown<T extends React.Key>({
  value,
  onChange,
  options,
  getLabel = (v) => v.toString(),
}: Props<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="cursor-pointer" variant="outline">
            <div className="truncate text-ellipsis">{getLabel(value)}</div>
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer">
              {getLabel(option)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EnumDropdown;

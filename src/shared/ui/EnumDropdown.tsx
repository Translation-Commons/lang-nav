import type { LucideIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@shared/lib/utils';
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
  getLabel?: (value: T) => React.ReactNode;
  getIcon?: (value: T) => LucideIcon | undefined;
  buttonClassname?: string;
  popupClassname?: string;
};

function EnumDropdown<T extends React.Key>({
  value,
  onChange,
  options,
  getLabel = (v) => v.toString(),
  getIcon,
  buttonClassname,
  popupClassname,
}: Props<T>) {
  const Icon = getIcon ? getIcon(value) : undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className={cn('cursor-pointer min-w-30', buttonClassname)}
            variant="outline"
            role="dropdown"
          >
            <div className="truncate text-ellipsis">{getLabel(value)}</div>
            {Icon && <Icon />}
          </Button>
        }
      />
      <DropdownMenuContent className={cn('min-w-40', popupClassname)}>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => {
            const Icon = getIcon ? getIcon(option) : undefined;
            return (
              <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer">
                {getLabel(option)}
                {Icon && <Icon />}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EnumDropdown;

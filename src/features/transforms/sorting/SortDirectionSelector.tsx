import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import { SortBehavior } from './SortTypes';

const SortDirectionSelector: React.FC = () => {
  const { sortBehavior, updatePageParams } = usePageParams();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">{SortBehavior[sortBehavior]}</Button>}
      />
      <DropdownMenuContent className="z-200">
        <DropdownMenuRadioGroup
          value={sortBehavior}
          onValueChange={(value) => updatePageParams({ sortBehavior: value as SortBehavior })}
        >
          {[SortBehavior.Normal, SortBehavior.Reverse].map((direction) => (
            <DropdownMenuRadioItem key={direction} value={direction}>
              {SortBehavior[direction]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDirectionSelector;

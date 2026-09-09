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

import Field from '../fields/Field';

import { SortBehavior } from './SortTypes';

const SortDirectionSelector: React.FC<{ pageParam: 'sortBehavior' | 'secondarySortBehavior' }> = ({
  pageParam,
}) => {
  const params = usePageParams();
  const { updatePageParams, secondarySortBy } = params;
  const sortBehavior = params[pageParam];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            disabled={pageParam === 'secondarySortBehavior' && secondarySortBy === Field.None}
          >
            {SortBehavior[sortBehavior]}
          </Button>
        }
      />
      <DropdownMenuContent className="z-200">
        <DropdownMenuRadioGroup
          value={sortBehavior}
          onValueChange={(value) => updatePageParams({ [pageParam]: value as SortBehavior })}
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

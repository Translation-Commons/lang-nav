import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import { SortBehavior } from './SortTypes';

const SortDirectionSelector: React.FC = () => {
  const { sortBehavior, updatePageParams } = usePageParams();

  // return (
  //   <Selector<SortBehavior>
  //     options={[SortBehavior.Normal, SortBehavior.Reverse]}
  //     getOptionLabel={(direction) => SortBehavior[direction]}
  //     getOptionDescription={(direction) =>
  //       direction === SortBehavior.Normal
  //         ? 'Sort with high numbers first / first letter in alphabet first.'
  //         : 'Sort with low numbers first / last letter in alphabet first.'
  //     }
  //     onChange={(sortBehavior) => updatePageParams({ sortBehavior })}
  //     selected={sortBehavior}
  //   />
  // );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">{SortBehavior[sortBehavior]}</Button>}
      />
      <DropdownMenuContent className="z-200">
        {[SortBehavior.Normal, SortBehavior.Reverse].map((direction) => (
          <DropdownMenuCheckboxItem
            checked={direction === sortBehavior}
            key={direction}
            onCheckedChange={() => updatePageParams({ sortBehavior: direction })}
          >
            {SortBehavior[direction]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDirectionSelector;

import { ArrowDownUpIcon } from 'lucide-react';
import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

import FieldDropdown from './FieldDropdown';
import SortDirectionSelector from './SortDirectionSelector';

const SortPopupCard: React.FC = () => {
  const { sortBy } = usePageParams();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button className="py-4 max-w-60 rounded-xl flex items-center text-lg gap-2 cursor-pointer">
            <ArrowDownUpIcon />
            <div className="truncate text-ellipsis">{sortBy}</div>
          </Button>
        }
      />
      <PopoverContent className="grid grid-cols-2 gap-2 items-center">
        <div className="text-right">Sort By</div>
        <FieldDropdown pageParam="sortBy" />
        <div className="text-right">Secondary Sort By</div>
        <FieldDropdown pageParam="secondarySortBy" />
        <div className="text-right">Sort Direction</div>
        <SortDirectionSelector />
      </PopoverContent>
    </Popover>
  );
};

export default SortPopupCard;

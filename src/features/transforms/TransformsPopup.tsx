import { ArrowDownUpIcon, PaletteIcon, ScalingIcon, SearchIcon } from 'lucide-react';
import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

import FieldDropdown from './sorting/FieldDropdown';
import SortDirectionSelector from './sorting/SortDirectionSelector';

type Props = {};

const TransformsPopup: React.FC<Props> = () => {
  const { sortBy, colorBy, scaleBy, fieldFocus } = usePageParams();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className="py-1 max-w-60 h-fit rounded-md flex flex-col items-center text-sm gap-0 cursor-pointer"
            variant={'default'}
          >
            <div className="flex flex-row items-center gap-1">
              <ArrowDownUpIcon />
              <div className="truncate text-ellipsis">{sortBy}</div>
            </div>
            <div className="flex flex-row items-center gap-1">
              <PaletteIcon />
              <div className="truncate text-ellipsis">{colorBy}</div>
            </div>
            <div className="flex flex-row items-center gap-1">
              <ScalingIcon />
              <div className="truncate text-ellipsis">{scaleBy}</div>
            </div>
            <div className="flex flex-row items-center gap-1">
              <SearchIcon />
              <div className="truncate text-ellipsis">{fieldFocus}</div>
            </div>
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

export default TransformsPopup;

import { EyeIcon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { Separator } from '@shared/ui/separator';

import ColorGradientSelector from './coloring/ColorGradientSelector';
import FieldDropdown from './sorting/FieldDropdown';
import SortDirectionSelector from './sorting/SortDirectionSelector';

const TransformsPopup: React.FC = () => {
  const { view } = usePageParams();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className="py-1 max-w-60 h-fit rounded-md   text-sm  cursor-pointer"
            variant={'default'}
          >
            <EyeIcon />
            View Options
          </Button>
        }
      />
      <PopoverContent className="grid grid-cols-2 gap-2 items-center">
        <div className="text-right">Sort By</div>
        <FieldDropdown pageParam="sortBy" />
        <div className="text-right">Sort Direction</div>
        <SortDirectionSelector pageParam="sortBehavior" />
        <div className="text-right">Secondary Sort By</div>
        <FieldDropdown pageParam="secondarySortBy" />
        <div className="text-right">Secondary Sort Direction</div>
        <SortDirectionSelector pageParam="secondarySortBehavior" />

        {(view === View.Map || view === View.CardList) && (
          <>
            <Separator className="col-span-2" />
            <div className="text-right">Color By</div>
            <FieldDropdown pageParam="colorBy" />
            <div className="text-right">Color Gradient</div>
            <ColorGradientSelector />
          </>
        )}

        {view === View.Map && (
          <>
            <Separator className="col-span-2" />
            <div className="text-right">Scale By</div>
            <FieldDropdown pageParam="scaleBy" />
          </>
        )}

        {(view === View.Hierarchy || view === View.Map) && (
          <>
            <Separator className="col-span-2" />
            <div className="text-right">Show text for</div>
            <FieldDropdown pageParam="fieldFocus" />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TransformsPopup;

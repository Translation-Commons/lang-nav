import React from 'react';

import usePageParams from '@features/params/usePageParams';
import { ColorGradient } from '@features/transforms/coloring/ColorTypes';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import BaseColorBar from './BaseColorBar';

const ColorGradientSelector: React.FC = () => {
  const { colorGradient, updatePageParams } = usePageParams();
  const direction = colorGradient > 0 ? 'forward' : 'reverse';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        // disabled={colorBy == Field.None}
        render={
          <Button className="cursor-pointer" variant="outline">
            <div className="min-w-[4em] w-full h-[16px]">
              <BaseColorBar colorGradient={colorGradient} />
            </div>
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={colorGradient}
          onValueChange={(value) => updatePageParams({ colorGradient: value })}
        >
          {Object.values(ColorGradient)
            .filter((cg) => typeof cg === 'number')
            .filter((cg) => (direction === 'forward' ? cg > 0 : cg < 0))
            .map((cg) => (
              <DropdownMenuRadioItem key={cg} value={cg}>
                <div className="min-w-[4em] w-full h-[16px]">
                  <BaseColorBar colorGradient={cg} />
                </div>
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={direction === 'reverse'}
          onCheckedChange={(checked) => {
            const newDirection = checked ? 'reverse' : 'forward';
            const newColorGradient =
              Math.abs(colorGradient) * (newDirection === 'forward' ? 1 : -1);
            updatePageParams({ colorGradient: newColorGradient });
          }}
        >
          Reverse
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColorGradientSelector;

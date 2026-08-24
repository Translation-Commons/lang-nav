import React from 'react';

import usePageParams from '@features/params/usePageParams';
import { ColorGradient } from '@features/transforms/coloring/ColorTypes';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import Field from '../fields/Field';

import BaseColorBar from './BaseColorBar';

const ColorGradientSelector: React.FC = () => {
  const { colorBy, colorGradient, updatePageParams } = usePageParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={colorBy == Field.None}
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
            .map((cg) => (
              <DropdownMenuRadioItem key={cg} value={cg}>
                <div className="min-w-[4em] w-full h-[16px]">
                  <BaseColorBar colorGradient={cg} />
                </div>
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColorGradientSelector;

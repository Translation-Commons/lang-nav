import { Maximize2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';

type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
};

const controls: { label: string; Icon: React.ElementType; action: keyof Props }[] = [
  { label: 'Zoom in', Icon: ZoomInIcon, action: 'zoomIn' },
  { label: 'Zoom out', Icon: ZoomOutIcon, action: 'zoomOut' },
  { label: 'Reset', Icon: Maximize2Icon, action: 'resetTransform' },
];

const ZoomControls: React.FC<Props> = ({ zoomIn, zoomOut, resetTransform }) => {
  const handlers = { zoomIn, zoomOut, resetTransform };
  return (
    <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
      {controls.map(({ label, Icon, action }) => (
        <Tooltip key={label}>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label={label}
                onClick={handlers[action as 'zoomIn' | 'zoomOut' | 'resetTransform']}
              />
            }
          >
            <Icon />
          </TooltipTrigger>
          <TooltipContent side="left">{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ZoomControls;

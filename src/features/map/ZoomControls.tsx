import { Maximize2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import React from 'react';

import ZIndex from '@features/layers/ZIndex';

import { Button } from '@shared/ui/button';

type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
  containerWidth?: number;
};

const ZoomControls: React.FC<Props> = ({
  zoomIn,
  zoomOut,
  resetTransform,
  containerWidth = 800,
}) => {
  const fontSize = containerWidth < 500 ? '0.7em' : containerWidth < 700 ? '0.85em' : '1em';
  return (
    <div
      className="absolute top-2 right-2 flex flex-col gap-2"
      style={{ zIndex: ZIndex.MapZoomControls, fontSize }}
    >
      <Button
        aria-label="Zoom in"
        className="cursor-pointer h-8 w-8"
        onClick={zoomIn}
        variant="secondary"
      >
        <ZoomInIcon />
      </Button>
      <Button
        aria-label="Zoom out"
        className="cursor-pointer h-8 w-8"
        onClick={zoomOut}
        variant="secondary"
      >
        <ZoomOutIcon />
      </Button>
      <Button
        aria-label="Reset"
        className="cursor-pointer h-8 w-8"
        onClick={resetTransform}
        variant="secondary"
      >
        <Maximize2Icon />
      </Button>
    </div>
  );
};

export default ZoomControls;

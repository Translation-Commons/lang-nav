import { GlobeIcon, Grid2x2Icon, Maximize2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import React from 'react';

import ZIndex from '@features/layers/ZIndex';
import usePageParams from '@features/params/usePageParams';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';

import { Button } from '@shared/ui/button';

type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  containerWidth?: number;
};

const ZoomControls: React.FC<Props> = ({ zoomIn, zoomOut, resetView, containerWidth = 800 }) => {
  const { showMapBorders, setShowMapBorders, showMapAsGlobe, setShowMapAsGlobe } = usePageParams();
  const globeLabel = showMapAsGlobe ? 'Show as a flat map' : 'Show as a globe';
  const bordersLabel = showMapBorders ? 'Hide country borders' : 'Show country borders';
  const fontSize = containerWidth < 500 ? '0.7em' : containerWidth < 700 ? '0.85em' : '1em';
  // Small maps, like the one in a territory's details, are too short for six full-size buttons.
  const isSmall = containerWidth < 500;
  return (
    <div
      className={
        'absolute top-2 right-2 flex flex-col ' +
        (isSmall ? 'gap-1 [&_button]:size-6 [&_svg]:size-3.5' : 'gap-2')
      }
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
        onClick={resetView}
        variant="secondary"
      >
        <Maximize2Icon />
      </Button>
      <Button
        aria-label={globeLabel}
        title={globeLabel}
        aria-pressed={showMapAsGlobe}
        className="cursor-pointer h-8 w-8"
        onClick={() => setShowMapAsGlobe(!showMapAsGlobe)}
        variant={showMapAsGlobe ? 'active' : 'secondary'}
      >
        <GlobeIcon />
      </Button>
      <Button
        aria-label={bordersLabel}
        title={bordersLabel}
        aria-pressed={showMapBorders}
        className="cursor-pointer h-8 w-8"
        onClick={() => setShowMapBorders(!showMapBorders)}
        variant={showMapBorders ? 'active' : 'secondary'}
      >
        <Grid2x2Icon />
      </Button>
      <FieldFocusSelector isMapControl />
    </div>
  );
};

export default ZoomControls;

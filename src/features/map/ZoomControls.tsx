import { Maximize2Icon, ZoomInIcon, ZoomOutIcon, Settings2 } from 'lucide-react';
import React from 'react';

import HoverableIcon from '@features/layers/hovercard/HoverableIcon';
import PopupCard from '@features/layers/popupcard/PopupCard';
import ZIndex from '@features/layers/ZIndex';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import ScaleBySelector from '@features/transforms/scales/ScaleBySelector';

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
    <div style={{ ...containerStyle, fontSize }}>
      <HoverableIcon onClick={zoomIn} description="Zoom in" Icon={ZoomInIcon} />
      <HoverableIcon onClick={zoomOut} description="Zoom out" Icon={ZoomOutIcon} />
      <HoverableIcon onClick={resetTransform} description="Reset" Icon={Maximize2Icon} />
      <PopupCard
        buttonLabel={<Settings2 style={{ display: 'block' }} />}
        buttonStyle={{ padding: '0.5em' }}
        description="Map Display Options"
        body={
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', width: 'max-content' }}
          >
            <ColorBySelector />
            <ColorGradientSelector />
            <ScaleBySelector />
          </div>
        }
      />
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0.5em',
  right: '0.5em',
  zIndex: ZIndex.MapZoomControls,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5em',
};

export default ZoomControls;

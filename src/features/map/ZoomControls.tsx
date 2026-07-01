import { Maximize2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import React from 'react';

import HoverableIcon from '@features/layers/hovercard/HoverableIcon';
import ZIndex from '@features/layers/ZIndex';

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

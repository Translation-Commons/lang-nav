import { Maximize2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import ZIndex from '@features/layers/ZIndex';

type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
  containerWidth?: number;
};

const ZoomControls: React.FC<Props> = ({ zoomIn, zoomOut, resetTransform, containerWidth = 800 }) => {
  const iconSize = containerWidth < 500 ? 16 : containerWidth < 700 ? 20 : 24;
  const padding = containerWidth < 500 ? '0.25em' : containerWidth < 700 ? '0.35em' : '0.5em';
  const buttonStyle: React.CSSProperties = {
    padding,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <div style={containerStyle}>
      <HoverableButton onClick={zoomIn} style={buttonStyle} aria-label="Zoom in">
        <ZoomInIcon size={iconSize} />
      </HoverableButton>

      <HoverableButton onClick={zoomOut} style={buttonStyle} aria-label="Zoom out">
        <ZoomOutIcon size={iconSize} />
      </HoverableButton>

      <HoverableButton onClick={resetTransform} style={buttonStyle} aria-label="Reset">
        <Maximize2Icon size={iconSize} />
      </HoverableButton>
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

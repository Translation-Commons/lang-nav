import { Maximize2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
};

const ZoomControls: React.FC<Props> = ({ zoomIn, zoomOut, resetTransform }) => {
  return (
    <div style={containerStyle}>
      <HoverableButton onClick={zoomIn} style={buttonStyle} aria-label="Zoom in">
        <ZoomInIcon />
      </HoverableButton>

      <HoverableButton onClick={zoomOut} style={buttonStyle} aria-label="Zoom out">
        <ZoomOutIcon />
      </HoverableButton>

      <HoverableButton onClick={resetTransform} style={buttonStyle} aria-label="Reset">
        <Maximize2Icon />
      </HoverableButton>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0.5em',
  right: '0.5em',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5em',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default ZoomControls;

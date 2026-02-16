import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
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
      <HoverableButton
        onClick={() => {
          zoomIn();
        }}
        style={buttonStyle}
        aria-label="Zoom in"
      >
        <ZoomIn strokeWidth={2} />
      </HoverableButton>

      <HoverableButton
        onClick={() => {
          zoomOut();
        }}
        style={buttonStyle}
        aria-label="Zoom out"
      >
        <ZoomOut strokeWidth={2} />
      </HoverableButton>

      <HoverableButton
        onClick={() => {
          resetTransform();
        }}
        style={buttonStyle}
        aria-label="Reset"
      >
        <Maximize2 strokeWidth={2} />
      </HoverableButton>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const buttonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default ZoomControls;

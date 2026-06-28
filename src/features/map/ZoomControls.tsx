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

const ZoomControls: React.FC<Props> = ({
  zoomIn,
  zoomOut,
  resetTransform,
  containerWidth = 800,
}) => {
  const fontSize = containerWidth < 500 ? '0.7em' : containerWidth < 700 ? '0.85em' : '1em';
  return (
    <div style={{ ...containerStyle, fontSize }}>
      <HoverableButton onClick={zoomIn} style={buttonStyle} aria-label="Zoom in">
        <ZoomInIcon style={iconStyle} />
      </HoverableButton>

      <HoverableButton onClick={zoomOut} style={buttonStyle} aria-label="Zoom out">
        <ZoomOutIcon style={iconStyle} />
      </HoverableButton>

      <HoverableButton onClick={resetTransform} style={buttonStyle} aria-label="Reset">
        <Maximize2Icon style={iconStyle} />
      </HoverableButton>
    </div>
  );
};

const iconStyle: React.CSSProperties = { width: '1em', height: '1em' };

const buttonStyle: React.CSSProperties = {
  padding: '0.5em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

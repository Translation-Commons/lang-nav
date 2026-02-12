import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import React from 'react';

type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
};

const ICON_COLOR = '#0066cc';
const HOVER_BG = '#f5f5f5';
const DEFAULT_BG = 'white';

const ZoomControls: React.FC<Props> = ({ zoomIn, zoomOut, resetTransform }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <button
        onClick={() => zoomIn()}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = HOVER_BG;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = DEFAULT_BG;
        }}
        aria-label="Zoom in"
      >
        <ZoomIn color={ICON_COLOR} strokeWidth={2} />
      </button>

      <button
        onClick={() => zoomOut()}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = HOVER_BG;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = DEFAULT_BG;
        }}
        aria-label="Zoom out"
      >
        <ZoomOut color={ICON_COLOR} strokeWidth={2} />
      </button>

      <button
        onClick={() => resetTransform()}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = HOVER_BG;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = DEFAULT_BG;
        }}
        aria-label="Reset view"
      >
        <Maximize2 color={ICON_COLOR} strokeWidth={2} />
      </button>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #ccc',
  borderRadius: '6px',
  backgroundColor: 'white',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.2s',
};

export default ZoomControls;

import { ChevronRightIcon, XIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

const SidePanelToggleButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  panelWidth: number;
  panelSide: 'left' | 'right';
}> = ({ isOpen, onClick, panelWidth, panelSide }) => {
  return (
    <HoverableButton
      hoverContent={isOpen ? 'Close side panel' : 'Open side panel to customize view'}
      className={isOpen ? 'selected primary' : 'primary'}
      onClick={onClick}
      style={{
        borderRadius: '1em',
        padding: '.5em',
        position: 'fixed',
        top: '50%',
        left: panelSide === 'left' ? (isOpen ? panelWidth : '1.5em') : 'auto',
        right: panelSide === 'right' ? (isOpen ? panelWidth : '-1.5em') : 'auto',
        // move it to the center of its position
        transform:
          panelSide === 'left'
            ? 'translateX(-50%) translateY(-50%)'
            : 'translateX(50%) translateY(-50%)',
        zIndex: 1000,
        // transition: 'left 0.3s ease-in-out',
      }}
      aria-label={isOpen ? 'Close side panel' : 'Open side panel to customize view'}
    >
      {panelSide === 'left' ? (
        <ChevronRightIcon
          size="1em"
          display="block"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
      ) : (
        <XIcon size="1em" display="block" />
      )}
    </HoverableButton>
  );
};

export default SidePanelToggleButton;

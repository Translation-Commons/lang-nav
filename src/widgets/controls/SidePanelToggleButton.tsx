import { FilterIcon, FilterXIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

const SidePanelToggleButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  panelWidth: number;
  purpose: 'filters' | 'details';
}> = ({ isOpen, onClick, panelWidth, purpose }) => {
  const panelSide = purpose === 'filters' ? 'left' : 'right';

  return (
    <HoverableButton
      hoverContent={isOpen ? `Close ${purpose} panel` : `Open ${purpose} panel`}
      className={isOpen ? 'selected primary' : 'primary'}
      onClick={onClick}
      style={{
        borderRadius: '1em',
        padding: '.5em',
        position: 'fixed',
        top: '5em',
        left: panelSide === 'left' ? (isOpen ? panelWidth : '1.5em') : 'auto',
        right: panelSide === 'right' ? (isOpen ? panelWidth : '1.5em') : 'auto',
        // move it to the center of its position
        transform:
          panelSide === 'left'
            ? 'translateX(-50%) translateY(-50%)'
            : 'translateX(50%) translateY(-50%)',
        zIndex: 1000,
        transition: 'left 0.3s ease-in-out, right 0.3s ease-in-out',
      }}
      aria-label={isOpen ? 'Close panel' : `Open ${purpose}`}
    >
      <Icon purpose={purpose} isOpen={isOpen} />
    </HoverableButton>
  );
};

const Icon: React.FC<{ purpose: 'details' | 'filters'; isOpen: boolean }> = ({
  purpose,
  isOpen,
}) => {
  if (purpose === 'details') {
    if (isOpen) return <ZoomOutIcon size="1em" display="block" />;
    else return <ZoomInIcon size="1em" display="block" />;
  } else {
    if (isOpen) return <FilterXIcon size="1em" display="block" />;
    else return <FilterIcon size="1em" display="block" />;
  }
};

export default SidePanelToggleButton;

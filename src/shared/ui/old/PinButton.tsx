import { PinIcon, PinOffIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import './pinButton.css';

interface Props {
  className?: string;
  isPinned: boolean;
  onTogglePin: () => void;
}

const PinButton: React.FC<Props> = ({ className, isPinned, onTogglePin }) => {
  // The action on a pinned item is always to unpin it, so the label reflects that.
  const label = isPinned ? 'Unpin from the page' : 'Pin to the page';

  return (
    <HoverableButton
      ariaLabel={label}
      className={'PinButton' + (isPinned ? ' pinned' : '') + (className ? ' ' + className : '')}
      hoverContent={label}
      onClick={onTogglePin}
    >
      <PinIcon className="PinButton-iconPin" size="1em" />
      <PinOffIcon className="PinButton-iconUnpin" size="1em" />
    </HoverableButton>
  );
};

export default PinButton;

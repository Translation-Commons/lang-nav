import { PinIcon, PinOffIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

interface Props {
  isPinned: boolean;
  onTogglePin: () => void;
}

const CardPinButton: React.FC<Props> = ({ isPinned, onTogglePin }) => {
  // The action on a pinned card is always to unpin it, so the label reflects that.
  const label = isPinned ? 'Unpin from the page' : 'Pin to the page';

  return (
    <HoverableButton
      ariaLabel={label}
      className={'CardPinButton' + (isPinned ? ' pinned' : '')}
      hoverContent={label}
      onClick={onTogglePin}
    >
      <PinIcon className="CardPinButton-iconPin" size="1em" />
      <PinOffIcon className="CardPinButton-iconUnpin" size="1em" />
    </HoverableButton>
  );
};

export default CardPinButton;

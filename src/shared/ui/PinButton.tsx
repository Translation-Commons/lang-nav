import { PinIcon, PinOffIcon } from 'lucide-react';
import React from 'react';

import { Toggle } from './toggle';

interface Props {
  className?: string;
  isPinned: boolean;
  onTogglePin: () => void;
}

const PinButton: React.FC<Props> = ({ className, isPinned, onTogglePin }) => {
  // The action on a pinned item is always to unpin it, so the label reflects that.
  const label = isPinned ? 'Unpin from the page' : 'Pin to the page';

  return (
    <Toggle
      className={
        'PinButton cursor-pointer px-0 ' +
        (isPinned ? ' pinned' : '') +
        (className ? ' ' + className : '')
      }
      aria-label={label}
      variant="default"
      pressed={isPinned}
      onPressedChange={onTogglePin}
    >
      {/* 2 Icons are specified but only 1 is visible at a time. If the toggle button is pressed + the user is hovering over the toggle button then we switch to the PinOff icon being visible */}
      <PinIcon className="group-hover/toggle:fill-foreground  group-aria-pressed/toggle:fill-foreground group-aria-pressed/toggle:group-hover/toggle:hidden" />
      <PinOffIcon className="fill-foreground hidden group-aria-pressed/toggle:group-hover/toggle:inline-block" />
    </Toggle>
  );
};

export default PinButton;

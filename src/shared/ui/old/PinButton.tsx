import { PinIcon, PinOffIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';

interface Props {
  className?: string;
  isPinned: boolean;
  onTogglePin: () => void;
}

const PinButton: React.FC<Props> = ({ className, isPinned, onTogglePin }) => {
  // The action on a pinned item is always to unpin it, so the label reflects that.
  const label = isPinned ? 'Unpin from the page' : 'Pin to the page';

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            aria-pressed={isPinned}
            className={cn('group/pin text-muted-foreground hover:text-primary', className)}
            onClick={onTogglePin}
          />
        }
      >
        {isPinned ? (
          <>
            <PinIcon className="group-hover/pin:hidden" />
            <PinOffIcon className="hidden group-hover/pin:block" />
          </>
        ) : (
          <PinIcon />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export default PinButton;

import { XIcon } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@shared/ui/popover';

type Props = {
  // CTA
  buttonLabel: ReactNode;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  description?: ReactNode;

  // Card content
  title: ReactNode;
  body: ReactNode | (() => ReactNode);
  ctas?: ReactNode[];
};

// Only these reasons close the popup; interactions inside it (typing, selecting a
// sort key, clicking links) must not dismiss it.
const EXPLICIT_DISMISSALS = new Set<string>(['escape-key', 'outside-press', 'trigger-press']);

/**
 * Opens a card that displays on the page and does not close when the user moves their mouse.
 * Used for displaying more complex information that the user may want to interact with, such
 * as a list of view options.
 */
const PopupCard: React.FC<Props> = ({
  buttonLabel,
  buttonClassName,
  buttonStyle,
  description,
  title,
  body,
  ctas = [],
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        if (nextOpen) {
          setOpen(true);
        } else if (EXPLICIT_DISMISSALS.has(eventDetails.reason)) {
          setOpen(false);
        }
      }}
    >
      <PopoverTrigger
        className={buttonClassName}
        style={buttonStyle}
        title={typeof description === 'string' ? description : undefined}
      >
        {buttonLabel}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[min(90vw,32rem)]">
        <div className="flex items-center justify-between gap-2">
          <PopoverTitle className="text-base font-medium">{title}</PopoverTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <XIcon />
          </Button>
        </div>
        <div>{typeof body === 'function' ? body() : body}</div>
        {ctas.length > 0 && <div className="flex justify-end gap-2">{ctas}</div>}
      </PopoverContent>
    </Popover>
  );
};

export default PopupCard;

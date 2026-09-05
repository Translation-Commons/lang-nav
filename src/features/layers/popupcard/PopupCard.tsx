import React, { ReactNode } from 'react';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

type Props = {
  // CTA
  buttonLabel: ReactNode;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;

  // Card content
  body: ReactNode | (() => ReactNode);
};

/**
 * Temporary class during shadcn migration
 */
const PopupCard: React.FC<Props> = ({ buttonLabel, buttonClassName, buttonStyle, body }) => {
  return (
    <Popover>
      <PopoverTrigger delay={10}>
        <Button className={buttonClassName} style={buttonStyle} variant="default">
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit text-sm">
        {typeof body === 'function' ? body() : body}
      </PopoverContent>
    </Popover>
  );
};

export default PopupCard;

import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import React from 'react';

import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

type Props = {
  isSupported: boolean;
  description?: string;
};

const IsSupportedIcon: React.FC<Props> = ({ isSupported, description }) => {
  if (!description) {
    return isSupported ? (
      <CheckCircle2Icon className="size-8 p-2 text-(--color-green)" />
    ) : (
      <XCircleIcon className="size-8 p-2 text-(--color-red)" />
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger delay={10} closeDelay={100}>
        <Button variant="ghost" size="icon-lg" className="p-0 cursor-help">
          {isSupported ? (
            <CheckCircle2Icon style={{ color: 'var(--color-green)' }} />
          ) : (
            <XCircleIcon style={{ color: 'var(--color-red)' }} />
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit">{description}</HoverCardContent>
    </HoverCard>
  );
};

export default IsSupportedIcon;

import { LucideIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type Props = {
  description: string;
  Icon: LucideIcon;
  onClick?: () => void;
};

/**
 * Provides an icon that is correctly centered in a button
 */
const HoverableIcon: React.FC<Props> = ({ Icon, onClick, description }) => {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={10}
        closeDelay={100}
        render={
          <Button aria-label={description} className="p-2" onClick={onClick} variant="secondary">
            <Icon />
          </Button>
        }
      />
      <HoverCardContent className="flex w-fit flex-col gap-0.5">{description}</HoverCardContent>
    </HoverCard>
  );
};

export default HoverableIcon;

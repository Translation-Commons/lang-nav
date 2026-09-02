import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type Props = React.PropsWithChildren<{
  severity?: 'info' | 'warning';
}>;

const ContextIcon: React.FC<Props> = ({ children, severity = 'info' }) => {
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <Button variant="ghost" size="sm" className="px-1 cursor-help border-none!">
            {severity === 'warning' && <TriangleAlertIcon />}
            {severity === 'info' && <InfoIcon />}
          </Button>
        }
      />
      <HoverCardContent>{children}</HoverCardContent>
    </HoverCard>
  );
};

export default ContextIcon;

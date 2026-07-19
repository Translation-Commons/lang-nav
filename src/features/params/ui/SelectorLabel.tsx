import { InfoIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type Props = {
  label?: ReactNode;
  description?: ReactNode;
};

const SelectorLabel: React.FC<Props> = ({ label, description }) => {
  if (label == null) return null;
  return (
    <span className="flex items-center gap-1 py-1 text-sm font-bold whitespace-nowrap">
      <span>{label}</span>
      {description && (
        <HoverCard>
          <HoverCardTrigger
            render={
              <span className="inline-flex cursor-help text-muted-foreground">
                <InfoIcon size="1em" />
              </span>
            }
          />
          <HoverCardContent className="w-80">{description}</HoverCardContent>
        </HoverCard>
      )}
    </span>
  );
};

export default SelectorLabel;

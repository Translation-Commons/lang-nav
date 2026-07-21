import React from 'react';

import { cn } from '@shared/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type HoverableProps = {
  children: React.ReactNode;
  className?: string;
  hoverContent?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
};

const Hoverable: React.FC<HoverableProps> = ({
  children,
  className,
  hoverContent,
  onClick,
  style,
}) => {
  if (hoverContent == null) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <span
            data-testid="hoverable"
            aria-label={typeof hoverContent === 'string' ? hoverContent : undefined}
            className={cn(
              onClick ? 'inline-block cursor-pointer' : 'inline-block cursor-help',
              className,
            )}
            style={style}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          />
        }
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-auto max-w-96">{hoverContent}</HoverCardContent>
    </HoverCard>
  );
};

export default Hoverable;

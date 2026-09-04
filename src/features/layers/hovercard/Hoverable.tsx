import React from 'react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type HoverableProps = {
  children: React.ReactNode;
  hoverContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const Hoverable: React.FC<HoverableProps> = ({
  children,
  hoverContent,
  onClick,
  className,
  style,
}) => {
  if (hoverContent == null) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        onClick={onClick}
        className={'hoverableText ' + (className ?? '')}
        style={{
          cursor: onClick ? 'pointer' : 'help',
          ...style,
        }}
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-fit max-w-[400px]">{hoverContent}</HoverCardContent>
    </HoverCard>
  );
};

export default Hoverable;

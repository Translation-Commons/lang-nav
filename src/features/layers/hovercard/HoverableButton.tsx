import React from 'react';

import { cn } from '@shared/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type HoverableProps = {
  ariaLabel?: string;
  buttonType?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hoverContent?: React.ReactNode;
  onClick?: () => void;
  role?: string;
  style?: React.CSSProperties;
};

const HoverableButton: React.FC<HoverableProps> = ({
  ariaLabel,
  buttonType = 'button',
  children,
  className,
  disabled,
  hoverContent,
  onClick,
  role,
  style,
}) => {
  const button = (
    <button
      aria-label={ariaLabel}
      className={cn(onClick ? 'cursor-pointer' : 'cursor-auto', className)}
      disabled={disabled}
      onClick={onClick}
      role={role}
      style={style}
      type={buttonType}
    >
      {children}
    </button>
  );

  if (hoverContent == null) {
    return button;
  }

  return (
    <HoverCard>
      <HoverCardTrigger render={button} />
      <HoverCardContent className="w-auto max-w-96">{hoverContent}</HoverCardContent>
    </HoverCard>
  );
};

export default HoverableButton;

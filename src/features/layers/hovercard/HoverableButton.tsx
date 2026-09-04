import React from 'react';

import { Button } from '@shared/ui/button';
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
  if (hoverContent == null) {
    return (
      <Button
        aria-label={ariaLabel}
        variant="secondary"
        className={className}
        disabled={disabled}
        onClick={onClick}
        role={role}
        style={{ cursor: onClick ? 'pointer' : 'auto', ...style }}
        type={buttonType}
      >
        {children}
      </Button>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Button
          variant="secondary"
          aria-label={ariaLabel}
          className={className}
          disabled={disabled}
          onClick={onClick}
          role={role}
          style={{ cursor: onClick ? 'pointer' : 'auto', ...style }}
          type={buttonType}
        >
          {children}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit max-w-[400px]">{hoverContent}</HoverCardContent>
    </HoverCard>
  );
};

export default HoverableButton;

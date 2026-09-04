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
  variant: 'secondary' | 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
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
  variant = 'secondary',
}) => {
  if (hoverContent == null) {
    return (
      <Button
        aria-label={ariaLabel}
        variant={variant}
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
          variant={variant}
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

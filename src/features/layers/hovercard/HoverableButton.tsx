import React from 'react';

import useHoverCard from './useHoverCard';

type HoverableProps = {
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
  buttonType = 'button',
  children,
  className,
  disabled,
  hoverContent,
  onClick,
  role,
  style,
}) => {
  const { showHoverCard, hideHoverCard } = useHoverCard();

  if (hoverContent == null) {
    return (
      <button
        className={className}
        disabled={disabled}
        onClick={onClick}
        role={role}
        style={{
          cursor: onClick ? 'pointer' : 'auto',
          ...style,
        }}
        type={buttonType}
      >
        {children}
      </button>
    );
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    showHoverCard(hoverContent, e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    showHoverCard(hoverContent, e.clientX, e.clientY);
  };

  return (
    <button
      className={className}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={hideHoverCard}
      onClick={() => {
        hideHoverCard();
        if (onClick != null) {
          onClick();
        }
      }}
      style={{
        cursor: onClick ? 'pointer' : 'auto',
        ...style,
      }}
      type={buttonType}
    >
      {children}
    </button>
  );
};

export default HoverableButton;

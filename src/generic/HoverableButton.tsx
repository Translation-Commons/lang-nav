import React from 'react';

import { useHoverCard } from './HoverCardContext';

type HoverableProps = {
  children: React.ReactNode;
  className?: string;
  hoverContent?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
};

const HoverableButton: React.FC<HoverableProps> = ({
  children,
  className,
  hoverContent,
  onClick,
  style,
}) => {
  const { showHoverCard, hideHoverCard } = useHoverCard();

  if (hoverContent == null) {
    return (
      <button
        className={className}
        onClick={onClick}
        style={{
          cursor: onClick ? 'pointer' : 'auto',
          ...style,
        }}
        type="button"
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
    >
      {children}
    </button>
  );
};

export default HoverableButton;

import React from 'react';

import useHoverCard from './useHoverCard';

type HoverableProps = {
  children: React.ReactNode;
  hoverContent?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
};

const Hoverable: React.FC<HoverableProps> = ({ children, hoverContent, onClick, style }) => {
  const { showHoverCard, hideHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();

  if (hoverContent == null) {
    return <>{children}</>;
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    showHoverCard(hoverContent, e.clientX, e.clientY);
  };

  return (
    <span
      data-testid="hoverable"
      aria-label={typeof hoverContent === 'string' ? hoverContent : undefined} // For screen readers
      className="hoverableText"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeaveTriggeringElement}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent click handlers
        hideHoverCard();
        if (onClick != null) onClick();
      }}
      style={{
        display: 'inline-block',
        cursor: onClick ? 'pointer' : 'help',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Hoverable;

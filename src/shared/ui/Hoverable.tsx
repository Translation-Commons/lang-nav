import React from 'react';

import { useHoverCard } from '@widgets/HoverCardContext';

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
      className="hoverableText"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeaveTriggeringElement}
      onClick={() => {
        hideHoverCard();
        if (onClick != null) onClick();
      }}
      style={{ display: 'inline-block', cursor: onClick ? 'pointer' : 'help', ...style }}
    >
      {children}
    </span>
  );
};

export default Hoverable;

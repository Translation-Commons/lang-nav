import React from 'react';

import './hoverable.css';

type HoverableProps = {
  children: React.ReactNode;
  className: string;
  hoverContent?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
};

const NewHoverable: React.FC<HoverableProps> = ({
  children,
  className,
  hoverContent,
  onClick,
  style,
}) => {
  if (hoverContent == null) {
    return (
      <span
        className={className}
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent click handlers
          if (onClick != null) onClick();
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      data-testid="hoverable"
      aria-label={typeof hoverContent === 'string' ? hoverContent : undefined} // For screen readers
      className={'NewHoverable' + (className ? ` ${className}` : '')}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent click handlers
        if (onClick != null) onClick();
      }}
      style={{
        cursor: onClick ? 'pointer' : 'help',
        ...style,
      }}
    >
      {children}
      <aside className="NewHovercard" role="tooltip">
        {hoverContent}
      </aside>
    </span>
  );
};

export default NewHoverable;

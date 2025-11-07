import React from 'react';

interface Props {
  children: React.ReactNode;
  style: React.CSSProperties;
}

const ViewCard: React.FC<Props> = ({ children, style }) => {
  return (
    <div
      style={{
        borderWidth: '1px',
        borderRadius: '0.5em',
        boxShadow: 'var(--color-shadow) 0 0 1rem 5px',
        padding: '1rem',
        textAlign: 'start',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ViewCard;

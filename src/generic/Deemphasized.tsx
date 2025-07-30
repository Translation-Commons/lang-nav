import React from 'react';

const Deemphasized: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <span
      style={{ fontStyle: 'italic', fontWeight: 'lighter', color: 'var(--color-text-secondary)' }}
    >
      {children}
    </span>
  );
};

export default Deemphasized;

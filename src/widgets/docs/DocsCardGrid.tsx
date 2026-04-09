import React, { PropsWithChildren } from 'react';

export const DocsCardGrid: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '-0.5em 0',
      }}
    >
      {children}
    </div>
  );
};

export default DocsCardGrid;

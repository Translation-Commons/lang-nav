import React from 'react';

/**
 * Designed for full cards
 */
const ResponsiveGrid: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="@container">
      <div className="grid gap-6 grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveGrid;

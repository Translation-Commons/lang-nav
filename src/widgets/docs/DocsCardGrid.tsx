import React, { PropsWithChildren } from 'react';

export const DocsCardGrid: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-0">{children}</div>
  );
};

export default DocsCardGrid;

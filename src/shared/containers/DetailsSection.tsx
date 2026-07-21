import React, { PropsWithChildren, ReactNode } from 'react';

const DetailsSection: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => {
  return (
    <div className="mb-4 flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default DetailsSection;

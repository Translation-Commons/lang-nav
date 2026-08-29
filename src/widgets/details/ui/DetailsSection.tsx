import React, { PropsWithChildren, ReactNode } from 'react';

import { reactNodeToString } from '@shared/lib/stringExportUtils';

const DetailsSection: React.FC<
  PropsWithChildren<{ title: ReactNode; viewSelector?: ReactNode }>
> = ({ children, title, viewSelector }) => {
  return (
    <div className="flex flex-col mb-4 p-4 h-full box-border border border-[--color-button-secondary] rounded-xl">
      <div
        role="heading"
        className="flex flex-row justify-between"
        aria-level={2}
        aria-label={reactNodeToString(title)}
      >
        <span className="uppercase text-xl tracking-tight">{title}</span>
        {viewSelector}
      </div>
      {children}
    </div>
  );
};

export default DetailsSection;

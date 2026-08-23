import React, { PropsWithChildren, ReactNode } from 'react';

import { reactNodeToString } from '@shared/lib/stringExportUtils';
import '../details.css';

const DetailsSection: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => {
  return (
    <div className="flex flex-col mb-4 p-4 h-full box-border border border-[--color-button-secondary] rounded-xl">
      <div
        role="heading"
        className="mb-0 uppercase text-xl tracking-tight"
        aria-level={2}
        aria-label={reactNodeToString(title)}
      >
        {title}
      </div>
      {children}
    </div>
  );
};

export default DetailsSection;

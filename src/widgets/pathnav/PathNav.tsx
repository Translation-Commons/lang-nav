import React from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';

export const PathContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={'flex items-center gap-2 flex-wrap ' + className}>
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
        {children}
      </SelectorDisplayProvider>
    </div>
  );
};

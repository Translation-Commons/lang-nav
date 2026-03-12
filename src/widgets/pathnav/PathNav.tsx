import React from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';

export const PathContainer: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap', ...style }}
    >
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
        {children}
      </SelectorDisplayProvider>
    </div>
  );
};

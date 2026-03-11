import React from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import FilterPath from '@features/transforms/filtering/FilterPath';

const PathNav: React.FC = () => {
  return (
    <PathContainer>
      <FilterPath />
    </PathContainer>
  );
};

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

export default PathNav;

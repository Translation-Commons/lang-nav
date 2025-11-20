import React from 'react';

import HoverCardContext from './HoverCardContext';

const EmptyHoverCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <HoverCardContext.Provider
      value={{
        showHoverCard: () => null,
        hideHoverCard: () => null,
        onMouseLeaveTriggeringElement: () => null,
      }}
    >
      {children}
    </HoverCardContext.Provider>
  );
};

export default EmptyHoverCardProvider;

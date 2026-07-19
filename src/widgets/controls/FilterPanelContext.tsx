import React, { createContext } from 'react';

export type FilterPanelContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // True at the lg breakpoint and up, where panels render inline instead of as drawers.
  isDesktop: boolean;
};

export const FilterPanelContext = createContext<FilterPanelContextType | null>(null);

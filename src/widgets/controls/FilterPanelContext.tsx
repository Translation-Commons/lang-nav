import React, { createContext } from 'react';

export type FilterPanelContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const FilterPanelContext = createContext<FilterPanelContextType | null>(null);

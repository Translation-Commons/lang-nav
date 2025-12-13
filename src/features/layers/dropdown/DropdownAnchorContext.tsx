import React from 'react';

export type DropdownAnchorRef = React.MutableRefObject<HTMLElement | null>;

export const DropdownAnchorContext = React.createContext<DropdownAnchorRef | null>(null);

export const useDropdownAnchor = () => {
  const context = React.useContext(DropdownAnchorContext);
  if (context === null) {
    throw new Error('Dropdown components must be used within a <DropdownAnchor>.');
  }
  return context;
};

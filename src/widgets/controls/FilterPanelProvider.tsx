import React, { useEffect, useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import { useMediaQuery } from '@shared/hooks/useMediaQuery';

import { FilterPanelContext } from './FilterPanelContext';

// Single source of truth for the panel breakpoint: `lg` (64rem) and up renders inline
// panels, below that renders drawers. Both filter and details panels read `isDesktop`.
const DESKTOP_QUERY = '(min-width: 64rem)';

const FilterPanelProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isOpen, setIsOpen] = useState(isDesktop);
  const { objectID } = usePageParams();

  // Default the filter panel open on desktop (room for it inline) and closed on smaller
  // screens (where it overlays as a drawer). Re-sync when crossing the breakpoint.
  useEffect(() => {
    setIsOpen(isDesktop);
  }, [isDesktop]);

  // On smaller screens the filter drawer and the details drawer would overlap, so opening
  // details closes the filters. On desktop both fit side by side, so leave filters alone.
  useEffect(() => {
    if (objectID && !isDesktop) setIsOpen(false);
  }, [objectID, isDesktop]);

  return (
    <FilterPanelContext.Provider value={{ isOpen, setIsOpen, isDesktop }}>
      {children}
    </FilterPanelContext.Provider>
  );
};

export default FilterPanelProvider;

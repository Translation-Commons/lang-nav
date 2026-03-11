import React, { useEffect, useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import { FilterPanelContext } from './FilterPanelContext';

const FilterPanelProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { objectID } = usePageParams();

  useEffect(() => {
    if (objectID) setIsOpen(false);
  }, [objectID]);

  return (
    <FilterPanelContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </FilterPanelContext.Provider>
  );
};

export default FilterPanelProvider;

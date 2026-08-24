import React, { useEffect, useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import { FilterPanelContext } from './FilterPanelContext';

const FilterPanelProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { entID } = usePageParams();

  useEffect(() => {
    if (entID) setIsOpen(false);
  }, [entID]);

  return (
    <FilterPanelContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </FilterPanelContext.Provider>
  );
};

export default FilterPanelProvider;

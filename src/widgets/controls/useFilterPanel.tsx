import { useContext } from 'react';

import { FilterPanelContext, FilterPanelContextType } from './FilterPanelContext';

const useFilterPanel = (): FilterPanelContextType => {
  const ctx = useContext(FilterPanelContext);
  if (!ctx) throw new Error('useFilterPanel must be used within FilterPanelProvider');
  return ctx;
};

export default useFilterPanel;

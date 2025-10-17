import { useContext } from 'react';

import { PageParamsContext } from './PageParamsContext';

export const usePageParams = () => {
  const context = useContext(PageParamsContext);
  if (!context) {
    throw new Error('usePageParams must be used within a PageParamsProvider');
  }
  return context;
};

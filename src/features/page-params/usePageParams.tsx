import { useContext } from 'react';

import { PageParamsContext } from './PageParamsContext';

const usePageParams = () => {
  const context = useContext(PageParamsContext);
  if (!context) {
    throw new Error('usePageParams must be used within a PageParamsProvider');
  }
  return context;
};

export default usePageParams;

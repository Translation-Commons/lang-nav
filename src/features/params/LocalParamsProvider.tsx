import React, { useCallback, useMemo, useState } from 'react';

import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';

import { PageParamsContext, PageParamsContextState } from './PageParamsContext';
import { PageParamsOptional } from './PageParamTypes';
import usePageParams from './usePageParams';

/**
 * Creates a provider of params that inherits from the global params but can differ
 */
const LocalParamsProvider: React.FC<{
  children: React.ReactNode;
  overrides?: PageParamsOptional;
}> = ({ children, overrides }) => {
  const globalParams = usePageParams();
  const [localParams, setLocalParams] = useState<PageParamsOptional>({});

  const updatePageParams = useCallback(
    (newParams: PageParamsOptional) => setLocalParams((prev) => ({ ...prev, newParams })),
    [setLocalParams],
  );

  const providerValue: PageParamsContextState = useMemo(() => {
    console.log(overrides, localParams);
    return {
      ...globalParams,
      ...overrides,
      ...localParams,
      updatePageParams,
    };
  }, [globalParams, updatePageParams, localParams, overrides]);

  return (
    <PageParamsContext.Provider value={providerValue}>
      <HoverCardProvider>{children}</HoverCardProvider>
    </PageParamsContext.Provider>
  );
};

export default LocalParamsProvider;

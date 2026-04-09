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

  // Instead of mutating the global page's parameters, have mutations in this context just override a local layer
  const updateLocalParams = useCallback(
    (newParams: PageParamsOptional) => {
      setLocalParams((prev) => ({ ...prev, ...newParams }));
      if (newParams.objectID) {
        // Keep the global objectID in sync so that object name links can update the details panel
        globalParams.updatePageParams({ objectID: newParams.objectID });
      }
    },
    [setLocalParams],
  );

  const providerValue: PageParamsContextState = useMemo(() => {
    return {
      ...globalParams,
      ...overrides,
      ...localParams,
      updatePageParams: updateLocalParams,
    };
  }, [globalParams, updateLocalParams, localParams, overrides]);

  return (
    <PageParamsContext.Provider value={providerValue}>
      {/* Need to provide a new hovercard that will use the local params */}
      <HoverCardProvider>{children}</HoverCardProvider>
    </PageParamsContext.Provider>
  );
};

export default LocalParamsProvider;

import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { getParamsFromURL } from './getParamsFromURL';
import { PageParamsContext, PageParamsContextState } from './PageParamsContext';
import { PageParamsOptional } from './PageParamTypes';
import { getDefaultParams } from './Profiles';

const PageParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [urlPageParams, setURLPageParams] = useSearchParams({});

  const updatePageParams = useCallback(
    (newParams: PageParamsOptional) => {
      setURLPageParams((prev) => getNewURLSearchParams(newParams, prev));
    },
    [setURLPageParams],
  );

  const providerValue: PageParamsContextState = useMemo(() => {
    const instantiatedParams = getParamsFromURL(urlPageParams);

    const defaults = getDefaultParams(
      instantiatedParams.objectType,
      instantiatedParams.view,
      instantiatedParams.profile,
    );

    Object.keys(instantiatedParams).forEach((key) => {
      const typedKey = key as keyof PageParamsOptional;
      if (instantiatedParams[typedKey] == null) delete instantiatedParams[typedKey];
    });
    return {
      ...defaults,
      ...instantiatedParams,
      updatePageParams,
    };
  }, [urlPageParams, updatePageParams]);

  return <PageParamsContext.Provider value={providerValue}>{children}</PageParamsContext.Provider>;
};

export default PageParamsProvider;

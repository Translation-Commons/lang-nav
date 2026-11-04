import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { getParamsFromURL } from './getParamsFromURL';
import useLocalStorageParams from './LocalStorageParams';
import { PageParamsContext, type PageParamsContextState } from './PageParamsContext';
import type { PageParams } from './PageParamTypes';
import { getDefaultParams } from './Profiles';
import { useStableParamArrays } from './StableParamArrays';

/** Provides persistent parameters that are saved to the URL */
const PageParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [urlPageParams, setURLPageParams] = useSearchParams({});
  const localStorageParams = useLocalStorageParams();
  const getNextParamArrays = useStableParamArrays();

  const updatePageParams = useCallback(
    (newParams: Partial<PageParams>) => {
      setURLPageParams((prev) => getNewURLSearchParams(newParams, prev));
    },
    [setURLPageParams],
  );

  const providerValue: PageParamsContextState = useMemo(() => {
    const instantiatedParams = getParamsFromURL(urlPageParams);

    const defaults = getDefaultParams(
      instantiatedParams.entType,
      instantiatedParams.view,
      instantiatedParams.profile,
      instantiatedParams.populationFocus,
      instantiatedParams.colorBy,
    );

    Object.keys(instantiatedParams).forEach((key) => {
      const typedKey = key as keyof PageParams;
      if (instantiatedParams[typedKey] == null) delete instantiatedParams[typedKey];
    });
    const paramArrays = getNextParamArrays(instantiatedParams, defaults);

    return {
      ...defaults,
      ...instantiatedParams,
      ...paramArrays,
      ...localStorageParams,
      updatePageParams,
      paramsLevel: 'global',
    };
  }, [urlPageParams, updatePageParams, localStorageParams]);

  return <PageParamsContext.Provider value={providerValue}>{children}</PageParamsContext.Provider>;
};

export default PageParamsProvider;

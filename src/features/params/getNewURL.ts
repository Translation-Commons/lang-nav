import { useSearchParams } from 'react-router-dom';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { PageParamsOptional } from './PageParamTypes';

/**
 * Gets a fresh URL -- good for anchor links where you want to clear out existing parameters
 * and to enable people to use extra interactions (like open in new window, copy link URL, etc).
 */
export function getNewURL(params: PageParamsOptional): string {
  return `?${getNewURLSearchParams(params).toString()}`;
}

/**
 * Gets a URL that includes the current search params
 */
export function getUpdateURL(params: PageParamsOptional): string {
  const [urlPageParams] = useSearchParams({});
  return `?${getNewURLSearchParams(params, urlPageParams).toString()}`;
}

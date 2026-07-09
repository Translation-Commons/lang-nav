import { getNewURLSearchParams } from './getNewURLSearchParams';
import type { PageParams } from './PageParamTypes';

/**
 * Gets a fresh URL -- good for anchor links where you want to clear out existing parameters
 * and to enable people to use extra interactions (like open in new window, copy link URL, etc).
 */
export function getNewURL(params: Partial<PageParams>): string {
  return `?${getNewURLSearchParams(params).toString()}`;
}

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import type { PageParams } from './PageParamTypes';

export function getDataPageURL(params: Partial<PageParams>): string {
  const query = getNewURLSearchParams(params).toString();
  return '/' + LangNavPageName.Data + (query ? '?' + query : '');
}

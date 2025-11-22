import { createContext } from 'react';

import { PageParams, PageParamsOptional } from './PageParamTypes';

export type PageParamsContextState = PageParams & {
  updatePageParams: (newParams: PageParamsOptional) => void;
};

export const PageParamsContext = createContext<PageParamsContextState | undefined>(undefined);

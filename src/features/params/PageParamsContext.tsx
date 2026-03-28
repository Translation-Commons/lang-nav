import { createContext } from 'react';

import { PageBrightnessParams } from '@shared/hooks/usePageBrightness';

import { PageParams, PageParamsOptional } from './PageParamTypes';

export type PageParamsContextState = PageParams & {
  brightness: PageBrightnessParams;
  updatePageParams: (newParams: PageParamsOptional) => void;
};

export const PageParamsContext = createContext<PageParamsContextState | undefined>(undefined);

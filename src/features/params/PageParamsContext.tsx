import { createContext } from 'react';
import type { StoreApi } from 'zustand/vanilla';

import { PageBrightnessParams } from '@shared/hooks/usePageBrightness';

import { PageParams } from './PageParamTypes';

export type PageParamsContextState = PageParams & {
  brightness: PageBrightnessParams;
  updatePageParams: (newParams: Partial<PageParams>) => void;
  paramsLevel: 'local' | 'global';
};

export const PageParamsContext = createContext<StoreApi<PageParamsContextState> | undefined>(
  undefined,
);

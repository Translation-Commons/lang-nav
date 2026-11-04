import { createContext } from 'react';

import type { LocalStorageParams } from './LocalStorageParams';
import type { PageParams } from './PageParamTypes';

export type PageParamsContextState = PageParams &
  LocalStorageParams & {
    updatePageParams: (newParams: Partial<PageParams>) => void;
    paramsLevel: 'local' | 'global';
  };

export const PageParamsContext = createContext<PageParamsContextState | undefined>(undefined);

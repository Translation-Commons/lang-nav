import { useContext, useDeferredValue } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { PageParamsContext, PageParamsContextState } from './PageParamsContext';

type ParamKey = keyof PageParamsContextState;

/**
 * Reads the page params. Pass the keys a component uses, e.g. `usePageParams('entType', 'view')`,
 * so it only re-renders when one of those changes. With no keys it re-renders on any change.
 */
function usePageParams(): PageParamsContextState;
function usePageParams<K extends ParamKey>(...keys: K[]): Pick<PageParamsContextState, K>;
function usePageParams(...keys: ParamKey[]) {
  const store = useContext(PageParamsContext);
  if (!store) {
    throw new Error('usePageParams must be used within a PageParamsProvider');
  }
  const params = useStore(
    store,
    useShallow((state) => (keys.length === 0 ? state : pick(state, keys))),
  );
  // Store updates render synchronously; deferring keeps the param-change re-render interruptible.
  return useDeferredValue(params);
}

function pick(state: PageParamsContextState, keys: ParamKey[]): Partial<PageParamsContextState> {
  const picked: Record<string, unknown> = {};
  for (const key of keys) picked[key] = state[key];
  return picked;
}

export default usePageParams;

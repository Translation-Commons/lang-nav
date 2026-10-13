import React, { useLayoutEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { createStore } from 'zustand/vanilla';

import { PageParamsContext, PageParamsContextState } from './PageParamsContext';

export const PageParamsStoreProvider: React.FC<{
  value: PageParamsContextState;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const [store] = useState(() => createStore<PageParamsContextState>(() => value));

  useLayoutEffect(() => {
    store.setState((prev) => keepUnchangedValues(prev, value), true);
  }, [store, value]);

  return <PageParamsContext.Provider value={store}>{children}</PageParamsContext.Provider>;
};

/** Reuses the previous reference for every value that did not change, so selectors stay quiet. */
function keepUnchangedValues(
  prev: PageParamsContextState,
  next: PageParamsContextState,
): PageParamsContextState {
  let changed = Object.keys(prev).length !== Object.keys(next).length;
  const merged = { ...next } as Record<string, unknown>;
  for (const key of Object.keys(next) as (keyof PageParamsContextState)[]) {
    if (shallow(prev[key], next[key])) merged[key] = prev[key];
    else changed = true;
  }
  return changed ? (merged as PageParamsContextState) : prev;
}

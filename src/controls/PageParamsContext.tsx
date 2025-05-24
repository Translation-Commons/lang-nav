import React, { createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { LanguageSchema } from '../types/LanguageTypes';
import {
  ObjectType,
  PageParamKey,
  PageParams,
  PageParamsOptional,
  SearchableField,
  SortBy,
  View,
} from '../types/PageParamTypes';
import { ScopeLevel } from '../types/ScopeLevel';

type PageParamsContextState = PageParams & {
  updatePageParams: (newParams: PageParamsOptional) => void;
};

const PageParamsContext = createContext<PageParamsContextState | undefined>(undefined);
const DEFAULT_OBJECT_TYPE = ObjectType.Language;
const DEFAULT_VIEW = View.CardList;
const PARAMS_THAT_CLEAR: PageParamKey[] = ['limit', 'page', 'searchString', 'searchBy'];

export const PageParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageParams, setPageParams] = useSearchParams({});

  const getParam = (key: string, fallback: string = '') => pageParams.get(key) ?? fallback;

  const updatePageParams = (newParams: PageParamsOptional) => {
    setPageParams((prev) => getNewURLSearchParams(newParams, prev));
  };

  const providerValue: PageParamsContextState = useMemo(() => {
    const objectType = getParam('objectType', DEFAULT_OBJECT_TYPE) as ObjectType;
    const view = getParam('view', DEFAULT_VIEW) as View;
    const defaults = getDefaultParams(objectType, view);
    return {
      languageSchema: getParam('languageSchema', defaults.languageSchema) as LanguageSchema,
      limit: parseInt(getParam('limit', defaults.limit.toString())),
      localeSeparator: getParam('localeSeparator', '') === '-' ? '-' : '_',
      objectID: getParam('objectID', undefined),
      objectType,
      page: parseInt(getParam('page', defaults.page.toString())),
      scopes: getParam('scopes', defaults.scopes.join(','))
        .split(',')
        .map((s) => s as ScopeLevel)
        .filter(Boolean),
      searchBy: getParam('searchBy', defaults.searchBy) as SearchableField,
      searchString: getParam('searchString', defaults.searchString),
      sortBy: getParam('sortBy', defaults.sortBy) as SortBy,
      view,
      updatePageParams,
    };
  }, [pageParams]);

  return <PageParamsContext.Provider value={providerValue}>{children}</PageParamsContext.Provider>;
};

// If there is nothing in the URL string, then use this instead
function getDefaultParams(objectType: ObjectType, view: View): PageParams {
  return {
    languageSchema: LanguageSchema.Inclusive,
    limit: view === View.Table ? 200 : 8,
    localeSeparator: '_',
    objectID: undefined,
    objectType,
    page: 1,
    scopes:
      view === View.Hierarchy && objectType !== ObjectType.Locale
        ? [ScopeLevel.Groups, ScopeLevel.Individuals]
        : [ScopeLevel.Individuals],
    searchBy: SearchableField.AllNames,
    searchString: '',
    sortBy: SortBy.Population,
    view,
  };
}

/**
 * Gets a fresh URL -- good for anchor links where you want to clear out existing parameters
 * and to enable people to use extra interactions (like open in new window, copy link URL, etc).
 */
export function getNewURL(params: PageParamsOptional): string {
  return `?${getNewURLSearchParams(params).toString()}`;
}

function getNewURLSearchParams(
  newParams: PageParamsOptional,
  prev?: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(prev);
  Object.entries(newParams).forEach(([key, value]) => {
    if (['limit', 'page'].includes(key)) {
      // Handle as number
      const valueAsNumber = parseInt(value as string);
      if (isNaN(valueAsNumber) || valueAsNumber < 1) {
        next.set(key, '0');
      } else {
        next.set(key, valueAsNumber.toString());
      }
    } else if (Array.isArray(value)) {
      // Handle as array
      if (value.length === 0) {
        next.delete(key);
      } else {
        next.set(key, value.join(','));
      }
    } else if (value == null || value == '') {
      // Handle as string
      next.delete(key);
    } else {
      next.set(key, value.toString());
    }
  });
  // Clear the some parameters if they match the default
  const defaults = getDefaultParams(
    (next.get('objectType') as ObjectType) ?? DEFAULT_OBJECT_TYPE,
    (next.get('view') as View) ?? DEFAULT_VIEW,
  );
  PARAMS_THAT_CLEAR.forEach((param: PageParamKey) => {
    if (next.get(param) == defaults[param]?.toString()) {
      next.delete(param);
    }
  });
  return next;
}

export const usePageParams = () => {
  const context = useContext(PageParamsContext);
  if (!context) {
    throw new Error('usePageParams must be used within a PageParamsProvider');
  }
  return context;
};

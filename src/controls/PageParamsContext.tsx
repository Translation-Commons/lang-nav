import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { TerritoryScope } from '../types/DataTypes';
import { LanguageSource, LanguageScope } from '../types/LanguageTypes';
import {
  ObjectType,
  PageParamKey,
  PageParams,
  PageParamsOptional,
  SearchableField,
  SortBy,
  View,
} from '../types/PageParamTypes';

type PageParamsContextState = PageParams & {
  updatePageParams: (newParams: PageParamsOptional) => void;
};

const PageParamsContext = createContext<PageParamsContextState | undefined>(undefined);
const DEFAULT_OBJECT_TYPE = ObjectType.Language;
const DEFAULT_VIEW = View.CardList;
const PARAMS_THAT_CLEAR: PageParamKey[] = ['limit', 'page', 'searchString', 'searchBy'];

const PageParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageParams, setPageParams] = useSearchParams({});

  const getParam = (key: PageParamKey, fallback: string = '') => pageParams.get(key) ?? fallback;

  const updatePageParams = useCallback(
    (newParams: PageParamsOptional) => {
      setPageParams((prev) => getNewURLSearchParams(newParams, prev));
    },
    [setPageParams],
  );

  const providerValue: PageParamsContextState = useMemo(() => {
    const objectType = getParam('objectType', DEFAULT_OBJECT_TYPE) as ObjectType;
    const view = getParam('view', DEFAULT_VIEW) as View;
    const defaults = getDefaultParams(objectType, view);
    return {
      languageScopes: getParam('languageScopes', defaults.languageScopes.join(','))
        .split(',')
        .map((s) => s as LanguageScope)
        .filter(Boolean),
      languageSource: getParam('languageSource', defaults.languageSource) as LanguageSource,
      limit: parseInt(getParam('limit', defaults.limit.toString())),
      localeSeparator: getParam('localeSeparator', '') === '-' ? '-' : '_',
      objectID: getParam('objectID', undefined),
      objectType,
      page: parseInt(getParam('page', defaults.page.toString())),
      searchBy: getParam('searchBy', defaults.searchBy) as SearchableField,
      searchString: getParam('searchString', defaults.searchString),
      sortBy: getParam('sortBy', defaults.sortBy) as SortBy,
      territoryFilter: getParam('territoryFilter', defaults.territoryFilter),
      territoryScopes: getParam('territoryScopes', defaults.territoryScopes.join(','))
        .split(',')
        .map((s) => s as TerritoryScope)
        .filter(Boolean),
      view,
      updatePageParams,
    };
  }, [pageParams]);

  return <PageParamsContext.Provider value={providerValue}>{children}</PageParamsContext.Provider>;
};

export default PageParamsProvider;

// If there is nothing in the URL string, then use this instead
function getDefaultParams(objectType: ObjectType, view: View): PageParams {
  const languageScopes = [LanguageScope.Macrolanguage, LanguageScope.Language];
  let territoryScopes = [TerritoryScope.Country, TerritoryScope.Dependency];
  if (view === View.Hierarchy) {
    // By default, show more kinds of objects in the hierarchy view
    if (objectType === ObjectType.Language) languageScopes.push(LanguageScope.Family);
    if (objectType === ObjectType.Territory) territoryScopes = Object.values(TerritoryScope);
  }

  return {
    languageSource: LanguageSource.All,
    languageScopes,
    limit: view === View.Table ? 200 : 8,
    localeSeparator: '_',
    objectID: undefined,
    objectType,
    page: 1,
    searchBy: SearchableField.AllNames,
    searchString: '',
    sortBy: SortBy.Population,
    territoryScopes,
    territoryFilter: '',
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

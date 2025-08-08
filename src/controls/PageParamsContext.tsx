import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { TerritoryScope } from '../types/DataTypes';
import { LanguageSource, LanguageScope } from '../types/LanguageTypes';
import {
  LocaleSeparator,
  ObjectType,
  PageParamKey,
  PageParams,
  PageParamsOptional,
  SearchableField,
  SortBy,
  View,
} from '../types/PageParamTypes';

import { getDefaultParams, ProfileType } from './Profiles';

type PageParamsContextState = PageParams & {
  updatePageParams: (newParams: PageParamsOptional) => void;
};

const PageParamsContext = createContext<PageParamsContextState | undefined>(undefined);

const PageParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [urlPageParams, setURLPageParams] = useSearchParams({});

  const updatePageParams = useCallback(
    (newParams: PageParamsOptional) => {
      setURLPageParams((prev) => getNewURLSearchParams(newParams, prev));
    },
    [setURLPageParams],
  );

  const providerValue: PageParamsContextState = useMemo(() => {
    const instantiatedParams = getParamsFromURL(urlPageParams);

    const defaults = getDefaultParams(
      instantiatedParams.objectType,
      instantiatedParams.view,
      instantiatedParams.profile,
    );

    Object.keys(instantiatedParams).forEach((key) => {
      const typedKey = key as keyof PageParamsOptional;
      if (instantiatedParams[typedKey] == null) delete instantiatedParams[typedKey];
    });
    return {
      ...defaults,
      ...instantiatedParams,
      updatePageParams,
    };
  }, [urlPageParams, updatePageParams]);

  return <PageParamsContext.Provider value={providerValue}>{children}</PageParamsContext.Provider>;
};

export default PageParamsProvider;

function getParamsFromURL(urlParams: URLSearchParams): PageParamsOptional {
  const params: PageParamsOptional = {};
  urlParams.forEach((value, keyUntyped) => {
    const key = keyUntyped as PageParamKey;
    switch (key) {
      // Numeric values
      case 'page':
        params.page = parseInt(value) || 1; // Default to 1 if parsing fails
        break;
      case 'limit':
        params.limit = parseInt(value) || 10; // Default to 10 if parsing fails
        break;

      // Arrays
      case 'languageScopes':
        if (value === '[]') params.languageScopes = [];
        else params.languageScopes = value.split(',').filter(Boolean) as LanguageScope[];
        break;
      case 'territoryScopes':
        if (value === '[]') params[key] = [];
        else params[key] = value.split(',').filter(Boolean) as TerritoryScope[];
        break;

      // Enum values
      case 'objectType':
        params.objectType = value as ObjectType;
        break;
      case 'view':
        params.view = value as View;
        break;
      case 'profile':
        params.profile = value as ProfileType;
        break;
      case 'searchBy':
        params.searchBy = value as SearchableField;
        break;
      case 'sortBy':
        params.sortBy = value as SortBy;
        break;
      case 'localeSeparator':
        params.localeSeparator = value as LocaleSeparator;
        break;
      case 'languageSource':
        params.languageSource = value as LanguageSource;
        break;
      case 'sortDirection':
        params.sortDirection = value === 'reverse' ? value : 'normal';
        break;

      // Freeform strings
      case 'objectID':
      case 'searchString':
      case 'territoryFilter':
        params[key] = value; // Default to undefined if empty
        break;
    }
  });
  return params;
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
        next.set(key, '[]'); // To differentiate empty array from an undefined array
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

  // Clear the parameters that match the default
  const defaults = getDefaultParams(
    next.get('objectType') as ObjectType,
    next.get('view') as View,
    next.get('profile') as ProfileType,
  );
  Array.from(next.entries()).forEach(([key, value]) => {
    const defaultValue = defaults[key as PageParamKey];

    // Don't remove view or profile because they change on defaults
    if (key === 'view') return;
    if (key === 'profile' && value !== ProfileType.LanguageEthusiast) return;
    if (key === 'objectType' && value !== ObjectType.Language) return;

    // If the default is the empty array you can remove it
    if (value === '[]' && Array.isArray(defaultValue) && defaultValue.length === 0) {
      next.delete(key);
      return;
    }
    if (value === defaults[key as PageParamKey]?.toString()) {
      next.delete(key);
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

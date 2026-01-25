import { stringifyColumnVisibilityBinaries } from '@features/table/useColumnVisibility';
import { ColorBy } from '@features/transforms/coloring/ColorTypes';

import { ObjectType, PageParamKey, PageParamsOptional, View } from './PageParamTypes';
import { getDefaultParams, ProfileType } from './Profiles';

/**
 * This is used to make the next version of the page parameters in the URL.
 */

function buildNextURLSearchParams(
  newParams: PageParamsOptional,
  next: URLSearchParams,
): URLSearchParams {
  // Convert newParams to array for iterate
  Object.entries(newParams).forEach(([key, value]) => {
    if (key === PageParamKey.limit) {
      // Handle as number
      const valueAsNumber = parseInt(value as string);
      if (valueAsNumber > 1e6 || valueAsNumber < 0) {
        next.set(key, '-1');
      } else if (isNaN(valueAsNumber) || valueAsNumber < 1) {
        next.set(key, '0');
      } else {
        next.set(key, valueAsNumber.toString());
      }
    } else if (key === PageParamKey.page) {
      // Handle as number
      const valueAsNumber = parseInt(value as string);
      if (isNaN(valueAsNumber) || valueAsNumber < 1) {
        next.set(key, '0');
      } else {
        next.set(key, valueAsNumber.toString());
      }
    } else if (key === PageParamKey.columns) {
      const valueTyped = value as Record<number, bigint>;
      if (Object.keys(valueTyped).length === 0) {
        next.delete(key);
      } else {
        next.set(key, stringifyColumnVisibilityBinaries(valueTyped));
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
  return next;
}

function clearDefaultParams(next: URLSearchParams): URLSearchParams {
  const defaults = getDefaultParams(
    next.get('objectType') as ObjectType,
    next.get('view') as View,
    next.get('profile') as ProfileType,
    next.get('colorBy') as ColorBy,
  );

  Array.from(next.entries()).forEach(([key, value]) => {
    const defaultValue = defaults[key as PageParamKey];

    // Don't remove view or profile because they change on defaults
    if (key === 'objectType' && value !== ObjectType.Language) return;
    if (key === 'view') return;
    if (key === 'profile' && value !== ProfileType.LanguageEthusiast) return;
    if (key === 'colorBy' && value !== 'None') return;

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

function clearContextDependentParams(
  newParams: PageParamsOptional,
  next: URLSearchParams,
  prev?: URLSearchParams,
): URLSearchParams {
  const prevOrDefault = getDefaultParams(
    prev?.get('objectType') as ObjectType,
    prev?.get('view') as View,
    prev?.get('profile') as ProfileType,
    prev?.get('colorBy') as ColorBy,
  );

  if (newParams.objectType !== undefined && newParams.objectType !== prevOrDefault.objectType) {
    if (newParams.page == null) next.delete('page');
    const oldSearchString = prev?.get('searchString');
    const oldObjectID = prev?.get('objectID');
    const contextValue = oldObjectID || oldSearchString;
    if (newParams.searchString === undefined) {
      next.delete('searchString');
    }
    if (newParams.objectID === undefined) {
      next.delete('objectID');
    }
    if (contextValue) {
      if (newParams.objectType === ObjectType.Territory) {
        next.set('languageFilter', contextValue);
      } else if (newParams.objectType === ObjectType.Language) {
        next.set('territoryFilter', contextValue);
      } else if (newParams.objectType === ObjectType.WritingSystem) {
        next.set('languageFilter', contextValue);
      }
    }
  }

  return next;
}

export function getNewURLSearchParams(
  newParams: PageParamsOptional,
  prev?: URLSearchParams,
): URLSearchParams {
  let next = new URLSearchParams(prev);
  next = buildNextURLSearchParams(newParams, next);
  next = clearContextDependentParams(newParams, next, prev);
  next = clearDefaultParams(next);
  return next;
}

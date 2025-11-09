import { ColorBy } from '@features/sorting/SortTypes';

import { ObjectType, PageParamKey, PageParamsOptional, View } from './PageParamTypes';
import { getDefaultParams, ProfileType } from './Profiles';

export function getNewURLSearchParams(
  newParams: PageParamsOptional,
  prev?: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(prev);
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
    if (key === 'colorGradient')
      console.log('checking colorGradient', value, defaults[key as PageParamKey]?.toString());
    if (value === defaults[key as PageParamKey]?.toString()) {
      next.delete(key);
    }
  });

  return next;
}

import { SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/types/DataTypes';

import {
  LocaleSeparator,
  ObjectType,
  PageParamKey,
  PageParamsOptional,
  SearchableField,
  View,
} from './PageParamTypes';
import { ProfileType } from './Profiles';

export function getParamsFromURL(urlParams: URLSearchParams): PageParamsOptional {
  const params: PageParamsOptional = {};
  urlParams.forEach((value, keyUntyped) => {
    const key = keyUntyped as PageParamKey;
    switch (key) {
      // Numeric values
      case PageParamKey.page:
        params.page = parseInt(value) || 1; // Default to 1 if parsing fails
        break;
      case PageParamKey.limit:
        params.limit = parseInt(value) || 10; // Default to 10 if parsing fails
        break;

      // Arrays
      case PageParamKey.languageScopes:
        if (value === '[]') params.languageScopes = [];
        else params.languageScopes = value.split(',').filter(Boolean) as LanguageScope[];
        break;
      case PageParamKey.territoryScopes:
        if (value === '[]') params[key] = [];
        else params[key] = value.split(',').filter(Boolean) as TerritoryScope[];
        break;

      // Enum values
      case PageParamKey.objectType:
        params.objectType = value as ObjectType;
        break;
      case PageParamKey.view:
        params.view = value as View;
        break;
      case PageParamKey.profile:
        params.profile = value as ProfileType;
        break;
      case PageParamKey.searchBy:
        params.searchBy = value as SearchableField;
        break;
      case PageParamKey.sortBy:
        params.sortBy = value as SortBy;
        break;
      case PageParamKey.localeSeparator:
        params.localeSeparator = value as LocaleSeparator;
        break;
      case PageParamKey.languageSource:
        params.languageSource = value as LanguageSource;
        break;
      case PageParamKey.sortBehavior:
        params.sortBehavior = value === '-1' ? SortBehavior.Reverse : SortBehavior.Normal;
        break;

      // Freeform strings
      case PageParamKey.objectID:
      case PageParamKey.searchString:
      case PageParamKey.territoryFilter:
        params[key] = value; // Default to undefined if empty
        break;
    }
  });
  return params;
}

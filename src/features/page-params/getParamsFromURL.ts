import { ColorBy, ColorGradient, SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  VitalityISO,
} from '@entities/language/vitality/VitalityTypes';
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

// Helper function to parse numeric enum arrays from URL strings
function parseNumericEnumArray<T extends number>(
  value: string,
  enumObject: Record<string, unknown>,
): T[] {
  if (value === '[]') return [];
  const validValues = Object.values(enumObject).filter((v) => typeof v === 'number') as T[];
  return value
    .split(',')
    .filter(Boolean)
    .map((item) => parseInt(item, 10))
    .filter((item): item is T => validValues.includes(item as T));
}

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
      case PageParamKey.vitalityISO:
        params.vitalityISO = parseNumericEnumArray(value, VitalityISO);
        break;
      case PageParamKey.vitalityEth2013:
        params.vitalityEth2013 = parseNumericEnumArray(value, VitalityEthnologueFine);
        break;
      case PageParamKey.vitalityEth2025:
        params.vitalityEth2025 = parseNumericEnumArray(value, VitalityEthnologueCoarse);
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
      case PageParamKey.colorBy:
        params.colorBy = value as ColorBy;
        break;
      case PageParamKey.colorGradient:
        params.colorGradient = parseInt(value) as ColorGradient;
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

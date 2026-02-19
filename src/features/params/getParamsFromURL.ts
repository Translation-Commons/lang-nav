import { parseColumnVisibilityBinaries } from '@features/table/useColumnVisibility';
import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageSource } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

import { parseLanguageScope } from '@strings/LanguageScopeStrings';
import { parseTerritoryScope } from '@strings/TerritoryScopeStrings';

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

/**
 * This function is important for parsing the URL parameters
 */
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
        else
          params.languageScopes = value
            .split(',')
            .map((s) => parseLanguageScope(s))
            .filter((s) => s != null);
        break;
      case PageParamKey.modalityFilter:
        params.modalityFilter = parseNumericEnumArray(value, LanguageModality);
        break;
      case PageParamKey.territoryScopes:
        if (value === '[]') params[key] = [];
        else
          params[key] = value
            .split(',')
            .map((s) => parseTerritoryScope(s))
            .filter((s) => s != null);
        break;
      case PageParamKey.isoStatus:
        params.isoStatus = parseNumericEnumArray(value, LanguageISOStatus);
        break;
      case PageParamKey.vitalityEthFine:
        params.vitalityEthFine = parseNumericEnumArray(value, VitalityEthnologueFine);
        break;
      case PageParamKey.vitalityEthCoarse:
        params.vitalityEthCoarse = parseNumericEnumArray(value, VitalityEthnologueCoarse);
        break;

      // Object mapping (columns)
      case PageParamKey.columns:
        params.columns = parseColumnVisibilityBinaries(value);
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
      case PageParamKey.localeSeparator:
        params.localeSeparator = value as LocaleSeparator;
        break;
      case PageParamKey.languageSource:
        params.languageSource = value as LanguageSource;
        break;
      case PageParamKey.sortBehavior:
        params.sortBehavior = value === '-1' ? SortBehavior.Reverse : SortBehavior.Normal;
        break;
      case PageParamKey.colorGradient:
        params.colorGradient = parseInt(value) as ColorGradient;
        break;

      // Fields
      case PageParamKey.searchBy:
        params.searchBy = value as SearchableField;
        break;
      case PageParamKey.sortBy:
        params.sortBy = value as Field;
        break;
      case PageParamKey.secondarySortBy:
        params.secondarySortBy = value as Field;
        break;
      case PageParamKey.colorBy:
        params.colorBy = value as Field;
        break;
      case PageParamKey.scaleBy:
        params.scaleBy = value as Field;
        break;

      // Freeform strings
      case PageParamKey.objectID:
      case PageParamKey.searchString:
      case PageParamKey.languageFilter:
      case PageParamKey.territoryFilter:
      case PageParamKey.writingSystemFilter:
        params[key] = value; // Default to undefined if empty
        break;
    }
  });
  return params;
}

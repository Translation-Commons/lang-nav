import ReportID from '@widgets/reports/ReportID';

import { getParamsFromURL } from '@features/params/getParamsFromURL';
import { getDefaultParams } from '@features/params/Profiles';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

// Rename keys before sending to Amplitude (internalKey to amplitudeKey).
const PROPERTY_KEY_MAP: Record<string, string> = {
  objectType: 'entity',
  page: 'pagination_page',
};

// Default-param keys to exclude from the page_viewed event.
const EXCLUDED_DEFAULT_KEYS = new Set<string>([
  'colorBy',
  'colorGradient',
  'columns',
  'isoStatus',
  'languageFilter',
  'modalityFilter',
  'searchString',
  'territoryFilter',
  'vitalityEthCoarse',
  'vitalityEthFine',
  'writingSystemFilter',
]);

// Numeric enums whose values should be logged as their string names.
const NUMERIC_ENUM_BY_KEY: Record<string, Record<number, string>> = {
  languageScopes: LanguageScope as unknown as Record<number, string>,
  territoryScopes: TerritoryScope as unknown as Record<number, string>,
  sortBehavior: { 1: 'asc', [-1]: 'desc' },
  reportID: ReportID as unknown as Record<number, string>,
};

function resolveEnumValue(key: string, val: unknown): unknown {
  const enumMap = NUMERIC_ENUM_BY_KEY[key];
  if (!enumMap) return val;
  if (Array.isArray(val)) return val.map((v) => (typeof v === 'number' ? (enumMap[v] ?? v) : v));
  if (typeof val === 'number') return enumMap[val] ?? val;
  return val;
}

export function remapKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(remapKeys);
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[PROPERTY_KEY_MAP[key] ?? key] = remapKeys(val);
    }
    return result;
  }
  return value;
}

export function getLoggedDefaults(): Record<string, unknown> {
  const defaults = getDefaultParams() as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(defaults)) {
    if (EXCLUDED_DEFAULT_KEYS.has(key)) continue;
    if (val === undefined || val === null) continue;
    result[key] = resolveEnumValue(key, val);
  }
  return result;
}

export function parseSearchParams(search: string): Record<string, unknown> {
  const parsed = getParamsFromURL(new URLSearchParams(search)) as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(parsed)) {
    if (val === undefined) continue;
    result[key] = resolveEnumValue(key, val);
  }
  return result;
}

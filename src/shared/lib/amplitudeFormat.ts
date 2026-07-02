import ReportID from '@widgets/reports/ReportID';

import { getParamsFromURL } from '@features/params/getParamsFromURL';
import { PageParamKey } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import Field from '@features/transforms/fields/Field';
import { getNormalSortDirection } from '@features/transforms/sorting/sort';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

// Rename keys before sending to Amplitude (internalKey to amplitudeKey).
const PROPERTY_KEY_MAP: Record<string, string> = {
  objectType: 'entity',
  page: 'pagination_page',
};

/**
 * URL params treated as "filters" for `explore_filter_changed`. searchString is
 * intentionally not in this set; it has its own `explore_search_typed` event.
 * View/sort/entity changes also have their own dedicated events.
 */
export const FILTER_PARAM_KEYS: ReadonlyArray<PageParamKey> = [
  PageParamKey.languageFilter,
  PageParamKey.languageFamilyFilter,
  PageParamKey.territoryFilter,
  PageParamKey.writingSystemFilter,
  PageParamKey.languageScopes,
  PageParamKey.territoryScopes,
  PageParamKey.modalityFilter,
  PageParamKey.vitalityEthCoarse,
  PageParamKey.vitalityEthFine,
  PageParamKey.isoStatus,
  PageParamKey.populationMin,
  PageParamKey.populationMax,
];

export type FilterAction = 'set' | 'cleared' | 'added' | 'removed' | 'changed';

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value === '';
  return false;
}

/**
 * Derives a high-level action for a filter change. For array filters, single
 * additions/removals are distinguished from larger edits so analysts can tell
 * "user added a scope" from "user replaced the whole set".
 */
export function deriveFilterAction(previous: unknown, next: unknown): FilterAction {
  const prevEmpty = isEmpty(previous);
  const nextEmpty = isEmpty(next);
  if (prevEmpty && !nextEmpty) return 'set';
  if (!prevEmpty && nextEmpty) return 'cleared';
  if (Array.isArray(previous) && Array.isArray(next)) {
    const prevSet = new Set(previous);
    const nextSet = new Set(next);
    const added = next.filter((v) => !prevSet.has(v));
    const removed = previous.filter((v) => !nextSet.has(v));
    if (added.length === 1 && removed.length === 0) return 'added';
    if (added.length === 0 && removed.length === 1) return 'removed';
  }
  return 'changed';
}

export function areFilterValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const aSorted = [...a].sort();
    const bSorted = [...b].sort();
    return aSorted.every((v, i) => v === bSorted[i]);
  }
  return false;
}

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
  modalityFilter: LanguageModality as unknown as Record<number, string>,
  isoStatus: LanguageISOStatus as unknown as Record<number, string>,
  vitalityEthCoarse: VitalityEthnologueCoarse as unknown as Record<number, string>,
  vitalityEthFine: VitalityEthnologueFine as unknown as Record<number, string>,
  sortBehavior: { 1: 'asc', [-1]: 'desc' },
  reportID: ReportID as unknown as Record<number, string>,
};

// Builds the explore_sort_changed `sort` array, e.g. ['population_desc', 'name_asc'].
export function buildSortKeys(
  sortBy: Field,
  secondarySortBy: Field | undefined,
  sortBehavior: SortBehavior,
): string[] {
  const keys: string[] = [];
  if (sortBy && sortBy !== Field.None) keys.push(toSortKey(sortBy, sortBehavior));
  if (secondarySortBy && secondarySortBy !== Field.None && secondarySortBy !== sortBy) {
    keys.push(toSortKey(secondarySortBy, sortBehavior));
  }
  return keys;
}

function toSortKey(field: Field, sortBehavior: SortBehavior): string {
  const direction = getNormalSortDirection(field) * sortBehavior;
  const slug = field
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${slug}_${direction < 0 ? 'desc' : 'asc'}`;
}

export function resolveEnumValue(key: string, val: unknown): unknown {
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

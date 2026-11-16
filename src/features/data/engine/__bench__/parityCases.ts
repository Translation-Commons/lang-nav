import Field from '@features/transforms/fields/Field';

import type { LanguageSource } from '@entities/language/LanguageTypes';
import { LanguageScope } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import type { EntityData, EntityType } from '@entities/types/EntityTypes';

import type { Query } from '../query/QueryTypes';
import { SEARCH_MODE } from '../query/searchModes';

export type ParityCase = {
  name: string;
  query: Query;
  /** A filter or search is set, so it must drop some rows (catches no-op filters). */
  filtered: boolean;
  /** "Latin" parses as the code "Latin" in parseFilterEntityID, which no writing system has. */
  expectEmpty: boolean;
};

export const EXPECTED_EMPTY_CASES = ['writing system "Latin"'];

const BY_POPULATION = { field: Field.Population };

/** IDs taken from the data so they exist, plus a duplicate and an unknown ID. */
function pickPinned(ents: EntityData[]): string[] {
  const at = (i: number) => ents[Math.min(i, ents.length - 1)].ID;
  return [at(ents.length - 1), at(100), 'not-a-real-id', at(5), at(100)];
}

export function getParityCases(
  type: EntityType,
  ents: EntityData[],
  source: LanguageSource,
): ParityCase[] {
  const cases: [string, Omit<Query, 'type'>][] = [
    [
      'search "ger"',
      { search: { query: 'ger', by: SEARCH_MODE.CodeOrNameAny }, sort: BY_POPULATION },
    ],
    ['search "swiss ger" (whole string)', { search: { query: 'swiss ger' }, sort: BY_POPULATION }],
    ['territory "India"', { filters: { territory: 'India' }, sort: BY_POPULATION }],
    ['territory "[IN]"', { filters: { territory: '[IN]' }, sort: BY_POPULATION }],
    ['language "Hindi"', { filters: { language: 'Hindi' }, sort: BY_POPULATION }],
    [
      'family "Indo-European"',
      { filters: { languageFamily: 'Indo-European' }, sort: BY_POPULATION },
    ],
    ['family "[ine]"', { filters: { languageFamily: '[ine]' }, sort: BY_POPULATION }],
    ['writing system "Latin"', { filters: { writingSystem: 'Latin' }, sort: BY_POPULATION }],
    ['writing system "[Latn]"', { filters: { writingSystem: '[Latn]' }, sort: BY_POPULATION }],
    ['sort Population', { sort: BY_POPULATION }],
    ['sort Name', { sort: { field: Field.Name } }],
    [
      'sort CountOfCountries, then Name',
      { sort: { field: Field.CountOfCountries, secondary: Field.Name } },
    ],
    [
      'territory + search + population min',
      {
        filters: { territory: 'India', populationMin: 1000 },
        search: { query: 'ma' },
        sort: BY_POPULATION,
      },
    ],
    [
      'default scopes',
      {
        filters: {
          languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
          territoryScopes: [TerritoryScope.Country, TerritoryScope.Dependency],
        },
        sort: BY_POPULATION,
      },
    ],
    [
      'pinned + search "ger"',
      { search: { query: 'ger' }, pinned: pickPinned(ents), sort: BY_POPULATION },
    ],
    ['page 3 of 50 by Population', { sort: BY_POPULATION, page: { page: 3, limit: 50 } }],
    ['page past the end', { sort: { field: Field.Name }, page: { page: 100000, limit: 50 } }],
  ];
  return cases.map(([name, query]) => ({
    name,
    query: { type, ...query, filters: { ...query.filters, languageSource: source } },
    filtered: query.search != null || Object.keys(query.filters ?? {}).length > 0,
    expectEmpty: EXPECTED_EMPTY_CASES.includes(name),
  }));
}

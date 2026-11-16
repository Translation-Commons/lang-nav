import { describe, expect, it } from 'vitest';

import Field from '@features/transforms/fields/Field';

import { EntityType } from '@entities/types/EntityTypes';

import { switchToVariant } from '../load/loadSnapshot';
import type { Query } from '../query/QueryTypes';
import { createQueryEngine, executeQuery } from '../query/runQuery';
import { SEARCH_MODE } from '../query/searchModes';
import { getEntity } from '../store/EntityStore';

import { buildFixtureStore, type FixtureLanguage } from './engineFixture';

const LANGUAGES: FixtureLanguage[] = [
  { ID: 'deu', name: 'German', population: 100, countries: 3, territories: ['DE'] },
  { ID: 'gsw', name: 'Swiss German', population: 5, countries: 1, territories: ['DE'] },
  {
    ID: 'hin',
    name: 'Hindi',
    population: 500,
    countries: 1,
    territories: ['IN'],
    isoName: 'Hindi',
  },
  { ID: 'ind', name: 'Indonesian', population: 200, countries: 1, territories: ['ID'] },
  { ID: 'xyz', name: 'Xyzzy', countries: 1 },
  { ID: 'arq', name: 'Algerian Arabic', population: 100, countries: 1, names: ['Darja'] },
  { ID: 'fra', name: 'Français', population: 300, countries: 3, territories: ['DE', 'IN'] },
];

const ids = (query: Partial<Query>) =>
  executeQuery(buildFixtureStore(LANGUAGES), { type: EntityType.Language, ...query }).ids;

describe('query engine filters', () => {
  it('searches word prefixes with accent and case folding', () => {
    expect(ids({ search: { query: 'GER' } })).toEqual(['deu', 'gsw']);
    expect(ids({ search: { query: 'franc' } })).toEqual(['fra']);
    expect(ids({ search: { query: 'swiss ger' } })).toEqual(['gsw']);
    expect(ids({ search: { query: 'dar', by: SEARCH_MODE.NameAny } })).toEqual(['arq']);
  });

  it('falls back to the residual predicate for modes without an index', () => {
    const store = buildFixtureStore(LANGUAGES);
    const result = executeQuery(store, {
      type: EntityType.Language,
      search: { query: 'hin', by: SEARCH_MODE.NameISO },
    });
    expect(result.ids).toEqual(['hin']);
    expect(result.plan).toEqual([{ name: 'search:ISO Name', kind: 'residual', count: 6 }]);
  });

  it('filters by territory name word prefix or by bracketed code', () => {
    expect(ids({ filters: { territory: 'Ind' } })).toEqual(['hin', 'ind', 'fra']);
    expect(ids({ filters: { territory: 'India [in]' } })).toEqual(['hin', 'fra']);
  });

  it('lets filters through when the field does not apply to the type', () => {
    expect(ids({ filters: { writingSystem: 'Latin' } })).toHaveLength(LANGUAGES.length);
  });

  it('treats missing population as -1', () => {
    expect(ids({ filters: { populationMin: 0 } })).not.toContain('xyz');
    expect(ids({ filters: { populationMin: -1 } })).toContain('xyz');
    expect(ids({ filters: { populationMin: 100, populationMax: 200 } })).toEqual([
      'deu',
      'ind',
      'arq',
    ]);
  });

  it('records index steps smallest first', () => {
    const store = buildFixtureStore(LANGUAGES);
    const { plan } = executeQuery(store, {
      type: EntityType.Language,
      search: { query: 'ger' },
      filters: { territory: 'Germany', populationMin: 50 },
    });
    expect(plan.map((step) => step.name)).toEqual([
      'search:Code or Any Name',
      'connection:territory',
      'range:population',
    ]);
    expect(plan.map((step) => step.count)).toEqual([2, 3, 5]);
  });
});

describe('query engine ordering', () => {
  it('sorts by population descending with nulls last and ties in input order', () => {
    expect(ids({ sort: { field: Field.Population } })).toEqual([
      'hin',
      'fra',
      'ind',
      'deu',
      'arq',
      'gsw',
      'xyz',
    ]);
  });

  it('breaks primary ties with the secondary sort', () => {
    expect(ids({ sort: { field: Field.CountOfCountries, secondary: Field.Name } })).toEqual([
      'fra',
      'deu',
      'arq',
      'hin',
      'ind',
      'gsw',
      'xyz',
    ]);
  });

  it('puts pinned entities first in pinned order, even when filtered out', () => {
    const result = ids({
      search: { query: 'ger' },
      sort: { field: Field.Name },
      pinned: ['xyz', 'missing', 'gsw', 'xyz'],
    });
    expect(result).toEqual(['xyz', 'gsw', 'deu']);
  });

  it('paginates like usePagination', () => {
    const sort = { field: Field.Name };
    expect(ids({ sort, page: { page: 2, limit: 3 } })).toEqual(['hin', 'ind', 'gsw']);
    expect(ids({ sort, page: { page: 9, limit: 3 } })).toEqual(['arq', 'fra', 'deu']);
    expect(ids({ sort, page: { page: 1, limit: 0 } })).toHaveLength(LANGUAGES.length);
    const store = buildFixtureStore(LANGUAGES);
    expect(
      executeQuery(store, { type: EntityType.Language, page: { page: 3, limit: 3 } }).total,
    ).toBe(7);
  });
});

describe('variants and caching', () => {
  it('relinks references and aliases', () => {
    const store = buildFixtureStore(LANGUAGES);
    const german = getEntity(store, 'deu') as unknown as { territory: { ID: string } };
    expect(german.territory.ID).toBe('IN');
    expect(getEntity(store, 'india')?.ID).toBe('IN');
  });

  it('applies and reverts variant patches and bumps the version', () => {
    const store = buildFixtureStore(LANGUAGES, { deu: 'Deutsch' });
    const before = store.version;
    switchToVariant(store, 'ISO');
    expect(store.version).toBe(before + 1);
    expect(getEntity(store, 'deu')?.nameDisplay).toBe('Deutsch');
    expect(
      executeQuery(store, { type: EntityType.Language, search: { query: 'deut' } }).ids,
    ).toEqual(['deu']);
    switchToVariant(store, 'Combined');
    expect(getEntity(store, 'deu')?.nameDisplay).toBe('German');
  });

  it('serves repeated queries from the cache until the version changes', () => {
    const store = buildFixtureStore(LANGUAGES);
    const engine = createQueryEngine(store);
    const query: Query = { type: EntityType.Language, sort: { field: Field.Name } };
    const first = engine.run(query);
    expect(engine.run({ sort: { field: Field.Name }, type: EntityType.Language })).toBe(first);
    expect(engine.run(query, { useCache: false })).not.toBe(first);
    switchToVariant(store, 'ISO');
    expect(engine.run(query)).not.toBe(first);
  });
});

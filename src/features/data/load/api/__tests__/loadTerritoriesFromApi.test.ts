import { afterEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { ApiTerritory, loadTerritoriesFromApi, parseApiTerritory } from '../loadTerritoriesFromApi';

/**
 * These test the mapping only, against fixtures shaped exactly like the API's
 * JSON. They need no network and no database.
 *
 * Whether the mapping AGREES with the TSV path is a different question, and one
 * a unit test cannot answer: that is the 289-row field-by-field diff, which
 * needs both paths and a running backend.
 */

/** India: every field populated, and the awkward name cases. */
const india: ApiTerritory = {
  id: 'IN',
  code_alpha3: 'IND',
  code_numeric: '356',
  scope: 2,
  name_endonym: 'Bhārat',
  contained_un_region_id: '034',
  sovereign_id: null,
  population_from_un: 1413324000,
  literacy_percent: 62.8,
  gdp: 13100000000000,
  land_area_km2: 2973190.0,
  latitude: 20.0,
  longitude: 77.0,
  entity: {
    name_display: 'India',
    entity_name: [
      { kind: 'display', name: 'India' },
      { kind: 'endonym', name: 'Bhārat' },
      { kind: 'endonym', name: 'भारत' },
      { kind: 'endonym', name: 'Bhārata' },
      { kind: 'alias', name: 'India' },
      { kind: 'alias', name: 'Republic of India' },
    ],
  },
};

/** The World: a group, so no alpha3, no endonym, no sovereign. */
const world: ApiTerritory = {
  id: '001',
  code_alpha3: null,
  code_numeric: null,
  scope: 6,
  name_endonym: null,
  contained_un_region_id: null,
  sovereign_id: null,
  population_from_un: 7909295151,
  literacy_percent: null,
  gdp: null,
  land_area_km2: null,
  latitude: null,
  longitude: null,
  entity: { name_display: 'World', entity_name: [{ kind: 'display', name: 'World' }] },
};

describe('parseApiTerritory', () => {
  it('maps the identity fields', () => {
    const t = parseApiTerritory(india);
    expect(t.type).toBe(EntityType.Territory);
    expect(t.ID).toBe('IN');
    expect(t.codeDisplay).toBe('IN');
    expect(t.nameDisplay).toBe('India');
    expect(t.codeAlpha3).toBe('IND');
    expect(t.codeNumeric).toBe('356');
  });

  it('maps scope onto the enum, where a larger value is a broader scope', () => {
    expect(parseApiTerritory(india).scope).toBe(TerritoryScope.Country);
    expect(parseApiTerritory(world).scope).toBe(TerritoryScope.World);
  });

  // The one that would be plausible and wrong. `population` in the database is
  // D3's rolled-up figure; `population_from_un` is the raw one. pop.fromUN is
  // surfaced by getEntityPopulationDirectlySourced as its own field, so feeding
  // it the roll-up would label a computed number as sourced.
  it('takes population from the RAW UN column, into both overall and fromUN', () => {
    const t = parseApiTerritory(india);
    expect(t.pop.fromUN).toBe(1413324000);
    expect(t.pop.overall).toBe(1413324000);
  });

  it('derives speaking and writing exactly as loadTerritoryGDPLiteracy does', () => {
    const t = parseApiTerritory(india);
    expect(t.pop.speaking).toBe(1413324000);
    expect(t.pop.writing).toBe(1413324000 * (62.8 / 100));
  });

  it('leaves speaking and writing undefined when there is no literacy figure', () => {
    const t = parseApiTerritory(world);
    expect(t.pop.speaking).toBeUndefined();
    expect(t.pop.writing).toBeUndefined();
    expect(t.pop.overall).toBe(7909295151);
  });

  // JSON null would satisfy neither the `?:` types nor the `!= null` guards
  // that consumers use, and `codeAlpha3: null` is a different thing from an
  // absent code at every call site.
  it('converts every absent value to undefined, never null', () => {
    const t = parseApiTerritory(world);
    for (const value of [
      t.codeAlpha3,
      t.codeNumeric,
      t.nameEndonym,
      t.literacyPercent,
      t.gdp,
      t.landArea,
      t.latitude,
      t.longitude,
      t.containedUNRegionCode,
      t.sovereignCode,
      t.nameOtherEndonyms,
      t.nameOtherExonyms,
    ]) {
      expect(value).toBeUndefined();
      expect(value).not.toBeNull();
    }
  });

  // nameEndonym and nameOtherEndonyms both carry kind='endonym', so only
  // territory.name_endonym separates them. Array order must not be relied on.
  it('separates the endonym from the other endonyms by value, not position', () => {
    const t = parseApiTerritory(india);
    expect(t.nameEndonym).toBe('Bhārat');
    expect(t.nameOtherEndonyms).toEqual(['भारत', 'Bhārata']);
    expect(t.nameOtherEndonyms).not.toContain('Bhārat');
  });

  it('drops the alias that merely repeats the display name', () => {
    const t = parseApiTerritory(india);
    expect(t.nameOtherExonyms).toEqual(['Republic of India']);
  });

  it('builds names in display, endonym, other endonyms, other exonyms order', () => {
    expect(parseApiTerritory(india).names).toEqual([
      'India',
      'Bhārat',
      'भारत',
      'Bhārata',
      'Republic of India',
    ]);
  });

  it('falls back to just the display name when there is nothing else', () => {
    expect(parseApiTerritory(world).names).toEqual(['World']);
  });

  // A territory name may legitimately contain a comma. BQ is the one that
  // exposed the ETL splitting these on "," instead of ";", and it must arrive
  // as a single name.
  it('keeps a comma-bearing name whole', () => {
    const bq: ApiTerritory = {
      ...world,
      id: 'BQ',
      scope: 1,
      name_endonym: 'Caribisch Nederland',
      entity: {
        name_display: 'Caribbean Netherlands',
        entity_name: [
          { kind: 'display', name: 'Caribbean Netherlands' },
          { kind: 'endonym', name: 'Caribisch Nederland' },
          { kind: 'alias', name: 'Caribbean Netherlands' },
          { kind: 'alias', name: 'Bonaire, Sint Eustatius, and Saba' },
        ],
      },
    };
    const t = parseApiTerritory(bq);
    expect(t.nameOtherExonyms).toEqual(['Bonaire, Sint Eustatius, and Saba']);
    expect(t.nameOtherEndonyms).toBeUndefined();
  });
});

/**
 * Regression. CoreData.tsx awaits every loader in one Promise.all and then
 * checks the results for null, alerting if any is missing. A loader that
 * REJECTS skips that check: the whole Promise.all rejects, the alert never
 * runs, and the app sits on "Loading stage: 1 of 4" indefinitely with the cause
 * only in the console.
 *
 * That was the observed behaviour with PostgREST stopped, before this was
 * fixed: 0 rows, 0 dialogs, an unhandled "Failed to fetch", and a loading
 * indicator that never advanced.
 */
describe('loadTerritoriesFromApi failure handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('resolves to undefined rather than rejecting when the API is unreachable', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    await expect(loadTerritoriesFromApi()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('resolves to undefined rather than rejecting on a non-200', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 503, statusText: 'Service Unavailable' } as Response),
      ),
    );

    await expect(loadTerritoriesFromApi()).resolves.toBeUndefined();
  });
});

/**
 * Supabase puts a gateway in front of the same PostgREST and rejects any
 * request without its anonymous key. The key goes in two headers because two
 * different things read it: the gateway checks `apikey`, and PostgREST itself
 * reads the bearer token to choose the database role.
 *
 * Against a bare local PostgREST no key is set and no headers are sent, which
 * is why this is driven by the env var rather than always on.
 */
describe('API request headers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const captureHeaders = async () => {
    // Typed from `fetch` itself, so mock.calls is [input, init] rather than an
    // empty tuple. Declaring throwaway parameters instead would type it too,
    // but they read as dead arguments and the linter agrees.
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve([]) } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);
    await loadTerritoriesFromApi();
    return fetchMock.mock.calls[0][1]?.headers as Record<string, string> | undefined;
  };

  it('sends no auth headers when no key is configured', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.stubEnv('VITE_API_KEY', '');
    expect(await captureHeaders()).toEqual({});
  });

  it('sends the key as both apikey and bearer when one is configured', async () => {
    vi.stubEnv('VITE_API_URL', 'https://project.supabase.co/rest/v1');
    vi.stubEnv('VITE_API_KEY', 'test-anon-key');
    expect(await captureHeaders()).toEqual({
      apikey: 'test-anon-key',
      Authorization: 'Bearer test-anon-key',
    });
  });
});

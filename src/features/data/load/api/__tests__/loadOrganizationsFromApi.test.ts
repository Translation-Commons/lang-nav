import { afterEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { CensusCollectorType } from '@entities/census/CensusTypes';

import {
  ApiOrganization,
  loadOrganizationsFromApi,
  parseApiOrganization,
} from '../loadOrganizationsFromApi';

/**
 * These test the mapping only, against fixtures shaped exactly like the API's
 * JSON. They need no network and no database.
 *
 * Whether the mapping AGREES with the TSV path is a different question, and one
 * a unit test cannot answer: that is the field-by-field diff across every
 * organization, which needs both paths and a running backend.
 */

/** A root org with no endonym and no parent. */
const un: ApiOrganization = {
  id: 'org.UN',
  url: 'https://www.un.org/',
  collector_type: null,
  parent_id: null,
  hq_territory_id: '001',
  entity: { name_display: 'United Nations', name_endonym: null },
};

/** A root org WITH an endonym. */
const statCan: ApiOrganization = {
  id: 'org.StatCan',
  url: 'https://www.statcan.gc.ca/',
  collector_type: null,
  parent_id: null,
  hq_territory_id: 'CA',
  entity: { name_display: 'Statistics Canada', name_endonym: 'Statistique Canada' },
};

/** A child org, to exercise parentID mapping. */
const cldr: ApiOrganization = {
  id: 'org.CLDR',
  url: 'https://cldr.unicode.org/',
  collector_type: null,
  parent_id: 'org.Unicode',
  hq_territory_id: 'US',
  entity: { name_display: 'Common Locale Data Repository', name_endonym: null },
};

describe('parseApiOrganization', () => {
  it('maps the identity fields', () => {
    const o = parseApiOrganization(un);
    expect(o.type).toBe(EntityType.Org);
    expect(o.ID).toBe('org.UN');
    expect(o.nameDisplay).toBe('United Nations');
    expect(o.url).toBe('https://www.un.org/');
  });

  it('strips the org. prefix from id to produce codeDisplay', () => {
    const o = parseApiOrganization(cldr);
    expect(o.ID).toBe('org.CLDR');
    expect(o.codeDisplay).toBe('CLDR');
  });

  it('maps parentID and hqID directly, with no transform', () => {
    const o = parseApiOrganization(cldr);
    expect(o.parentID).toBe('org.Unicode');
    expect(o.hqID).toBe('US');
  });

  it('maps a populated collectorType', () => {
    const o = parseApiOrganization({ ...un, collector_type: CensusCollectorType.Government });
    expect(o.collectorType).toBe(CensusCollectorType.Government);
  });

  // JSON null would satisfy neither the `?:` types nor the `!= null` guards
  // that consumers use.
  it('converts every absent value to undefined, never null', () => {
    const o = parseApiOrganization(un);
    for (const value of [o.nameEndonym, o.collectorType, o.parentID]) {
      expect(value).toBeUndefined();
      expect(value).not.toBeNull();
    }
  });

  it('builds names with the endonym when present', () => {
    expect(parseApiOrganization(statCan).names).toEqual([
      'Statistics Canada',
      'Statistique Canada',
    ]);
  });

  it('falls back to just the display name when there is no endonym', () => {
    expect(parseApiOrganization(un).names).toEqual(['United Nations']);
  });
});

/**
 * Regression, same contract every API loader must honor. CoreData.tsx awaits
 * every loader in one Promise.all and then checks the results for null,
 * alerting if any is missing. A loader that REJECTS skips that check: the
 * whole Promise.all rejects and the app sits stuck with the cause visible
 * only in the console.
 */
describe('loadOrganizationsFromApi failure handling', () => {
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

    await expect(loadOrganizationsFromApi()).resolves.toBeUndefined();
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

    await expect(loadOrganizationsFromApi()).resolves.toBeUndefined();
  });
});

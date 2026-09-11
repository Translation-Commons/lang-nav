import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { loadOrganizations } from '../loadOrganizations';

// Before this fix, an unreachable PostgREST meant loadOrganizations() resolved
// to undefined, CoreData.tsx's Promise.all treated that as fatal, and the app
// got stuck on "Error loading data" forever - even though organizations.tsv
// was sitting right there in public/data, unaffected by the database being down.
describe('loadOrganizations falls back to TSV when the API is unreachable', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resolves with real organization data instead of undefined', async () => {
    const server = await getServer();
    server.use(
      await makeFileAvailable('data/tc/organizations.tsv'),
      http.get('http://localhost:3000/organization', () => HttpResponse.error()),
    );
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

    const organizations = await loadOrganizations();

    expect(organizations?.['org.UN']).toBeDefined();
    expect(Object.keys(organizations ?? {}).length).toBeGreaterThan(0);
  });

  it('records a successful API load when the API actually answers', async () => {
    const server = await getServer();
    server.use(
      http.get('http://localhost:3000/organization', () =>
        HttpResponse.json([
          {
            id: 'org.UN',
            url: 'https://www.un.org/',
            collector_type: null,
            parent_id: null,
            hq_territory_id: '001',
            entity: { name_display: 'United Nations', name_endonym: null },
          },
        ]),
      ),
    );
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

    const organizations = await loadOrganizations();

    expect(organizations?.['org.UN']?.nameDisplay).toBe('United Nations');
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetApiAvailability } from '@features/data/api/apiClient';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import useTablePage, { toApiQuery } from '../useTablePage';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/transforms/filtering/useFilteredEntities', () => ({ default: vi.fn() }));

const ent = (ID: string): EntityData =>
  ({
    ID,
    type: EntityType.Territory,
    codeDisplay: ID,
    nameDisplay: `Territory ${ID}`,
    names: [],
    scope: TerritoryScope.Country,
    pop: { overall: 1 },
  }) as EntityData;

const ENTS = [ent('AA'), ent('BB'), ent('CC')];

function mockFetchResponse(body: unknown, ok = true, apiUp = true) {
  return vi
    .fn()
    .mockImplementation(async (url: string) =>
      url.endsWith('/meta/')
        ? { ok: apiUp, status: apiUp ? 200 : 503, json: async () => ({}) }
        : { ok, status: ok ? 200 : 500, json: async () => body },
    );
}

/** The table-page requests, leaving out the startup health check. */
const pageCalls = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.filter(([url]) => !String(url).endsWith('/meta/'));

describe('useTablePage', () => {
  beforeEach(() => {
    vi.mocked(usePageParams).mockReturnValue(createMockUsePageParams({ limit: 2, page: 1 }));
    vi.mocked(useFilteredEntities).mockImplementation(({ inputEnts }) => ({
      filteredEntities: inputEnts ?? [],
      allEntities: inputEnts ?? [],
    }));
  });

  afterEach(() => {
    resetApiAvailability();
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('local mode filters and pages in the browser without calling the API', () => {
    localStorage.setItem('data-source', 'local');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTablePage(ENTS, 'territories'));

    expect(result.current.isApi).toBe(false);
    expect(result.current.currentEntities.map((e) => e.ID)).toEqual(['AA', 'BB']);
    expect(result.current.filteredEntities).toHaveLength(3);
    expect(result.current.totalCount).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('defaults to the API for wired tables and to local for the rest', () => {
    vi.stubGlobal('fetch', mockFetchResponse({ total: 0, results: [] }));
    expect(renderHook(() => useTablePage(ENTS, 'territories')).result.current.isApi).toBe(true);
    expect(renderHook(() => useTablePage(ENTS)).result.current.isApi).toBe(false);
  });

  it('stays local in API mode when the table has no apiPath', () => {
    localStorage.setItem('data-source', 'api');
    const { result } = renderHook(() => useTablePage(ENTS));
    expect(result.current.isApi).toBe(false);
  });

  it('stays local for in-details tables', () => {
    localStorage.setItem('data-source', 'api');
    vi.mocked(usePageParams).mockReturnValue({
      ...createMockUsePageParams(),
      paramsLevel: 'local',
    });
    const { result } = renderHook(() => useTablePage(ENTS, 'territories'));
    expect(result.current.isApi).toBe(false);
  });

  it('in API mode renders the page and total the API returns, skipping the client pass', async () => {
    localStorage.setItem('data-source', 'api');
    const fetchMock = mockFetchResponse({ total: 250, results: [ent('ZZ')] });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTablePage(ENTS, 'territories'));

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.currentEntities.map((e) => e.ID)).toEqual(['ZZ']);
    expect(result.current.totalCount).toBe(250);
    expect(vi.mocked(useFilteredEntities).mock.calls[0][0].inputEnts).toEqual([]);

    const url = new URL(pageCalls(fetchMock)[0][0]);
    expect(url.pathname.endsWith('/territories')).toBe(true);
    expect(url.searchParams.get('limit')).toBe('2');
    expect(url.searchParams.get('page')).toBe('1');
  });

  it('shows the error state when the API fails', async () => {
    localStorage.setItem('data-source', 'api');
    vi.stubGlobal('fetch', mockFetchResponse({}, false));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTablePage(ENTS, 'territories'));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.currentEntities).toEqual([]);
  });

  it('shows the error state, not a crash, when the response has another shape', async () => {
    localStorage.setItem('data-source', 'api');
    vi.stubGlobal('fetch', mockFetchResponse({ count: 1, rows: [ent('ZZ')] }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTablePage(ENTS, 'territories/'));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.currentEntities).toEqual([]);
  });

  it('uses local data when the startup health check fails', async () => {
    const fetchMock = mockFetchResponse({ total: 1, results: [ent('ZZ')] }, true, false);
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useTablePage(ENTS, 'territories'));

    expect(result.current.status).toBe('loading'); // checking, no local rows flashed
    await waitFor(() => expect(result.current.isApi).toBe(false));
    expect(result.current.currentEntities.map((e) => e.ID)).toEqual(['AA', 'BB']);
    expect(pageCalls(fetchMock)).toHaveLength(0);
  });

  it('checks the API once per page load, not per table', async () => {
    const fetchMock = mockFetchResponse({ total: 1, results: [ent('ZZ')] });
    vi.stubGlobal('fetch', fetchMock);

    const first = renderHook(() => useTablePage(ENTS, 'territories'));
    await waitFor(() => expect(first.result.current.status).toBe('ready'));
    const second = renderHook(() => useTablePage(ENTS, 'territories'));
    await waitFor(() => expect(second.result.current.status).toBe('ready'));

    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/meta/'))).toHaveLength(1);
  });

  it('aborts the stale request when the params change', async () => {
    localStorage.setItem('data-source', 'api');
    const fetchMock = mockFetchResponse({ total: 1, results: [ent('ZZ')] });
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = renderHook(() => useTablePage(ENTS, 'territories'));
    await waitFor(() => expect(pageCalls(fetchMock)).toHaveLength(1)); // after the health check
    vi.mocked(usePageParams).mockReturnValue(createMockUsePageParams({ limit: 2, page: 2 }));
    rerender();

    await waitFor(() => expect(pageCalls(fetchMock)).toHaveLength(2));
    expect((pageCalls(fetchMock)[0][1].signal as AbortSignal).aborted).toBe(true);
    expect(new URL(pageCalls(fetchMock)[1][0]).searchParams.get('page')).toBe('2');
  });
});

describe('toApiQuery', () => {
  it('sends resolved values, including defaults, and leaves out column visibility', () => {
    const query = new URLSearchParams(
      toApiQuery({
        ...createMockUsePageParams({ sortBy: Field.Name, pinned: ['FR', 'DE'] }),
        columns: { 1: 3n },
      }),
    );

    expect(query.get('sortBy')).toBe(Field.Name);
    expect(query.get('pinned')).toBe('FR,DE');
    expect(query.get('entType')).toBe(EntityType.Language); // a default, still sent
    expect(query.has('columns')).toBe(false);
    expect(query.has('updatePageParams')).toBe(false);
  });

  it('is stable regardless of key order', () => {
    const params = createMockUsePageParams({ limit: 10 });
    const reordered = Object.fromEntries(Object.entries(params).reverse()) as typeof params;
    expect(toApiQuery(reordered)).toBe(toApiQuery(params));
  });
});

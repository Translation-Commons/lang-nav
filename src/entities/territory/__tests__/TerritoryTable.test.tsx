import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse, JsonBodyType } from 'msw';
import { useMemo } from 'react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  getFullyInstantiatedMockedEntities,
  getMockedDataContext,
} from '@features/__tests__/MockEntities';
import { defineEndpoint } from '@features/data/api/core/defineEndpoint';
import { EndpointSource } from '@features/data/api/core/endpoints';
import {
  TerritoryList,
  TerritoryListQuery,
  toTerritoryListQuery,
  toTerritoryRow,
  useTerritoryList,
} from '@features/data/api/territory/territoryList';
import { DataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import RowTable from '@features/table/RowTable';
import TableID from '@features/table/TableID';

import { EntityType } from '@entities/types/EntityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';
import { getServer } from '@tests/testServer';

import getTerritoryColumns from '../TerritoryColumns';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
// Files mode, read when the endpoint modules load (API is the default).
vi.hoisted(() => localStorage.setItem('data-source', 'files'));

const ents = getFullyInstantiatedMockedEntities();
const columns = getTerritoryColumns();
const useApiTerritoryList = defineEndpoint<TerritoryListQuery, TerritoryList>(
  'territoryList',
  'territories/',
  () => () => {
    throw new Error('Files must not run in API mode');
  },
  EndpointSource.API,
);

// Same wiring as TerritoryTable, with the endpoint hook injected.
function Table({ useEndpoint }: { useEndpoint: typeof useTerritoryList }) {
  const params = usePageParams();
  const query = useMemo(() => toTerritoryListQuery(params), [params]);
  const { state } = useEndpoint(query);
  return (
    <RowTable
      tableID={TableID.Territories}
      columns={columns}
      state={state}
      getAllRows={async () => []}
    />
  );
}

const renderTable = (useEndpoint: typeof useTerritoryList) =>
  render(
    <DataContext.Provider value={getMockedDataContext(ents)}>
      <Table useEndpoint={useEndpoint} />
    </DataContext.Provider>,
  );

const rowTexts = (container: HTMLElement) =>
  [...container.querySelectorAll('tbody tr')].map((r) => r.textContent);

describe('Territories table', () => {
  beforeEach(() => {
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ limit: 3 }));
  });

  it('rows are plain JSON', () => {
    for (const ent of Object.values(ents)) {
      if (ent.type !== EntityType.Territory) continue;
      const row = toTerritoryRow(ent);
      expect(JSON.parse(JSON.stringify(row))).toEqual(row);
    }
  });

  it('renders one page from Files', () => {
    const { container } = renderTable(useTerritoryList);
    expect(container.querySelector('[data-row-source="files"]')).not.toBeNull();
    expect(rowTexts(container)).toHaveLength(3);
  });

  it('renders the same rows from an API serving the Files JSON', async () => {
    const files = renderTable(useTerritoryList);
    const expected = rowTexts(files.container);
    // The dev helper returns the exact JSON the backend is asked to serve.
    const { apiSample } = window as unknown as {
      apiSample: (n: string) => { response: JsonBodyType };
    };
    const { response } = apiSample('territoryList');
    files.unmount();

    let query: URLSearchParams | undefined;
    (await getServer()).use(
      http.get('*/api/v1/territories/', ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json(response);
      }),
    );
    const api = renderTable(useApiTerritoryList);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() =>
      expect(api.container.querySelector('[data-row-source="api"]')).not.toBeNull(),
    );
    expect(rowTexts(api.container)).toEqual(expected);
    expect(query?.get('limit')).toBe('3');
    expect(query?.has('territoryScopes')).toBe(true);
  });
});

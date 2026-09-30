import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { getServer } from '@tests/testServer';

import { defineEndpoint, toPathAndParams } from '../defineEndpoint';
import { EndpointSource } from '../endpoints';

const compute = (query: Record<string, string>) => ({ echo: query.q });
const useFiles = () => compute;

describe('defineEndpoint', () => {
  it('Files: computes the response for the query, ready at once', () => {
    const useThing = defineEndpoint('territoryList', 'things/', useFiles, EndpointSource.Files);
    const { result } = renderHook(() => useThing({ q: 'a' }));
    expect(result.current.state).toEqual({
      status: 'ready',
      data: { echo: 'a' },
      source: EndpointSource.Files,
    });
  });

  it('Files: fetch computes another query', async () => {
    const useThing = defineEndpoint('territoryList', 'things/', useFiles, EndpointSource.Files);
    const { result } = renderHook(() => useThing({ q: 'a' }));
    await expect(result.current.fetch({ q: 'b' })).resolves.toEqual({ echo: 'b' });
  });

  describe('API', () => {
    // The global setup starts MSW and resets handlers after each test.
    beforeEach(async () => {
      (await getServer()).use(
        http.get('*/api/v1/things/', ({ request }) => {
          const q = new URL(request.url).searchParams.get('q');
          return q === 'fail'
            ? new HttpResponse('nope', { status: 400 })
            : HttpResponse.json({ echo: q });
        }),
      );
    });

    const useThing = defineEndpoint(
      'territoryList',
      'things/',
      () => {
        throw new Error('Files must not run in API mode');
      },
      EndpointSource.API,
    );

    it('loads, then returns the same JSON Files would', async () => {
      const { result } = renderHook(() => useThing({ q: 'a' }));
      expect(result.current.state).toEqual({ status: 'loading' });
      await waitFor(() =>
        expect(result.current.state).toEqual({
          status: 'ready',
          data: compute({ q: 'a' }),
          source: EndpointSource.API,
        }),
      );
    });

    it('reports HTTP errors instead of falling back to Files', async () => {
      const { result } = renderHook(() => useThing({ q: 'fail' }));
      await waitFor(() => expect(result.current.state.status).toBe('error'));
    });

    it('keeps the previous data, marked stale, while a new query loads', async () => {
      const { result, rerender } = renderHook(({ q }) => useThing({ q }), {
        initialProps: { q: 'a' },
      });
      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      rerender({ q: 'b' });
      expect(result.current.state).toMatchObject({ data: { echo: 'a' }, stale: true });
      await waitFor(() =>
        expect(result.current.state).toEqual({
          status: 'ready',
          data: { echo: 'b' },
          source: EndpointSource.API,
        }),
      );
    });

    it('shows loading, not an old error, when the next query starts', async () => {
      const { result, rerender } = renderHook(({ q }) => useThing({ q }), {
        initialProps: { q: 'fail' },
      });
      await waitFor(() => expect(result.current.state.status).toBe('error'));
      rerender({ q: 'b' });
      expect(result.current.state).toEqual({ status: 'loading' });
    });
  });
});

describe('toPathAndParams', () => {
  it('fills path segments from the query and keeps the rest as params', () => {
    expect(toPathAndParams('writing-systems/{id}/', { id: 'Latn', sortBy: 'Name' })).toEqual([
      'writing-systems/Latn/',
      { sortBy: 'Name' },
    ]);
  });

  it('encodes path values', () => {
    expect(toPathAndParams('x/{id}/', { id: 'a/b' })[0]).toBe('x/a%2Fb/');
  });
});

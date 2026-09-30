import { useEffect, useMemo, useState } from 'react';

import { apiGet } from './apiClient';
import { Endpoint, EndpointSource, getEndpointSource } from './endpoints';

export type Query = Record<string, string>;

export type EndpointState<R> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      data: R;
      source: EndpointSource;
      /** The data is the previous query's; the current one is still loading. */
      stale?: boolean;
    };

export type EndpointResult<Q extends Query, R> = {
  state: EndpointState<R>;
  /** The same endpoint for another query, e.g. every row for an export. */
  fetch: (query: Q) => Promise<R>;
};

/**
 * A hook that reads the graph and returns the endpoint computed locally: query in, response out.
 * It is the frontend's reference implementation of the API.
 */
export type UseFilesEndpoint<Q extends Query, R> = () => (query: Q) => R;

/**
 * One view's data source. The flag is read once at load, so the returned hook never switches
 * implementation mid-session (rules of hooks).
 */
export function defineEndpoint<Q extends Query, R>(
  name: Endpoint,
  path: string,
  useFiles: UseFilesEndpoint<Q, R>,
  source: EndpointSource = getEndpointSource(name),
): (query: Q) => EndpointResult<Q, R> {
  if (source === EndpointSource.API) {
    const fetchFromApi = (query: Q, signal?: AbortSignal) =>
      apiGet<R>(...toPathAndParams(path, query), signal);
    return function useApiEndpoint(query) {
      return { state: useFetched(fetchFromApi, query), fetch: fetchFromApi };
    };
  }
  return function useFilesEndpoint(query) {
    const compute = useFiles();
    const key = JSON.stringify(query);
    const data = useMemo(() => compute(query), [compute, key]);
    useDevSample(name, path, query, compute);
    return {
      state: { status: 'ready', data, source: EndpointSource.Files },
      fetch: async (q) => compute(q),
    };
  };
}

/** Fills `{name}` path segments from the query; the rest of the query becomes URL params. */
export function toPathAndParams(path: string, query: Query): [string, Query] {
  const params = { ...query };
  const filled = path.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    delete params[name];
    return encodeURIComponent(value ?? '');
  });
  return [filled, params];
}

function useFetched<Q extends Query, R>(
  fetchFromApi: (query: Q, signal: AbortSignal) => Promise<R>,
  query: Q,
): EndpointState<R> {
  const key = JSON.stringify(query);
  const [result, setResult] = useState<{ key: string; state: EndpointState<R> }>();

  useEffect(() => {
    const controller = new AbortController();
    fetchFromApi(JSON.parse(key) as Q, controller.signal)
      .then((data) =>
        setResult({ key, state: { status: 'ready', data, source: EndpointSource.API } }),
      )
      .catch((error: Error) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: 'error', message: error.message } });
        }
      });
    return () => controller.abort();
  }, [fetchFromApi, key]);

  if (result?.key === key) return result.state;
  // Keep showing the previous data while the new query loads, like Files mode does.
  return result?.state.status === 'ready'
    ? { ...result.state, stale: true }
    : { status: 'loading' };
}

type DevSample = { path: string; query: Query; compute: (query: Query) => unknown };
type DevWindow = {
  apiEndpoints?: Record<string, DevSample>;
  apiSample?: (name: string, overrides?: Query) => unknown;
};

/** Dev only: `apiSample('territoryList')` in the console returns the expected response for the view on screen. */
function useDevSample<Q extends Query, R>(
  name: Endpoint,
  path: string,
  query: Q,
  compute: (query: Q) => R,
): void {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const win = window as unknown as DevWindow;
    win.apiEndpoints = {
      ...win.apiEndpoints,
      [name]: { path, query, compute: compute as (query: Query) => unknown },
    };
    win.apiSample ??= (endpoint, overrides = {}) => {
      const sample = win.apiEndpoints?.[endpoint];
      if (!sample) return console.warn(`[api] ${endpoint}: open a view that uses it first`);
      // Files computes everything but page and limit from the page, so other overrides would be ignored.
      const other = Object.keys(overrides).filter((key) => key !== 'page' && key !== 'limit');
      if (other.length) {
        return console.warn(
          `[api] ${endpoint}: set ${other.join(', ')} in the app, not as an override`,
        );
      }
      const query = { ...sample.query, ...overrides };
      const [path, params] = toPathAndParams(sample.path, query);
      return { path, query: params, response: sample.compute(query) };
    };
  }, [name, path, query, compute]);
}

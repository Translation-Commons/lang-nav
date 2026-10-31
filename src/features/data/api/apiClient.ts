// 127.0.0.1, not localhost: browsers try IPv6 first and Django's dev server listens on IPv4.
const API_URL = import.meta.env.VITE_LANGNAV_API_URL ?? 'http://127.0.0.1:8000/api/v1';

/** Where tables that support the API get their rows from. */
export enum DataSource {
  Local = 'local',
  API = 'api',
}

const STORAGE_KEY = 'data-source';

/** API unless the viewer picked Local; tables without an apiPath stay local either way. */
export function getDataSource(): DataSource {
  try {
    if (localStorage.getItem(STORAGE_KEY) === DataSource.Local) return DataSource.Local;
  } catch {
    // Storage can be blocked; keep the default.
  }
  return DataSource.API;
}

export function setDataSource(source: DataSource): void {
  try {
    localStorage.setItem(STORAGE_KEY, source);
  } catch {
    // Without storage the choice cannot persist.
  }
}

const HEALTH_CHECK_TIMEOUT_MS = 5000;
let availability: Promise<boolean> | undefined;
let knownAvailable: boolean | undefined;

/** One GET /meta/ per page load decides whether API mode can be used; otherwise tables stay local. */
export function checkApiAvailable(): Promise<boolean> {
  availability ??= fetch(`${API_URL}/meta/`, {
    signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
  })
    .then((response) => response.ok)
    .catch(() => false)
    .then((ok) => {
      if (!ok) console.warn(`LangNav API not reachable at ${API_URL}; tables use local data.`);
      knownAvailable = ok;
      return ok;
    });
  return availability;
}

/** The health check's result once it has finished, so later mounts skip the wait. */
export function getKnownApiAvailability(): boolean | undefined {
  return knownAvailable;
}

/** For tests: forget the health check result. */
export function resetApiAvailability(): void {
  availability = undefined;
  knownAvailable = undefined;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** GET a JSON resource from the LangNav API. */
export async function apiGet<T>(path: string, query: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}/${path}${query ? `?${query}` : ''}`, { signal });
  if (!response.ok) {
    throw new ApiError(response.status, `${response.status} from ${path}`);
  }
  return (await response.json()) as T;
}

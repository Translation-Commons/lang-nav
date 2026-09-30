/** Where one endpoint's data comes from: computed from the bundled files, or the LangNav API. */
export enum EndpointSource {
  Files = 'files',
  API = 'api',
}

/** Whether the backend serves each endpoint's contract yet. Flip to true when it does. */
const LIVE = {
  languageList: false,
  territoryList: false, // backend is not yet serving this endpoint,
  writingSystemList: false, // but the frontend is ready to use it
  writingSystemDetail: false, // when it does
} satisfies Record<string, boolean>;

export type Endpoint = keyof typeof LIVE;

const STORAGE_KEY = 'data-source';

/** The Settings choice; API unless the viewer picked Files. */
export function getDataSource(): EndpointSource {
  try {
    if (localStorage.getItem(STORAGE_KEY) === EndpointSource.Files) return EndpointSource.Files;
  } catch {
    // Storage can be blocked; keep the default.
  }
  return EndpointSource.API;
}

/** Takes effect on the next page load, since each endpoint reads its source once. */
export function setDataSource(source: EndpointSource): void {
  try {
    localStorage.setItem(STORAGE_KEY, source);
  } catch {
    // Without storage the choice cannot persist.
  }
}

/** In API mode, live endpoints use the API and the rest stay on Files; Files mode uses Files everywhere. */
export function getEndpointSource(endpoint: Endpoint): EndpointSource {
  return getDataSource() === EndpointSource.API && LIVE[endpoint]
    ? EndpointSource.API
    : EndpointSource.Files;
}

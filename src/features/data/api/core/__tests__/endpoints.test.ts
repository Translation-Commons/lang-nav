import { afterEach, describe, expect, it } from 'vitest';

import { EndpointSource, getDataSource, getEndpointSource, setDataSource } from '../endpoints';

describe('getEndpointSource', () => {
  afterEach(() => localStorage.clear());

  it('defaults to API mode', () => {
    expect(getDataSource()).toBe(EndpointSource.API);
  });

  // TODO: restore once the backend is deployed and an endpoint in LIVE is true again.
  // it('uses the API in API mode only for live endpoints', () => {
  //   setDataSource(EndpointSource.API);
  //   expect(getEndpointSource('territoryList')).toBe(EndpointSource.API);
  //   expect(getEndpointSource('languageList')).toBe(EndpointSource.Files);
  // });

  it('uses Files everywhere in Files mode', () => {
    setDataSource(EndpointSource.Files);
    expect(getEndpointSource('territoryList')).toBe(EndpointSource.Files);
    expect(getEndpointSource('writingSystemDetail')).toBe(EndpointSource.Files);
  });

  it('treats an unknown stored value as the default', () => {
    localStorage.setItem('data-source', 'something');
    expect(getDataSource()).toBe(EndpointSource.API);
  });
});

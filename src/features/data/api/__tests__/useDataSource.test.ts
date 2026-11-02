import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DataSource, getDataSource, resetApiAvailability } from '../apiClient';
import { useEffectiveDataSource } from '../useDataSource';

const metaResponds = (ok: boolean) => vi.fn().mockResolvedValue({ ok, json: async () => ({}) });

describe('useEffectiveDataSource', () => {
  afterEach(() => {
    resetApiAvailability();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('is API when the backend answers', async () => {
    vi.stubGlobal('fetch', metaResponds(true));
    const { result } = renderHook(() => useEffectiveDataSource());
    await waitFor(() => expect(getDataSource()).toBe(DataSource.API));
    expect(result.current).toBe(DataSource.API);
  });

  it('shows Local when the backend is unreachable, without overwriting the saved choice', async () => {
    vi.stubGlobal('fetch', metaResponds(false));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useEffectiveDataSource());
    await waitFor(() => expect(result.current).toBe(DataSource.Local));
    expect(getDataSource()).toBe(DataSource.API); // a reload checks the backend again
  });

  it('stays Local without checking the backend when the viewer chose Local', () => {
    localStorage.setItem('data-source', 'local');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(renderHook(() => useEffectiveDataSource()).result.current).toBe(DataSource.Local);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

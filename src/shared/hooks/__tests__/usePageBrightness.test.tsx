import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePageBrightness } from '@shared/hooks/usePageBrightness';

function mockMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark') ? prefersDark : !prefersDark,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe('usePageBrightness', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('applies explicit dark class when OS prefers dark and preference is follow device', () => {
    mockMatchMedia(true);
    renderHook(() => usePageBrightness());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies light class when user forces light', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePageBrightness());
    act(() => result.current.setPreference('light'));
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePageBrightness } from '@shared/hooks/usePageBrightness';

/** Stubs prefers-color-scheme with a media query whose listeners actually fire. */
function mockDevicePrefersDark(initiallyDark: boolean) {
  const listeners = new Set<() => void>();
  let prefersDark = initiallyDark;

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return prefersDark;
      },
      addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
    })),
  );

  return function setDevicePrefersDark(next: boolean) {
    prefersDark = next;
    act(() => listeners.forEach((listener) => listener()));
  };
}

const htmlClasses = () => document.documentElement.classList;

describe('usePageBrightness', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    htmlClasses().remove('light', 'dark');
  });

  it('marks the page dark when following a device set to dark', () => {
    mockDevicePrefersDark(true);

    const { result } = renderHook(() => usePageBrightness());

    // The class has to be explicit -- Tailwind's dark: variant and the shadcn tokens
    // key off it, so relying on the media query alone leaves them in light colors.
    expect(htmlClasses().contains('dark')).toBe(true);
    expect(result.current.pageBrightness).toBe('dark');
  });

  it('marks the page light when following a device set to light', () => {
    mockDevicePrefersDark(false);

    const { result } = renderHook(() => usePageBrightness());

    expect(htmlClasses().contains('light')).toBe(true);
    expect(htmlClasses().contains('dark')).toBe(false);
    expect(result.current.pageBrightness).toBe('light');
  });

  it('lets an explicit preference override the device', () => {
    mockDevicePrefersDark(true);

    const { result } = renderHook(() => usePageBrightness());
    act(() => result.current.setPreference('light'));

    expect(htmlClasses().contains('light')).toBe(true);
    expect(htmlClasses().contains('dark')).toBe(false);
    expect(result.current.pageBrightness).toBe('light');
  });

  it('follows the device when it changes brightness mid-session', () => {
    const setDevicePrefersDark = mockDevicePrefersDark(false);
    const { result } = renderHook(() => usePageBrightness());

    setDevicePrefersDark(true);

    expect(htmlClasses().contains('dark')).toBe(true);
    expect(result.current.pageBrightness).toBe('dark');
  });

  it('still themes the page when the browser blocks site data', () => {
    mockDevicePrefersDark(true);
    // Blocking site data for an origin makes both reads and writes throw. This hook runs
    // in the app's outermost provider, so an escaping error takes down every page.
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });

    const { result } = renderHook(() => usePageBrightness());

    expect(result.current.preference).toBe('follow device');
    expect(result.current.pageBrightness).toBe('dark');
    expect(htmlClasses().contains('dark')).toBe(true);
  });

  it('ignores device changes once a preference is set', () => {
    const setDevicePrefersDark = mockDevicePrefersDark(false);
    const { result } = renderHook(() => usePageBrightness());
    act(() => result.current.setPreference('light'));

    setDevicePrefersDark(true);

    expect(htmlClasses().contains('light')).toBe(true);
    expect(result.current.pageBrightness).toBe('light');
  });
});

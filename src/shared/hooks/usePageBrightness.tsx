import { useEffect, useState } from 'react';

export type PageBrightnessPreference = 'light' | 'dark' | 'follow device';
export type PageBrightness = 'light' | 'dark';

export function usePageBrightness() {
  const getSystemPageBrightness = (): PageBrightness =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [preference, setPreference] = useState<PageBrightnessPreference>(() => {
    return (
      (localStorage.getItem('page-brightness') as PageBrightnessPreference | null) ??
      'follow device'
    );
  });

  const pageBrightness = preference === 'follow device' ? getSystemPageBrightness() : preference;

  // Apply the resolved theme to <html> (or <body>)
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    if (preference !== 'follow device') document.documentElement.classList.add(preference);
  }, [preference]);

  // Persist preference (not resolved value)
  useEffect(() => {
    localStorage.setItem('page-brightness', preference);
  }, [preference]);

  // Listen to storage changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'page-brightness') return;
      const newPref = (e.newValue as PageBrightnessPreference | null) ?? 'follow device';
      setPreference((prev) => (prev === newPref ? prev : newPref));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Intentionally no listener for system theme changes when preference is 'follow device'
  // Since the CSS will automatically pick up on it via the media query

  // Public API
  return {
    preference,
    pageBrightness,
    setPreference,
  };
}

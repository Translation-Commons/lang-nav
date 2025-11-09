import { useEffect, useState } from 'react';

export type PageBrightnessPreference = 'light' | 'dark' | 'follow device';
export type PageBrightness = 'light' | 'dark';

export function usePageBrightness() {
  const getSystemPageBrightness = (): PageBrightness =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [preference, setPreference] = useState<PageBrightnessPreference>(() => {
    return (localStorage.getItem('theme') as PageBrightnessPreference | null) ?? 'follow device';
  });

  const resolvedPageBrightness: PageBrightness =
    preference === 'follow device' ? getSystemPageBrightness() : preference;

  // Apply the resolved theme to <html> (or <body>)
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    if (preference !== 'follow device') document.documentElement.classList.add(preference);
  }, [preference]);

  // Persist preference (not resolved value)
  useEffect(() => {
    localStorage.setItem('theme', preference);
  }, [preference]);

  // Public API
  return {
    preference,
    resolvedPageBrightness,
    setPreference,
  };
}

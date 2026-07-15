import { useEffect, useState } from 'react';

export type PageBrightnessPreference = 'light' | 'dark' | 'follow device';
export type PageBrightness = 'light' | 'dark';

export type PageBrightnessParams = {
  preference: PageBrightnessPreference;
  pageBrightness: PageBrightness;
  setPreference: (newPref: PageBrightnessPreference) => void;
};

export function usePageBrightness(): PageBrightnessParams {
  const getSystemPageBrightness = (): PageBrightness =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [preference, setPreference] = useState<PageBrightnessPreference>(() => {
    return (
      (localStorage.getItem('page-brightness') as PageBrightnessPreference | null) ??
      'follow device'
    );
  });

  const pageBrightness = preference === 'follow device' ? getSystemPageBrightness() : preference;

  // Apply the resolved theme to <html>, always setting an explicit class.
  // When following the device, track OS changes live.
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved =
        preference === 'follow device' ? (mq.matches ? 'dark' : 'light') : preference;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
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

  // Public API
  return {
    preference,
    pageBrightness,
    setPreference,
  };
}
